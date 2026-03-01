"""Database connection and session management."""

import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker, Session
from .models import Base, AnalysisHistory, DatasetStats
from ..config import settings


# Create engine
engine = create_engine(
    f"sqlite:///{settings.DATABASE_PATH}",
    connect_args={"check_same_thread": False}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)
    print(f"Database initialized at {settings.DATABASE_PATH}")


def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def save_analysis(
    db: Session,
    subject: str,
    body: str,
    prediction: str,
    confidence: float,
    threat_level: str,
    risk_score: int,
    model_used: str,
    features: Dict,
    indicators: List[Dict],
    explanation: Dict,
    user_id: Optional[str] = None
) -> AnalysisHistory:
    """
    Save analysis result to database.

    Args:
        db: Database session
        subject: Email subject
        body: Email body
        prediction: Prediction result
        confidence: Confidence score
        threat_level: Threat level
        risk_score: Risk score
        model_used: Model name
        features: Extracted features
        indicators: Risk indicators
        explanation: SHAP explanation
        user_id: Optional Clerk user ID

    Returns:
        Saved AnalysisHistory object
    """
    body_preview = body[:200] if len(body) > 200 else body

    analysis = AnalysisHistory(
        user_id=user_id,
        subject=subject,
        body_preview=body_preview,
        prediction=prediction,
        confidence=confidence,
        threat_level=threat_level,
        risk_score=risk_score,
        model_used=model_used,
        features_json=json.dumps(features),
        indicators_json=json.dumps(indicators),
        explanation_json=json.dumps(explanation)
    )

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return analysis


def get_analysis_history(
    db: Session,
    limit: int = 50,
    offset: int = 0,
    user_id: Optional[str] = None
) -> List[AnalysisHistory]:
    """
    Get analysis history, optionally filtered by user.

    Args:
        db: Database session
        limit: Maximum number of results
        offset: Offset for pagination
        user_id: Optional Clerk user ID to filter by

    Returns:
        List of AnalysisHistory objects
    """
    query = db.query(AnalysisHistory)
    if user_id:
        query = query.filter(AnalysisHistory.user_id == user_id)
    return query.order_by(AnalysisHistory.timestamp.desc())\
        .limit(limit)\
        .offset(offset)\
        .all()


def get_analysis_by_id(db: Session, analysis_id: int) -> Optional[AnalysisHistory]:
    """Get specific analysis by ID."""
    return db.query(AnalysisHistory).filter(AnalysisHistory.id == analysis_id).first()


def delete_analysis(db: Session, analysis_id: int, user_id: Optional[str] = None) -> bool:
    """
    Delete analysis from history.

    Args:
        db: Database session
        analysis_id: ID of analysis to delete
        user_id: Optional Clerk user ID to verify ownership

    Returns:
        True if deleted, False if not found
    """
    query = db.query(AnalysisHistory).filter(AnalysisHistory.id == analysis_id)
    if user_id:
        query = query.filter(AnalysisHistory.user_id == user_id)
    analysis = query.first()
    if analysis:
        db.delete(analysis)
        db.commit()
        return True
    return False


def get_dashboard_stats(db: Session, days: int = 7) -> Dict:
    """
    Get dashboard statistics.

    Args:
        db: Database session
        days: Number of days to look back

    Returns:
        Dictionary of statistics
    """
    # Calculate date threshold
    threshold_date = datetime.utcnow() - timedelta(days=days)

    # Total analyzed
    total_analyzed = db.query(func.count(AnalysisHistory.id)).scalar() or 0

    # Phishing vs legitimate counts
    phishing_count = db.query(func.count(AnalysisHistory.id))\
        .filter(AnalysisHistory.prediction == "phishing")\
        .scalar() or 0

    legitimate_count = db.query(func.count(AnalysisHistory.id))\
        .filter(AnalysisHistory.prediction == "legitimate")\
        .scalar() or 0

    # Average confidence
    avg_confidence = db.query(func.avg(AnalysisHistory.confidence)).scalar() or 0.0

    # Detection rate
    detection_rate = phishing_count / total_analyzed if total_analyzed > 0 else 0.0

    # Threat distribution
    threat_dist = {
        "low": db.query(func.count(AnalysisHistory.id))\
            .filter(AnalysisHistory.threat_level == "low").scalar() or 0,
        "medium": db.query(func.count(AnalysisHistory.id))\
            .filter(AnalysisHistory.threat_level == "medium").scalar() or 0,
        "high": db.query(func.count(AnalysisHistory.id))\
            .filter(AnalysisHistory.threat_level == "high").scalar() or 0,
        "critical": db.query(func.count(AnalysisHistory.id))\
            .filter(AnalysisHistory.threat_level == "critical").scalar() or 0,
    }

    # Daily trend (last N days)
    daily_trend = []
    for i in range(days - 1, -1, -1):
        day_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=i)
        day_end = day_start + timedelta(days=1)

        day_total = db.query(func.count(AnalysisHistory.id))\
            .filter(AnalysisHistory.timestamp >= day_start)\
            .filter(AnalysisHistory.timestamp < day_end)\
            .scalar() or 0

        day_phishing = db.query(func.count(AnalysisHistory.id))\
            .filter(AnalysisHistory.timestamp >= day_start)\
            .filter(AnalysisHistory.timestamp < day_end)\
            .filter(AnalysisHistory.prediction == "phishing")\
            .scalar() or 0

        day_legitimate = day_total - day_phishing

        daily_trend.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "count": day_total,
            "phishing": day_phishing,
            "legitimate": day_legitimate
        })

    # Most common indicators (placeholder - would need to parse JSON)
    most_common_indicators = []

    # Top features triggered (placeholder - would need to parse JSON)
    top_features = []

    return {
        "total_analyzed": total_analyzed,
        "phishing_count": phishing_count,
        "legitimate_count": legitimate_count,
        "detection_rate": detection_rate,
        "avg_confidence": float(avg_confidence),
        "most_common_indicators": most_common_indicators,
        "threat_distribution": threat_dist,
        "daily_analysis_trend": daily_trend,
        "top_features_triggered": top_features
    }
