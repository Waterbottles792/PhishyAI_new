"""PDF report generation endpoint."""

import logging
from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field

from ..features.report_generator import generate_pdf_report

logger = logging.getLogger(__name__)

router = APIRouter()


class ReportRequest(BaseModel):
    analysis_type: str = Field(..., description="Type: email, url, file, document, sms, headers, qr, domain")
    results: Dict[str, Any] = Field(..., description="The analysis results JSON")


@router.post("/report/generate")
async def generate_report(request: ReportRequest):
    """Generate a PDF report from analysis results."""
    try:
        pdf_bytes = generate_pdf_report(
            analysis_type=request.analysis_type,
            results=request.results,
        )

        filename = f"phishguard-{request.analysis_type}-report.pdf"

        return Response(
            content=bytes(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
            },
        )

    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Report generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")
