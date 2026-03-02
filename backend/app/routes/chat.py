"""Chat endpoint for AI follow-up questions about analysis results."""

import asyncio
import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from ..config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User's question")
    context: Optional[dict] = Field(
        None, description="Current analysis result for context"
    )


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Answer follow-up questions about phishing analysis results."""
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Chat is unavailable — no Gemini API key configured.",
        )

    try:
        from google import genai

        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        # Build context section from analysis result
        context_section = ""
        if request.context:
            ctx = request.context
            context_section = f"""
CURRENT ANALYSIS CONTEXT:
- URL/Subject: {ctx.get('url') or ctx.get('subject', 'N/A')}
- Verdict: {'Suspicious' if ctx.get('is_suspicious') else 'Safe'}
- Risk Score: {ctx.get('risk_score', 'N/A')}/100
- Threat Level: {ctx.get('threat_level', 'N/A')}
- AI Explanation: {ctx.get('ai_explanation', 'N/A')}
- Risk Indicators: {', '.join(ind.get('indicator', '') for ind in (ctx.get('risk_indicators') or [])) or 'None'}
- Safety Recommendations: {'; '.join(ctx.get('safety_recommendations') or []) or 'N/A'}
"""

        prompt = f"""You are PhishGuard AI, a cybersecurity assistant that helps users understand phishing threats and online safety. You have access to the analysis results from PhishGuard's scanning tools.

Rules:
- Be concise and helpful (2-4 sentences unless the user asks for more detail).
- Reference specific details from the analysis context when available.
- If there is no analysis context, answer general phishing/cybersecurity questions.
- Never invent analysis data that isn't provided in the context.
- Use a friendly, professional tone.
{context_section}
USER QUESTION: {request.message}"""

        def _call():
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
            )
            return response.text

        reply = await asyncio.to_thread(_call)
        return ChatResponse(reply=reply.strip())

    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="google-genai package not installed.",
        )
    except Exception as e:
        logger.error(f"Chat endpoint failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to get AI response.")
