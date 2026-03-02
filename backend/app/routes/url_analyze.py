"""URL analysis endpoint."""

import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..features.url_analyzer import URLAnalyzer
from ..services.gemini_service import get_gemini_analysis

logger = logging.getLogger(__name__)

router = APIRouter()

url_analyzer = URLAnalyzer()


class URLAnalyzeRequest(BaseModel):
    url: str = Field(..., min_length=1, description="The URL to analyze")


class URLRiskIndicator(BaseModel):
    indicator: str
    detail: str
    severity: str  # low, medium, high, critical


class URLAnalyzeResponse(BaseModel):
    url: str
    is_suspicious: bool
    risk_score: int
    threat_level: str
    risk_indicators: List[URLRiskIndicator]
    url_features: dict
    ai_explanation: Optional[str] = None
    safety_recommendations: Optional[List[str]] = None


@router.post("/analyze/url", response_model=URLAnalyzeResponse)
async def analyze_url(request: URLAnalyzeRequest):
    """Analyze a URL for phishing/suspicious indicators."""
    try:
        url = request.url.strip()

        # Ensure URL has a scheme for analysis
        analysis_text = url
        if not url.startswith(("http://", "https://")):
            analysis_text = f"https://{url}"

        # Run URL analyzer
        features = url_analyzer.analyze(analysis_text)

        # Build risk indicators from features
        risk_indicators: List[URLRiskIndicator] = []

        if features.get("has_ip_url"):
            risk_indicators.append(URLRiskIndicator(
                indicator="IP-based URL",
                detail="URL uses an IP address instead of a domain name, commonly used in phishing",
                severity="high",
            ))

        if features.get("has_shortened_url"):
            risk_indicators.append(URLRiskIndicator(
                indicator="Shortened URL",
                detail="URL uses a shortening service which can hide the real destination",
                severity="high",
            ))

        if features.get("has_suspicious_tld"):
            risk_indicators.append(URLRiskIndicator(
                indicator="Suspicious TLD",
                detail="URL uses a top-level domain commonly associated with phishing",
                severity="high",
            ))

        if not features.get("has_https"):
            risk_indicators.append(URLRiskIndicator(
                indicator="No HTTPS",
                detail="URL does not use HTTPS encryption, data sent may not be secure",
                severity="medium",
            ))

        if features.get("has_at_in_url"):
            risk_indicators.append(URLRiskIndicator(
                indicator="@ Symbol in URL",
                detail="URL contains @ symbol which can be used to disguise the real destination",
                severity="high",
            ))

        url_length = features.get("url_length_max", 0)
        if url_length > 75:
            risk_indicators.append(URLRiskIndicator(
                indicator="Excessively Long URL",
                detail=f"URL is {url_length} characters long, which may be used to hide suspicious elements",
                severity="medium",
            ))

        subdomain_count = features.get("subdomain_count_max", 0)
        if subdomain_count > 2:
            risk_indicators.append(URLRiskIndicator(
                indicator="Many Subdomains",
                detail=f"URL has {subdomain_count} subdomains, which can indicate domain spoofing",
                severity="medium",
            ))

        if features.get("url_domain_mismatch"):
            risk_indicators.append(URLRiskIndicator(
                indicator="Domain Mismatch",
                detail="The displayed link text doesn't match the actual URL destination",
                severity="critical",
            ))

        if features.get("has_brand_impersonation"):
            brand = features.get("impersonated_brand", "unknown")
            risk_indicators.append(URLRiskIndicator(
                indicator="Brand Impersonation",
                detail=f"URL appears to impersonate '{brand}' using typosquatting or character substitution",
                severity="critical",
            ))

        if features.get("has_suspicious_keywords"):
            keywords = features.get("suspicious_keywords_found", [])
            risk_indicators.append(URLRiskIndicator(
                indicator="Suspicious Keywords in Domain",
                detail=f"Domain contains phishing-related keywords: {', '.join(keywords)}",
                severity="high",
            ))

        if features.get("has_excessive_hyphens"):
            risk_indicators.append(URLRiskIndicator(
                indicator="Excessive Hyphens",
                detail="Domain contains many hyphens, a common technique to mimic legitimate domains",
                severity="medium",
            ))

        # Calculate risk score (0-100)
        severity_weights = {"critical": 30, "high": 20, "medium": 10, "low": 5}
        risk_score = min(
            sum(severity_weights.get(ind.severity, 0) for ind in risk_indicators),
            100,
        )

        # Determine threat level
        if risk_score >= 70:
            threat_level = "critical"
        elif risk_score >= 45:
            threat_level = "high"
        elif risk_score >= 20:
            threat_level = "medium"
        else:
            threat_level = "low"

        is_suspicious = risk_score >= 20

        # Optional Gemini AI explanation
        ai_explanation = None
        safety_recommendations = None
        try:
            indicators_for_gemini = [
                {"indicator": ind.indicator, "detail": ind.detail, "severity": ind.severity}
                for ind in risk_indicators
            ]
            gemini_result = await get_gemini_analysis(
                subject=f"URL Analysis: {url}",
                body=f"Analyzing URL: {url}\nFeatures: {features}",
                prediction="suspicious" if is_suspicious else "safe",
                confidence=risk_score / 100.0,
                risk_score=risk_score,
                threat_level=threat_level,
                risk_indicators=indicators_for_gemini,
            )
            ai_explanation = gemini_result.ai_explanation
            safety_recommendations = gemini_result.safety_recommendations
        except Exception as e:
            logger.warning(f"Gemini analysis failed for URL: {e}")

        return URLAnalyzeResponse(
            url=url,
            is_suspicious=is_suspicious,
            risk_score=risk_score,
            threat_level=threat_level,
            risk_indicators=risk_indicators,
            url_features=features,
            ai_explanation=ai_explanation,
            safety_recommendations=safety_recommendations,
        )

    except Exception as e:
        logger.error(f"URL analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"URL analysis failed: {str(e)}")
