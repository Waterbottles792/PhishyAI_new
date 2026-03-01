"""Dashboard statistics endpoint."""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session

from ..schemas.response import DashboardStats
from ..database.db import get_db, get_dashboard_stats

router = APIRouter()


@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_statistics(
    days: int = Query(default=7, ge=1, le=90, description="Number of days to look back"),
    db: Session = Depends(get_db)
):
    """
    Get dashboard statistics and analytics.

    Args:
        days: Number of days to analyze (default: 7)
        db: Database session

    Returns:
        Dashboard statistics including counts, trends, and distributions
    """
    try:
        stats = get_dashboard_stats(db, days=days)
        return DashboardStats(**stats)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving dashboard stats: {str(e)}")
