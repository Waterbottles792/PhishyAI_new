"""Request schemas for API endpoints."""

from pydantic import BaseModel, Field
from typing import Optional, List


class AnalyzeRequest(BaseModel):
    """Request schema for analyzing a single email."""

    subject: str = Field(default="", description="Email subject line")
    body: str = Field(..., description="Email body content")
    model_name: Optional[str] = Field(
        default="random_forest",
        description="Name of the model to use for prediction"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "subject": "Urgent: Your account has been suspended",
                "body": "Dear Customer, We have detected unauthorized access...",
                "model_name": "random_forest"
            }
        }


class BatchAnalyzeRequest(BaseModel):
    """Request schema for batch email analysis."""

    emails: List[AnalyzeRequest] = Field(
        ...,
        description="List of emails to analyze"
    )
    model_name: Optional[str] = Field(
        default="random_forest",
        description="Name of the model to use for all predictions"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "emails": [
                    {
                        "subject": "Test email 1",
                        "body": "This is a test email"
                    },
                    {
                        "subject": "Test email 2",
                        "body": "Another test email"
                    }
                ],
                "model_name": "random_forest"
            }
        }
