"""Analysis history endpoints."""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json

from ..database.db import (
    get_db,
    get_analysis_history,
    get_analysis_by_id,
    delete_analysis
)

router = APIRouter()


@router.get("/history")
async def get_history(
    limit: int = Query(default=50, ge=1, le=500, description="Maximum number of results"),
    offset: int = Query(default=0, ge=0, description="Offset for pagination"),
    db: Session = Depends(get_db)
):
    """
    Get analysis history.

    Args:
        limit: Maximum number of results
        offset: Offset for pagination
        db: Database session

    Returns:
        List of historical analyses
    """
    try:
        history = get_analysis_history(db, limit=limit, offset=offset)

        results = []
        for item in history:
            results.append({
                "id": item.id,
                "timestamp": item.timestamp.isoformat(),
                "subject": item.subject,
                "body_preview": item.body_preview,
                "prediction": item.prediction,
                "confidence": item.confidence,
                "threat_level": item.threat_level,
                "risk_score": item.risk_score,
                "model_used": item.model_used,
            })

        return {
            "total": len(results),
            "limit": limit,
            "offset": offset,
            "results": results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving history: {str(e)}")


@router.get("/history/{analysis_id}")
async def get_history_detail(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed analysis result by ID.

    Args:
        analysis_id: ID of the analysis
        db: Database session

    Returns:
        Detailed analysis result
    """
    try:
        analysis = get_analysis_by_id(db, analysis_id)

        if not analysis:
            raise HTTPException(status_code=404, detail=f"Analysis {analysis_id} not found")

        # Parse JSON fields
        features = json.loads(analysis.features_json) if analysis.features_json else {}
        indicators = json.loads(analysis.indicators_json) if analysis.indicators_json else []
        explanation = json.loads(analysis.explanation_json) if analysis.explanation_json else {}

        return {
            "id": analysis.id,
            "timestamp": analysis.timestamp.isoformat(),
            "subject": analysis.subject,
            "body_preview": analysis.body_preview,
            "prediction": analysis.prediction,
            "confidence": analysis.confidence,
            "threat_level": analysis.threat_level,
            "risk_score": analysis.risk_score,
            "model_used": analysis.model_used,
            "features": features,
            "risk_indicators": indicators,
            "explanation": explanation
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving analysis detail: {str(e)}")


@router.delete("/history/{analysis_id}")
async def delete_history_item(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete an analysis from history.

    Args:
        analysis_id: ID of the analysis to delete
        db: Database session

    Returns:
        Success message
    """
    try:
        success = delete_analysis(db, analysis_id)

        if not success:
            raise HTTPException(status_code=404, detail=f"Analysis {analysis_id} not found")

        return {"message": f"Analysis {analysis_id} deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting analysis: {str(e)}")
