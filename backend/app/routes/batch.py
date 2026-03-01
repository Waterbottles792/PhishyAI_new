"""Batch email analysis endpoint."""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from ..schemas.request import BatchAnalyzeRequest, AnalyzeRequest
from ..schemas.response import BatchAnalyzeResponse, AnalyzeResponse
from ..database.db import get_db
from .analyze import analyze_email

router = APIRouter()


@router.post("/batch", response_model=BatchAnalyzeResponse)
async def batch_analyze_emails(
    request: BatchAnalyzeRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze multiple emails in batch.

    Args:
        request: Batch analysis request with list of emails
        db: Database session

    Returns:
        Batch analysis response with results and summary
    """
    try:
        results: List[AnalyzeResponse] = []

        # Analyze each email
        for email_request in request.emails:
            # Use the model from batch request if not specified in individual email
            if not email_request.model_name:
                email_request.model_name = request.model_name

            # Analyze email
            result = await analyze_email(email_request, db)
            results.append(result)

        # Calculate summary statistics
        total = len(results)
        phishing_count = sum(1 for r in results if r.prediction == "phishing")
        legitimate_count = total - phishing_count
        avg_confidence = sum(r.confidence for r in results) / total if total > 0 else 0.0

        summary = {
            "total": total,
            "phishing_count": phishing_count,
            "legitimate_count": legitimate_count,
            "avg_confidence": avg_confidence,
            "phishing_rate": phishing_count / total if total > 0 else 0.0
        }

        return BatchAnalyzeResponse(
            results=results,
            summary=summary
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch analysis error: {str(e)}")
