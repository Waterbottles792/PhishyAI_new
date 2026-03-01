"""Image-based email analysis via OCR."""

import asyncio
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Header
from sqlalchemy.orm import Session

from ..database.db import get_db
from ..config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

ALLOWED_TYPES = {
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/webp",
}
MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("/analyze/image")
async def analyze_image(
    file: UploadFile = File(...),
    model_name: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None),
):
    """
    Upload an image (screenshot of an email), extract text via OCR,
    then run the standard phishing analysis on the extracted text.
    """
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Allowed: PNG, JPG, GIF, BMP, TIFF, WEBP.",
        )

    # Read and validate file size
    content = await file.read()
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({len(content) / 1024 / 1024:.1f} MB). Maximum: 10 MB.",
        )

    try:
        import pytesseract
        from PIL import Image
        import io

        # Configure tesseract command if specified
        if settings.TESSERACT_CMD:
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

        # Run OCR in a thread to avoid blocking
        def _extract_text():
            image = Image.open(io.BytesIO(content))
            return pytesseract.image_to_string(image)

        ocr_text = await asyncio.to_thread(_extract_text)
        ocr_text = ocr_text.strip()

        if not ocr_text:
            raise HTTPException(
                status_code=422,
                detail="Could not extract any text from the image. Try a clearer screenshot.",
            )

    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="OCR dependencies not installed (pytesseract, Pillow).",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("OCR extraction failed: %s", e)
        raise HTTPException(
            status_code=500,
            detail=f"OCR extraction failed: {str(e)}",
        )

    # Split OCR text into subject (first line) and body (rest)
    lines = ocr_text.split("\n", 1)
    subject = lines[0].strip() if lines else ""
    body = lines[1].strip() if len(lines) > 1 else subject

    # Use existing analyze_email function
    from ..schemas.request import AnalyzeRequest
    from .analyze import analyze_email

    request = AnalyzeRequest(
        subject=subject,
        body=body,
        model_name=model_name or "random_forest",
    )

    result = await analyze_email(request, db, user_id=x_user_id)

    # Convert to dict and attach OCR text
    result_dict = result.model_dump() if hasattr(result, "model_dump") else result.dict()
    result_dict["ocr_text"] = ocr_text

    return result_dict
