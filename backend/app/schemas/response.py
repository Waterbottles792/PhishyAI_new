"""Response schemas for API endpoints."""

from pydantic import BaseModel, Field
from typing import List, Dict, Any


class RiskIndicator(BaseModel):
    """Risk indicator in an email."""

    indicator: str = Field(..., description="Name of the risk indicator")
    detail: str = Field(..., description="Detailed explanation")
    severity: str = Field(..., description="Severity level: low, medium, high, critical")


class FeatureImportance(BaseModel):
    """Feature importance for explainability."""

    feature: str = Field(..., description="Feature name")
    value: float = Field(..., description="Feature value")
    impact: float = Field(..., description="Absolute impact on prediction")
    shap_value: float = Field(..., description="SHAP value (signed impact)")
    direction: str = Field(..., description="Direction: phishing or legitimate")


class AnalyzeResponse(BaseModel):
    """Response schema for email analysis."""

    prediction: str = Field(..., description="Prediction: phishing or legitimate")
    confidence: float = Field(..., description="Confidence score (0.0 to 1.0)")
    threat_level: str = Field(..., description="Threat level: low, medium, high, critical")
    risk_score: int = Field(..., description="Risk score (0 to 100)")
    model_used: str = Field(..., description="Name of the model used")
    risk_indicators: List[RiskIndicator] = Field(..., description="List of risk indicators")
    feature_importance: List[FeatureImportance] = Field(..., description="Feature importance rankings")
    top_phishing_indicators: List[FeatureImportance] = Field(..., description="Top phishing indicators")
    top_legitimate_indicators: List[FeatureImportance] = Field(..., description="Top legitimate indicators")
    features_extracted: Dict[str, Any] = Field(..., description="Raw extracted features")
    highlighted_words: List[Dict[str, Any]] = Field(..., description="Words to highlight in the email")

    class Config:
        json_schema_extra = {
            "example": {
                "prediction": "phishing",
                "confidence": 0.947,
                "threat_level": "high",
                "risk_score": 87,
                "model_used": "random_forest",
                "risk_indicators": [
                    {
                        "indicator": "Urgency Language Detected",
                        "detail": "Found urgency keywords: 'immediately', 'act now'",
                        "severity": "high"
                    }
                ],
                "feature_importance": [],
                "top_phishing_indicators": [],
                "top_legitimate_indicators": [],
                "features_extracted": {},
                "highlighted_words": []
            }
        }


class BatchAnalyzeResponse(BaseModel):
    """Response schema for batch analysis."""

    results: List[AnalyzeResponse] = Field(..., description="Analysis results for each email")
    summary: Dict[str, Any] = Field(..., description="Summary statistics")

    class Config:
        json_schema_extra = {
            "example": {
                "results": [],
                "summary": {
                    "total": 10,
                    "phishing_count": 4,
                    "legitimate_count": 6,
                    "avg_confidence": 0.92
                }
            }
        }


class ModelMetrics(BaseModel):
    """Model performance metrics."""

    name: str = Field(..., description="Model name")
    accuracy: float = Field(..., description="Accuracy score")
    precision: float = Field(..., description="Precision score")
    recall: float = Field(..., description="Recall score")
    f1_score: float = Field(..., description="F1 score")
    roc_auc: float = Field(..., description="ROC AUC score")
    training_time_seconds: float = Field(..., description="Training time in seconds")
    confusion_matrix: List[List[int]] = Field(..., description="Confusion matrix")
    roc_curve: Dict[str, List[float]] = Field(..., description="ROC curve data (FPR and TPR)")


class DashboardStats(BaseModel):
    """Dashboard statistics."""

    total_analyzed: int = Field(..., description="Total emails analyzed")
    phishing_count: int = Field(..., description="Number of phishing emails detected")
    legitimate_count: int = Field(..., description="Number of legitimate emails")
    detection_rate: float = Field(..., description="Phishing detection rate")
    avg_confidence: float = Field(..., description="Average confidence score")
    most_common_indicators: List[Dict[str, Any]] = Field(..., description="Most common risk indicators")
    threat_distribution: Dict[str, int] = Field(..., description="Distribution by threat level")
    daily_analysis_trend: List[Dict[str, Any]] = Field(..., description="Daily analysis trend")
    top_features_triggered: List[Dict[str, Any]] = Field(..., description="Most frequently triggered features")
