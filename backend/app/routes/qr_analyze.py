"""QR code analysis endpoint."""

import logging
from typing import List, Optional

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from ..features.qr_decoder import decode_qr_image
from ..features.url_analyzer import URLAnalyzer
from ..services.gemini_service import get_gemini_analysis

logger = logging.getLogger(__name__)

router = APIRouter()

url_analyzer = URLAnalyzer()

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB

ALLOWED_IMAGE_TYPES = {
    "image/png", "image/jpeg", "image/jpg", "image/gif",
    "image/bmp", "image/webp", "image/tiff",
}


class QRRiskIndicator(BaseModel):
    indicator: str
    detail: str
    severity: str


class QRAnalyzeResponse(BaseModel):
    decoded_data: str
    data_type: str
    is_suspicious: bool
    risk_score: int
    threat_level: str
    risk_indicators: List[QRRiskIndicator]
    url_features: Optional[dict] = None
    ai_explanation: Optional[str] = None
    safety_recommendations: Optional[List[str]] = None


@router.post("/analyze/qr", response_model=QRAnalyzeResponse)
async def analyze_qr(file: UploadFile = File(...)):
    """Analyze a QR code image for phishing/malicious URLs."""
    try:
        content = await file.read()
        file_size = len(content)

        if file_size > MAX_IMAGE_SIZE:
            raise HTTPException(status_code=413, detail="Image too large. Maximum size is 10 MB.")

        if file_size == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded.")

        # Decode QR code
        try:
            results = decode_qr_image(content)
        except RuntimeError as e:
            raise HTTPException(status_code=500, detail=str(e))

        if not results:
            raise HTTPException(status_code=400, detail="No QR code found in the image. Please upload a clear QR code image.")

        # Use the first decoded result
        qr_result = results[0]
        decoded_data = qr_result.data
        data_type = qr_result.type

        risk_indicators: List[QRRiskIndicator] = []
        url_features = None

        # QR-specific indicators
        risk_indicators.append(QRRiskIndicator(
            indicator="QR Code Source",
            detail="Data was embedded in a QR code — always verify the source before acting on QR code content",
            severity="low",
        ))

        if data_type == "url":
            # Run full URL analysis
            analysis_url = decoded_data
            if not analysis_url.startswith(("http://", "https://")):
                analysis_url = f"https://{analysis_url}"

            url_features = url_analyzer.analyze(analysis_url)

            # Map URL features to risk indicators
            if url_features.get("has_ip_url"):
                risk_indicators.append(QRRiskIndicator(
                    indicator="IP-based URL",
                    detail="QR code points to an IP address instead of a domain name",
                    severity="high",
                ))

            if url_features.get("has_shortened_url"):
                risk_indicators.append(QRRiskIndicator(
                    indicator="Shortened URL",
                    detail="QR code contains a shortened URL hiding the real destination",
                    severity="high",
                ))

            if url_features.get("has_suspicious_tld"):
                risk_indicators.append(QRRiskIndicator(
                    indicator="Suspicious TLD",
                    detail="URL uses a top-level domain commonly associated with phishing",
                    severity="high",
                ))

            if not url_features.get("has_https"):
                risk_indicators.append(QRRiskIndicator(
                    indicator="No HTTPS",
                    detail="URL does not use HTTPS encryption",
                    severity="medium",
                ))

            if url_features.get("has_brand_impersonation"):
                brand = url_features.get("impersonated_brand", "unknown")
                risk_indicators.append(QRRiskIndicator(
                    indicator="Brand Impersonation",
                    detail=f"URL appears to impersonate '{brand}'",
                    severity="critical",
                ))

            if url_features.get("has_suspicious_keywords"):
                keywords = url_features.get("suspicious_keywords_found", [])
                risk_indicators.append(QRRiskIndicator(
                    indicator="Suspicious Keywords",
                    detail=f"URL contains phishing-related keywords: {', '.join(keywords)}",
                    severity="high",
                ))

            if url_features.get("has_at_in_url"):
                risk_indicators.append(QRRiskIndicator(
                    indicator="@ Symbol in URL",
                    detail="URL contains @ symbol which can disguise the real destination",
                    severity="high",
                ))

        else:
            # Non-URL data in QR — less common for phishing but still flag
            if any(keyword in decoded_data.lower() for keyword in ["password", "ssn", "credit card", "pin"]):
                risk_indicators.append(QRRiskIndicator(
                    indicator="Sensitive Data Request",
                    detail="QR code data references sensitive information",
                    severity="high",
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

        is_suspicious = risk_score >= 20

        # Gemini AI explanation
        ai_explanation = None
        safety_recommendations = None
        try:
            indicators_for_gemini = [
                {"indicator": ind.indicator, "detail": ind.detail, "severity": ind.severity}
                for ind in risk_indicators
            ]
            gemini_result = await get_gemini_analysis(
                subject="QR Code Analysis",
                body=f"QR Code decoded data: {decoded_data}\nData type: {data_type}",
                prediction="suspicious" if is_suspicious else "safe",
                confidence=risk_score / 100.0,
                risk_score=risk_score,
                threat_level=threat_level,
                risk_indicators=indicators_for_gemini,
            )
            ai_explanation = gemini_result.ai_explanation
            safety_recommendations = gemini_result.safety_recommendations
        except Exception as e:
            logger.warning(f"Gemini analysis failed for QR: {e}")

        return QRAnalyzeResponse(
            decoded_data=decoded_data,
            data_type=data_type,
            is_suspicious=is_suspicious,
            risk_score=risk_score,
            threat_level=threat_level,
            risk_indicators=risk_indicators,
            url_features=url_features,
            ai_explanation=ai_explanation,
            safety_recommendations=safety_recommendations,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"QR analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"QR analysis failed: {str(e)}")
