"""Domain/brand monitoring endpoint."""

import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..features.domain_monitor import generate_lookalikes, check_dns_resolution
from ..services.gemini_service import get_gemini_analysis

logger = logging.getLogger(__name__)

router = APIRouter()


class DomainAnalyzeRequest(BaseModel):
    domain: str = Field(..., min_length=3, description="Domain to monitor (e.g., google.com)")


class LookalikeDomainResult(BaseModel):
    domain: str
    technique: str
    similarity: float
    dns_resolved: bool
    risk_level: str


class DomainRiskIndicator(BaseModel):
    indicator: str
    detail: str
    severity: str


class DomainAnalyzeResponse(BaseModel):
    domain: str
    total_variants: int
    resolved_count: int
    high_risk_count: int
    lookalike_domains: List[LookalikeDomainResult]
    risk_indicators: List[DomainRiskIndicator]
    ai_explanation: Optional[str] = None
    safety_recommendations: Optional[List[str]] = None


@router.post("/analyze/domain", response_model=DomainAnalyzeResponse)
async def analyze_domain(request: DomainAnalyzeRequest):
    """Analyze a domain for potential typosquatting and lookalike threats."""
    try:
        domain = request.domain.strip().lower()

        # Remove any protocol prefix
        if "://" in domain:
            domain = domain.split("://", 1)[1]
        # Remove trailing slash/path
        domain = domain.split("/")[0]

        # Validate domain format
        if "." not in domain:
            raise HTTPException(status_code=400, detail="Invalid domain format. Example: google.com")

        # Generate lookalike variants
        variants = generate_lookalikes(domain, max_variants=50)

        # Check DNS resolution
        checked_variants = await check_dns_resolution(variants)

        # Build results
        lookalike_results = [
            LookalikeDomainResult(
                domain=v.domain,
                technique=v.technique,
                similarity=round(v.similarity, 2),
                dns_resolved=v.dns_resolved,
                risk_level=v.risk_level,
            )
            for v in checked_variants
        ]

        # Sort: resolved first, then by similarity
        lookalike_results.sort(key=lambda x: (-x.dns_resolved, -x.similarity))

        resolved_count = sum(1 for v in lookalike_results if v.dns_resolved)
        high_risk_count = sum(1 for v in lookalike_results if v.risk_level == "high")

        # Build risk indicators
        risk_indicators: List[DomainRiskIndicator] = []

        if resolved_count > 0:
            risk_indicators.append(DomainRiskIndicator(
                indicator="Active Lookalike Domains",
                detail=f"{resolved_count} lookalike domain(s) are currently resolving to active servers",
                severity="high" if resolved_count > 3 else "medium",
            ))

        if high_risk_count > 0:
            risk_indicators.append(DomainRiskIndicator(
                indicator="High-Risk Domains Found",
                detail=f"{high_risk_count} domains with high similarity are actively registered",
                severity="critical" if high_risk_count > 2 else "high",
            ))

        homoglyph_resolved = sum(1 for v in checked_variants if v.dns_resolved and v.technique == "homoglyph")
        if homoglyph_resolved > 0:
            risk_indicators.append(DomainRiskIndicator(
                indicator="Homoglyph Attacks",
                detail=f"{homoglyph_resolved} domain(s) using character substitution are active",
                severity="high",
            ))

        tld_resolved = sum(1 for v in checked_variants if v.dns_resolved and v.technique == "tld_variation")
        if tld_resolved > 0:
            risk_indicators.append(DomainRiskIndicator(
                indicator="TLD Squatting",
                detail=f"{tld_resolved} alternate TLD(s) of your domain are registered",
                severity="medium",
            ))

        # Calculate risk score
        severity_weights = {"critical": 30, "high": 20, "medium": 10, "low": 5}
        risk_score = min(
            sum(severity_weights.get(ind.severity, 0) for ind in risk_indicators),
            100,
        )

        if risk_score >= 70:
            threat_level = "critical"
        elif risk_score >= 45:
            threat_level = "high"
        elif risk_score >= 20:
            threat_level = "medium"
        else:
            threat_level = "low"

        # Gemini AI explanation
        ai_explanation = None
        safety_recommendations = None
        try:
            indicators_for_gemini = [
                {"indicator": ind.indicator, "detail": ind.detail, "severity": ind.severity}
                for ind in risk_indicators
            ]
            resolved_domains = [v.domain for v in checked_variants if v.dns_resolved][:10]
            gemini_result = await get_gemini_analysis(
                subject=f"Domain Monitoring: {domain}",
                body=f"Monitoring domain: {domain}\nTotal variants checked: {len(checked_variants)}\nResolved: {resolved_count}\nActive lookalikes: {', '.join(resolved_domains) if resolved_domains else 'None'}",
                prediction="suspicious" if risk_score >= 20 else "safe",
                confidence=risk_score / 100.0,
                risk_score=risk_score,
                threat_level=threat_level,
                risk_indicators=indicators_for_gemini,
            )
            ai_explanation = gemini_result.ai_explanation
            safety_recommendations = gemini_result.safety_recommendations
        except Exception as e:
            logger.warning(f"Gemini analysis failed for domain: {e}")

        return DomainAnalyzeResponse(
            domain=domain,
            total_variants=len(checked_variants),
            resolved_count=resolved_count,
            high_risk_count=high_risk_count,
            lookalike_domains=lookalike_results,
            risk_indicators=risk_indicators,
            ai_explanation=ai_explanation,
            safety_recommendations=safety_recommendations,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Domain analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Domain analysis failed: {str(e)}")
