"""Email header analysis endpoint."""

import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..features.header_analyzer import HeaderAnalyzer
from ..services.gemini_service import get_gemini_analysis

logger = logging.getLogger(__name__)

router = APIRouter()

header_analyzer = HeaderAnalyzer()


class HeaderAnalyzeRequest(BaseModel):
    raw_headers: str = Field(..., min_length=1, description="Raw email headers to analyze")


class HeaderRiskIndicator(BaseModel):
    indicator: str
    detail: str
    severity: str


class HeaderAnalyzeResponse(BaseModel):
    is_suspicious: bool
    risk_score: int
    threat_level: str
    risk_indicators: List[HeaderRiskIndicator]
    from_address: str
    reply_to: str
    return_path: str
    sender_ip: str
    authentication_results: dict
    received_hops: list
    reply_to_mismatch: bool
    ai_explanation: Optional[str] = None
    safety_recommendations: Optional[List[str]] = None


@router.post("/analyze/headers", response_model=HeaderAnalyzeResponse)
async def analyze_headers(request: HeaderAnalyzeRequest):
    """Analyze raw email headers for security indicators."""
    try:
        raw = request.raw_headers.strip()
        parsed = header_analyzer.analyze(raw)

        risk_indicators: List[HeaderRiskIndicator] = []

        # SPF checks
        if parsed.spf_result in ("fail", "hardfail"):
            risk_indicators.append(HeaderRiskIndicator(
                indicator="SPF Fail",
                detail="SPF authentication failed — the sending server is not authorized to send on behalf of this domain",
                severity="high",
            ))
        elif parsed.spf_result == "softfail":
            risk_indicators.append(HeaderRiskIndicator(
                indicator="SPF Softfail",
                detail="SPF returned softfail — the sending server may not be authorized",
                severity="medium",
            ))

        # DKIM checks
        if parsed.dkim_result == "fail":
            risk_indicators.append(HeaderRiskIndicator(
                indicator="DKIM Fail",
                detail="DKIM signature verification failed — the message may have been tampered with",
                severity="high",
            ))
        elif parsed.dkim_result == "none":
            risk_indicators.append(HeaderRiskIndicator(
                indicator="No DKIM Signature",
                detail="No DKIM signature found — email authenticity cannot be verified",
                severity="low",
            ))

        # DMARC checks
        if parsed.dmarc_result == "fail":
            risk_indicators.append(HeaderRiskIndicator(
                indicator="DMARC Fail",
                detail="DMARC policy check failed — this email likely fails the sender's authentication policy",
                severity="high",
            ))
        elif parsed.dmarc_result == "none":
            risk_indicators.append(HeaderRiskIndicator(
                indicator="No DMARC Policy",
                detail="No DMARC record found for the sender's domain",
                severity="low",
            ))

        # Reply-To mismatch
        if parsed.reply_to_mismatch:
            risk_indicators.append(HeaderRiskIndicator(
                indicator="Reply-To Mismatch",
                detail=f"Reply-To address ({parsed.reply_to}) uses a different domain than From ({parsed.from_address})",
                severity="medium",
            ))

        # Excessive routing hops
        hop_count = len(parsed.received_hops)
        if hop_count > 7:
            risk_indicators.append(HeaderRiskIndicator(
                indicator="Excessive Routing Hops",
                detail=f"Email passed through {hop_count} servers, which could indicate relay abuse or attempted obfuscation",
                severity="low",
            ))

        # Return-Path mismatch
        if parsed.return_path and parsed.from_address:
            from_domain = parsed.from_address.split("@")[-1].strip(">").lower() if "@" in parsed.from_address else ""
            return_domain = parsed.return_path.split("@")[-1].strip(">").lower() if "@" in parsed.return_path else ""
            if from_domain and return_domain and from_domain != return_domain:
                risk_indicators.append(HeaderRiskIndicator(
                    indicator="Return-Path Mismatch",
                    detail=f"Return-Path domain ({return_domain}) differs from From domain ({from_domain})",
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
                subject="Email Header Analysis",
                body=f"Analyzing email headers.\nFrom: {parsed.from_address}\nReply-To: {parsed.reply_to}\nSPF: {parsed.spf_result}\nDKIM: {parsed.dkim_result}\nDMARC: {parsed.dmarc_result}\nHops: {hop_count}",
                prediction="suspicious" if is_suspicious else "safe",
                confidence=risk_score / 100.0,
                risk_score=risk_score,
                threat_level=threat_level,
                risk_indicators=indicators_for_gemini,
            )
            ai_explanation = gemini_result.ai_explanation
            safety_recommendations = gemini_result.safety_recommendations
        except Exception as e:
            logger.warning(f"Gemini analysis failed for headers: {e}")

        return HeaderAnalyzeResponse(
            is_suspicious=is_suspicious,
            risk_score=risk_score,
            threat_level=threat_level,
            risk_indicators=risk_indicators,
            from_address=parsed.from_address,
            reply_to=parsed.reply_to,
            return_path=parsed.return_path,
            sender_ip=parsed.sender_ip,
            authentication_results=parsed.authentication_results,
            received_hops=parsed.received_hops,
            reply_to_mismatch=parsed.reply_to_mismatch,
            ai_explanation=ai_explanation,
            safety_recommendations=safety_recommendations,
        )

    except Exception as e:
        logger.error(f"Header analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Header analysis failed: {str(e)}")
