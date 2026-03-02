"""Phishing training/quiz mode endpoints."""

import asyncio
import json
import logging
import uuid
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory cache for quiz answers (TTL = 1 hour)
try:
    from cachetools import TTLCache
    _quiz_cache: TTLCache = TTLCache(maxsize=1000, ttl=3600)
except ImportError:
    logger.warning("cachetools not installed. Using plain dict for quiz cache.")
    _quiz_cache: dict = {}


class TrainingGenerateRequest(BaseModel):
    difficulty: str = Field(default="medium", description="Difficulty: easy, medium, hard")


class TrainingGenerateResponse(BaseModel):
    quiz_id: str
    email_subject: str
    email_body: str
    email_sender: str
    difficulty: str


class TrainingCheckRequest(BaseModel):
    quiz_id: str = Field(..., description="The quiz ID from the generate response")
    user_answer: str = Field(..., description="User's guess: 'phishing' or 'legitimate'")


class QuizIndicator(BaseModel):
    indicator: str
    detail: str
    severity: str


class TrainingCheckResponse(BaseModel):
    correct: bool
    actual_answer: str
    explanation: str
    indicators: List[QuizIndicator]
    difficulty: str


@router.post("/training/generate", response_model=TrainingGenerateResponse)
async def generate_training_email(request: TrainingGenerateRequest):
    """Generate a realistic email for phishing training."""
    difficulty = request.difficulty.lower()
    if difficulty not in ("easy", "medium", "hard"):
        difficulty = "medium"

    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Gemini API key required for training mode. Set GEMINI_API_KEY in your .env file."
        )

    try:
        from google import genai

        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        difficulty_desc = {
            "easy": "Make it obvious — clear grammar errors, suspicious sender, urgent language, fake rewards. A beginner should spot it if it's phishing.",
            "medium": "Make it moderately convincing — subtle red flags, plausible sender, some urgency but not extreme. Requires some attention to spot if phishing.",
            "hard": "Make it very convincing — professional language, realistic sender, minimal obvious red flags. Even experienced users might be fooled if phishing.",
        }

        prompt = f"""You are a cybersecurity training tool. Generate a realistic email that is RANDOMLY either a phishing email or a legitimate email (roughly 50/50 chance).

Difficulty level: {difficulty}
{difficulty_desc[difficulty]}

Respond with ONLY valid JSON (no markdown, no code fences):
{{
  "is_phishing": true or false,
  "email_sender": "Full Name <email@domain.com>",
  "email_subject": "The email subject line",
  "email_body": "The full email body text (2-4 paragraphs, use \\n for newlines)",
  "explanation": "Detailed explanation of why this is phishing/legitimate. List specific red flags or trust signals.",
  "indicators": [
    {{"indicator": "name", "detail": "description", "severity": "low/medium/high/critical"}}
  ]
}}

Make the email realistic and educational. If phishing, include realistic social engineering tactics appropriate for the difficulty level."""

        def _call_gemini():
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
            )
            return response.text

        raw_response = await asyncio.to_thread(_call_gemini)

        # Parse JSON
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()

        parsed = json.loads(cleaned)

        quiz_id = str(uuid.uuid4())

        # Store answer in cache
        _quiz_cache[quiz_id] = {
            "is_phishing": parsed.get("is_phishing", True),
            "explanation": parsed.get("explanation", ""),
            "indicators": parsed.get("indicators", []),
            "difficulty": difficulty,
        }

        return TrainingGenerateResponse(
            quiz_id=quiz_id,
            email_subject=parsed.get("email_subject", ""),
            email_body=parsed.get("email_body", ""),
            email_sender=parsed.get("email_sender", ""),
            difficulty=difficulty,
        )

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini training response: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate training email. Please try again.")
    except ImportError:
        raise HTTPException(status_code=503, detail="google-genai package not installed.")
    except Exception as e:
        logger.error(f"Training generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Training generation failed: {str(e)}")


@router.post("/training/check", response_model=TrainingCheckResponse)
async def check_training_answer(request: TrainingCheckRequest):
    """Check the user's answer for a training quiz."""
    quiz_data = _quiz_cache.get(request.quiz_id)

    if not quiz_data:
        raise HTTPException(
            status_code=404,
            detail="Quiz not found or expired. Please generate a new training email."
        )

    is_phishing = quiz_data["is_phishing"]
    actual_answer = "phishing" if is_phishing else "legitimate"
    user_answer = request.user_answer.lower().strip()

    correct = (user_answer == actual_answer)

    indicators = [
        QuizIndicator(
            indicator=ind.get("indicator", ""),
            detail=ind.get("detail", ""),
            severity=ind.get("severity", "medium"),
        )
        for ind in quiz_data.get("indicators", [])
    ]

    return TrainingCheckResponse(
        correct=correct,
        actual_answer=actual_answer,
        explanation=quiz_data.get("explanation", ""),
        indicators=indicators,
        difficulty=quiz_data.get("difficulty", "medium"),
    )
