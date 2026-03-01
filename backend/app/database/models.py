"""SQLAlchemy database models."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class AnalysisHistory(Base):
    """Model for storing email analysis history."""

    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(100), nullable=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    subject = Column(Text, nullable=False)
    body_preview = Column(Text, nullable=True)  # First 200 chars
    prediction = Column(String(20), nullable=False)  # "phishing" or "legitimate"
    confidence = Column(Float, nullable=False)
    threat_level = Column(String(20), nullable=False)  # "low", "medium", "high", "critical"
    risk_score = Column(Integer, nullable=False)
    model_used = Column(String(50), nullable=False)
    features_json = Column(Text, nullable=True)  # JSON blob of extracted features
    indicators_json = Column(Text, nullable=True)  # JSON blob of risk indicators
    explanation_json = Column(Text, nullable=True)  # JSON blob of SHAP explanation

    def __repr__(self):
        return f"<AnalysisHistory(id={self.id}, prediction={self.prediction}, timestamp={self.timestamp})>"


class DatasetStats(Base):
    """Model for storing dataset statistics."""

    __tablename__ = "dataset_stats"

    id = Column(Integer, primary_key=True, autoincrement=True)
    total_emails = Column(Integer, nullable=False)
    phishing_count = Column(Integer, nullable=False)
    legitimate_count = Column(Integer, nullable=False)
    last_updated = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<DatasetStats(total={self.total_emails}, phishing={self.phishing_count})>"
