"""SMS/Smishing analysis endpoint."""

import re
import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..features.url_analyzer import URLAnalyzer
from ..features.linguistic import LinguisticAnalyzer
from ..services.gemini_service import get_gemini_analysis

logger = logging.getLogger(__name__)

router = APIRouter()

url_analyzer = URLAnalyzer()
linguistic_analyzer = LinguisticAnalyzer()


class SMSAnalyzeRequest(BaseModel):
    message: str = Field(..., min_length=1, description="The SMS message to analyze")


class SMSRiskIndicator(BaseModel):
    indicator: str
    detail: str
    severity: str  # low, medium, high, critical


class SMSAnalyzeResponse(BaseModel):
    message: str
    is_suspicious: bool
    risk_score: int
    threat_level: str
    risk_indicators: List[SMSRiskIndicator]
    extracted_urls: List[str]
    linguistic_features: dict
    ai_explanation: Optional[str] = None
    safety_recommendations: Optional[List[str]] = None


# Common SMS phishing patterns
CALLBACK_PATTERNS = [
    r"call\s+(?:us\s+)?(?:at\s+)?[\d\-\(\)\+]{7,}",
    r"text\s+(?:us\s+)?(?:at\s+)?[\d\-\(\)\+]{7,}",
    r"reply\s+(?:with|to)\s+",
    r"dial\s+[\d\-\(\)\+]{7,}",
]


def _extract_urls(text: str) -> List[str]:
    """Extract URLs from SMS text."""
    url_pattern = r'https?://[^\s<>"\']+|www\.[^\s<>"\']+'
    return re.findall(url_pattern, text, re.IGNORECASE)


def _extract_phone_numbers(text: str) -> List[str]:
    """Extract phone numbers from SMS text."""
    phone_pattern = r'[\+]?[\d\-\(\)\s]{7,15}'
    return [p.strip() for p in re.findall(phone_pattern, text) if len(re.sub(r'\D', '', p)) >= 7]


def _is_otp_message(text: str) -> bool:
    """Detect if a message is a legitimate OTP/2FA verification code."""
    text_lower = text.lower()
    otp_patterns = [
        r"(?:verification|security|auth(?:entication)?|login)\s+code\s+(?:is\s+)?\d{4,8}",
        r"(?:your|the)\s+(?:otp|one[- ]time\s+(?:password|code|pin))\s+(?:is\s+)?\d{4,8}",
        r"\b\d{4,8}\b\s+is\s+your\s+(?:verification|security|otp|one[- ]time)",
        r"(?:code|pin|otp)\s*:\s*\d{4,8}",
        r"(?:your|the)\s+code\s+is\s+\d{4,8}",
    ]
    has_code_pattern = any(re.search(p, text_lower) for p in otp_patterns)

    # Must also NOT contain URLs or requests to click/call
    has_no_url = not _extract_urls(text)
    has_no_action_request = not re.search(
        r"(?:click|tap|visit|open|go\s+to|call|reply\s+with)\s", text_lower
    )

    # A "do not share" or "ignore if not you" disclaimer is a strong legitimate signal
    has_disclaimer = bool(re.search(
        r"(?:do\s+not\s+share|don'?t\s+share|never\s+share|if\s+you\s+did\s+not\s+request|please\s+ignore)",
        text_lower,
    ))

    return has_code_pattern and has_no_url and (has_no_action_request or has_disclaimer)


@router.post("/analyze/sms", response_model=SMSAnalyzeResponse)
async def analyze_sms(request: SMSAnalyzeRequest):
    """Analyze an SMS message for smishing/phishing indicators."""
    try:
        message = request.message.strip()
        message_lower = message.lower()

        risk_indicators: List[SMSRiskIndicator] = []

        # Early detection: legitimate OTP/2FA messages
        is_otp = _is_otp_message(message)

        # 1. Extract and analyze URLs
        urls = _extract_urls(message)
        url_features = {}
        if urls:
            analysis_urls = []
            for u in urls:
                if not u.startswith(("http://", "https://")):
                    analysis_urls.append(f"https://{u}")
                else:
                    analysis_urls.append(u)
            url_features = url_analyzer.analyze(" ".join(analysis_urls))

            # Short message + URL is a classic smishing pattern
            if len(message) < 160 and len(urls) > 0:
                risk_indicators.append(SMSRiskIndicator(
                    indicator="Short Message with URL",
                    detail="Short SMS containing a URL is a common smishing pattern",
                    severity="medium",
                ))

            if url_features.get("has_shortened_url"):
                risk_indicators.append(SMSRiskIndicator(
                    indicator="Shortened URL",
                    detail="Message contains a shortened URL that hides the real destination",
                    severity="high",
                ))

            if url_features.get("has_ip_url"):
                risk_indicators.append(SMSRiskIndicator(
                    indicator="IP-based URL",
                    detail="Message contains a URL using an IP address instead of a domain",
                    severity="high",
                ))

            if url_features.get("has_suspicious_tld"):
                risk_indicators.append(SMSRiskIndicator(
                    indicator="Suspicious URL Domain",
                    detail="URL uses a top-level domain commonly associated with phishing",
                    severity="high",
                ))

            if url_features.get("has_brand_impersonation"):
                brand = url_features.get("impersonated_brand", "unknown")
                risk_indicators.append(SMSRiskIndicator(
                    indicator="Brand Impersonation in URL",
                    detail=f"URL appears to impersonate '{brand}'",
                    severity="critical",
                ))

        # 2. Linguistic analysis
        linguistic_features = linguistic_analyzer.analyze(message, message)

        # Skip urgency/threat flags for legitimate OTP messages
        if not is_otp:
            if linguistic_features.get("urgency_score", 0) > 0.1:
                risk_indicators.append(SMSRiskIndicator(
                    indicator="Urgency Language",
                    detail="Message uses urgent language to pressure immediate action",
                    severity="high",
                ))

            if linguistic_features.get("threat_score", 0) > 0.1:
                risk_indicators.append(SMSRiskIndicator(
                    indicator="Threat Language",
                    detail="Message contains threatening language about account suspension or penalties",
                    severity="high",
                ))

            if linguistic_features.get("reward_score", 0) > 0.1:
                risk_indicators.append(SMSRiskIndicator(
                    indicator="Reward/Prize Language",
                    detail="Message promises prizes, rewards, or free items — a common scam tactic",
                    severity="high",
                ))

        # 3. SMS-specific indicators
        # Callback number prompts
        if not is_otp:
            for pattern in CALLBACK_PATTERNS:
                if re.search(pattern, message_lower):
                    risk_indicators.append(SMSRiskIndicator(
                        indicator="Callback Number Request",
                        detail="Message asks you to call or text a number, which may be a premium-rate scam",
                        severity="medium",
                    ))
                    break

        # Personal info requests (skip for OTP — "expir" and "verify" are normal there)
        if not is_otp:
            personal_info_patterns = [
                r"(?:ssn|social\s+security)",
                r"(?:credit\s+card|card\s+number|cvv|expir)",
                r"(?:bank\s+account|routing\s+number)",
                r"(?:password|passcode|pin\s+number)",
                r"(?:verify\s+your\s+identity|confirm\s+your\s+(?:account|identity))",
            ]
            for pattern in personal_info_patterns:
                if re.search(pattern, message_lower):
                    risk_indicators.append(SMSRiskIndicator(
                        indicator="Personal Information Request",
                        detail="Message requests sensitive personal or financial information",
                        severity="critical",
                    ))
                    break

        # Impersonation of known services
        if not is_otp:
            impersonation_keywords = [
                "your bank", "your account", "irs", "tax refund",
                "delivery failed", "package", "tracking", "usps", "fedex", "ups",
                "apple id", "google account", "microsoft",
            ]
            for keyword in impersonation_keywords:
                if keyword in message_lower:
                    risk_indicators.append(SMSRiskIndicator(
                        indicator="Service Impersonation",
                        detail=f"Message appears to impersonate a known service or organization ('{keyword}')",
                        severity="medium",
                    ))
                    break

        # Calculate risk score
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

        # Gemini AI explanation
        ai_explanation = None
        safety_recommendations = None
        try:
            indicators_for_gemini = [
                {"indicator": ind.indicator, "detail": ind.detail, "severity": ind.severity}
                for ind in risk_indicators
            ]
            gemini_result = await get_gemini_analysis(
                subject="SMS/Smishing Analysis",
                body=f"SMS Message: {message}",
                prediction="suspicious" if is_suspicious else "safe",
                confidence=risk_score / 100.0,
                risk_score=risk_score,
                threat_level=threat_level,
                risk_indicators=indicators_for_gemini,
            )
            ai_explanation = gemini_result.ai_explanation
            safety_recommendations = gemini_result.safety_recommendations
        except Exception as e:
            logger.warning(f"Gemini analysis failed for SMS: {e}")

        return SMSAnalyzeResponse(
            message=message,
            is_suspicious=is_suspicious,
            risk_score=risk_score,
            threat_level=threat_level,
            risk_indicators=risk_indicators,
            extracted_urls=urls,
            linguistic_features=linguistic_features,
            ai_explanation=ai_explanation,
            safety_recommendations=safety_recommendations,
        )

    except Exception as e:
        logger.error(f"SMS analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"SMS analysis failed: {str(e)}")
