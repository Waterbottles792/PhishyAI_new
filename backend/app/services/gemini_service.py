"""Google Gemini AI service for email analysis explanations."""

import asyncio
import json
import logging
from dataclasses import dataclass
from typing import Optional, List

from ..config import settings

logger = logging.getLogger(__name__)


@dataclass
class GeminiResult:
    """Result from Gemini AI analysis."""
    ai_explanation: Optional[str] = None
    safety_recommendations: Optional[List[str]] = None
    email_category: Optional[str] = None
    category_confidence: Optional[float] = None


async def get_gemini_analysis(
    subject: str,
    body: str,
    prediction: str,
    confidence: float,
    risk_score: int,
    threat_level: str,
    risk_indicators: list,
) -> GeminiResult:
    """
    Get AI-powered analysis from Google Gemini.

    Combines three features in a single API call:
    1. Plain English explanation of the analysis
    2. Safety recommendations
    3. Zero-shot email category classification

    Returns GeminiResult with all None fields if no API key or call fails.
    """
    if not settings.GEMINI_API_KEY:
        return GeminiResult()

    try:
        from google import genai

        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        # Build indicators summary
        indicators_text = "\n".join(
            f"- {ind.indicator}: {ind.detail} (severity: {ind.severity})"
            if hasattr(ind, "indicator")
            else f"- {ind.get('indicator', 'Unknown')}: {ind.get('detail', '')} (severity: {ind.get('severity', 'unknown')})"
            for ind in risk_indicators[:10]
        )

        prompt = f"""You are a cybersecurity expert analyzing an email for phishing threats.

EMAIL SUBJECT: {subject or '(no subject)'}
EMAIL BODY:
{body[:3000]}

ML ANALYSIS RESULTS:
- Prediction: {prediction}
- Confidence: {confidence:.1%}
- Risk Score: {risk_score}/100
- Threat Level: {threat_level}
- Risk Indicators:
{indicators_text or '  None detected'}

Respond with ONLY valid JSON (no markdown, no code fences) in this exact format:
{{
  "ai_explanation": "A clear, 2-3 sentence plain English explanation of why this email was classified as {prediction}. Reference specific elements from the email that support the classification.",
  "safety_recommendations": ["recommendation 1", "recommendation 2", "recommendation 3", "recommendation 4", "recommendation 5"],
  "email_category": "one of: credential_phishing, financial_scam, malware_delivery, social_engineering, business_email_compromise, spam, newsletter, transactional, personal, professional, notification, other",
  "category_confidence": 0.85
}}

Guidelines:
- ai_explanation: Be specific about what in the email triggered the classification. Mention actual words, URLs, or patterns found.
- safety_recommendations: Provide 3-5 actionable safety tips relevant to THIS specific email. Be practical and specific.
- email_category: Classify the email's primary intent/type from the list above.
- category_confidence: Your confidence in the category (0.0 to 1.0).
"""

        # Run sync SDK call off the event loop
        def _call_gemini():
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
            )
            return response.text

        raw_response = await asyncio.to_thread(_call_gemini)

        # Parse JSON response — strip potential markdown code fences
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()

        parsed = json.loads(cleaned)

        return GeminiResult(
            ai_explanation=parsed.get("ai_explanation"),
            safety_recommendations=parsed.get("safety_recommendations"),
            email_category=parsed.get("email_category"),
            category_confidence=parsed.get("category_confidence"),
        )

    except ImportError:
        logger.warning("google-genai package not installed. Skipping Gemini analysis.")
        return GeminiResult()
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini response as JSON: {e}")
        return GeminiResult()
    except Exception as e:
        logger.error(f"Gemini API call failed: {e}")
        return GeminiResult()
