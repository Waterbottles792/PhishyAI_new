"""Document analysis endpoint."""

import logging
from typing import List, Optional

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from ..features.url_analyzer import URLAnalyzer
from ..features.linguistic import LinguisticAnalyzer
from ..services.gemini_service import get_gemini_analysis

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB

ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "xlsx", "txt", "html", "htm"}

url_analyzer = URLAnalyzer()
linguistic_analyzer = LinguisticAnalyzer()


class DocumentRiskIndicator(BaseModel):
    indicator: str
    detail: str
    severity: str


class DocumentAnalyzeResponse(BaseModel):
    filename: str
    file_size: int
    content_type: str
    is_suspicious: bool
    risk_score: int
    threat_level: str
    risk_indicators: List[DocumentRiskIndicator]
    extracted_text_preview: Optional[str] = None
    ai_explanation: Optional[str] = None
    safety_recommendations: Optional[List[str]] = None


def extract_text_from_pdf(content: bytes) -> str:
    """Extract text from a PDF using PyMuPDF."""
    try:
        import fitz  # PyMuPDF

        doc = fitz.open(stream=content, filetype="pdf")
        text_parts = []
        for page in doc:
            text_parts.append(page.get_text())
        doc.close()
        return "\n".join(text_parts)
    except ImportError:
        logger.warning("PyMuPDF (fitz) not installed. Cannot extract PDF text.")
        return ""
    except Exception as e:
        logger.warning(f"PDF text extraction failed: {e}")
        return ""


def extract_text_from_docx(content: bytes) -> str:
    """Extract text from a DOCX file."""
    try:
        import io
        from docx import Document

        doc = Document(io.BytesIO(content))
        return "\n".join(paragraph.text for paragraph in doc.paragraphs)
    except ImportError:
        logger.warning("python-docx not installed. Cannot extract DOCX text.")
        return ""
    except Exception as e:
        logger.warning(f"DOCX text extraction failed: {e}")
        return ""


def extract_text_raw(content: bytes) -> str:
    """Extract text from raw text files (TXT, HTML)."""
    for encoding in ("utf-8", "latin-1", "cp1252"):
        try:
            return content.decode(encoding)
        except (UnicodeDecodeError, ValueError):
            continue
    return content.decode("utf-8", errors="replace")


@router.post("/analyze/document", response_model=DocumentAnalyzeResponse)
async def analyze_document(file: UploadFile = File(...)):
    """Analyze an uploaded document for threats."""
    try:
        content = await file.read()
        file_size = len(content)

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large. Maximum size is 20 MB.")

        if file_size == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded.")

        filename = file.filename or "unknown"
        content_type = file.content_type or "application/octet-stream"

        # Validate extension
        parts = filename.lower().rsplit(".", 1)
        extension = parts[-1] if len(parts) > 1 else ""

        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: .{extension}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
            )

        risk_indicators: List[DocumentRiskIndicator] = []
        extracted_text = ""

        # Extract text based on file type
        if extension == "pdf":
            extracted_text = extract_text_from_pdf(content)
        elif extension in ("docx", "doc"):
            extracted_text = extract_text_from_docx(content)
        elif extension in ("txt", "html", "htm"):
            extracted_text = extract_text_raw(content)
        elif extension == "xlsx":
            # Basic text extraction from XLSX not implemented; just note it
            extracted_text = ""

        if not extracted_text.strip():
            # Could not extract text — might still have macro indicators
            risk_indicators.append(DocumentRiskIndicator(
                indicator="No Text Extracted",
                detail="Could not extract readable text from the document. It may contain only images or be encrypted.",
                severity="low",
            ))

        # 1. Check for VBA macros
        if b"vbaProject.bin" in content:
            risk_indicators.append(DocumentRiskIndicator(
                indicator="VBA Macros Detected",
                detail="Document contains VBA macro project which could execute malicious code when opened",
                severity="critical",
            ))

        # 2. Run URL analyzer on extracted text
        if extracted_text.strip():
            url_features = url_analyzer.analyze(extracted_text)

            if url_features.get("url_count", 0) > 0:
                if url_features.get("has_ip_url"):
                    risk_indicators.append(DocumentRiskIndicator(
                        indicator="IP-based URL in Document",
                        detail="Document contains a URL using an IP address instead of a domain",
                        severity="high",
                    ))

                if url_features.get("has_shortened_url"):
                    risk_indicators.append(DocumentRiskIndicator(
                        indicator="Shortened URL in Document",
                        detail="Document contains a shortened URL that hides the real destination",
                        severity="medium",
                    ))

                if url_features.get("has_suspicious_tld"):
                    risk_indicators.append(DocumentRiskIndicator(
                        indicator="Suspicious TLD in Document",
                        detail="Document contains a URL with a suspicious top-level domain",
                        severity="high",
                    ))

                if url_features.get("has_at_in_url"):
                    risk_indicators.append(DocumentRiskIndicator(
                        indicator="Deceptive URL in Document",
                        detail="Document contains a URL with @ symbol used to disguise the destination",
                        severity="high",
                    ))

                if not url_features.get("has_https") and url_features.get("url_count", 0) > 0:
                    risk_indicators.append(DocumentRiskIndicator(
                        indicator="Insecure URLs",
                        detail="Document contains URLs without HTTPS encryption",
                        severity="low",
                    ))

            # 3. Run linguistic analyzer
            linguistic_features = linguistic_analyzer.analyze(extracted_text, extracted_text)

            urgency = linguistic_features.get("urgency_score", 0)
            threat = linguistic_features.get("threat_score", 0)
            reward = linguistic_features.get("reward_score", 0)

            if urgency > 0.3:
                risk_indicators.append(DocumentRiskIndicator(
                    indicator="Urgency Language",
                    detail=f"Document contains urgent language patterns (score: {urgency:.2f})",
                    severity="medium" if urgency < 0.6 else "high",
                ))

            if threat > 0.3:
                risk_indicators.append(DocumentRiskIndicator(
                    indicator="Threat Language",
                    detail=f"Document contains threatening language patterns (score: {threat:.2f})",
                    severity="medium" if threat < 0.6 else "high",
                ))

            if reward > 0.3:
                risk_indicators.append(DocumentRiskIndicator(
                    indicator="Reward/Prize Language",
                    detail=f"Document contains reward/prize language patterns (score: {reward:.2f})",
                    severity="medium",
                ))

        # 4. Check for embedded scripts in HTML docs
        if extension in ("html", "htm"):
            lower_content = content.lower()
            if b"<script" in lower_content:
                risk_indicators.append(DocumentRiskIndicator(
                    indicator="Embedded Scripts",
                    detail="HTML document contains embedded JavaScript which could be malicious",
                    severity="high",
                ))
            if b"eval(" in lower_content or b"document.write(" in lower_content:
                risk_indicators.append(DocumentRiskIndicator(
                    indicator="Dynamic Code Execution",
                    detail="HTML document uses eval() or document.write() which can execute injected code",
                    severity="high",
                ))

        # Calculate risk score
        severity_weights = {"critical": 35, "high": 20, "medium": 10, "low": 5}
        risk_score = min(
            sum(severity_weights.get(ind.severity, 0) for ind in risk_indicators),
            100,
        )

        # Determine threat level
        if risk_score >= 70:
            threat_level = "critical"
        elif risk_score >= 45:
            threat_level = "high"
        elif risk_score >= 20:
            threat_level = "medium"
        else:
            threat_level = "low"

        is_suspicious = risk_score >= 25

        # Create text preview (first 500 chars)
        text_preview = extracted_text[:500].strip() if extracted_text else None

        # Optional Gemini AI deep analysis
        ai_explanation = None
        safety_recommendations = None
        try:
            indicators_for_gemini = [
                {"indicator": ind.indicator, "detail": ind.detail, "severity": ind.severity}
                for ind in risk_indicators
            ]
            gemini_result = await get_gemini_analysis(
                subject=f"Document Analysis: {filename}",
                body=extracted_text[:3000] if extracted_text else f"Binary document: {filename}",
                prediction="suspicious" if is_suspicious else "safe",
                confidence=risk_score / 100.0,
                risk_score=risk_score,
                threat_level=threat_level,
                risk_indicators=indicators_for_gemini,
            )
            ai_explanation = gemini_result.ai_explanation
            safety_recommendations = gemini_result.safety_recommendations
        except Exception as e:
            logger.warning(f"Gemini analysis failed for document: {e}")

        return DocumentAnalyzeResponse(
            filename=filename,
            file_size=file_size,
            content_type=content_type,
            is_suspicious=is_suspicious,
            risk_score=risk_score,
            threat_level=threat_level,
            risk_indicators=risk_indicators,
            extracted_text_preview=text_preview,
            ai_explanation=ai_explanation,
            safety_recommendations=safety_recommendations,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Document analysis failed: {str(e)}")
