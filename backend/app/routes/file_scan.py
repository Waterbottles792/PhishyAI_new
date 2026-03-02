"""File scanning endpoint."""

import hashlib
import logging
from typing import List, Optional

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from ..services.gemini_service import get_gemini_analysis

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB

DANGEROUS_EXTENSIONS = {
    "exe", "bat", "cmd", "scr", "vbs", "js", "ps1", "msi",
    "com", "pif", "wsf", "wsh", "cpl", "hta", "inf", "reg",
}

SCRIPT_PATTERNS = [
    b"<script", b"eval(", b"exec(", b"os.system(", b"subprocess",
    b"powershell", b"cmd.exe", b"WScript.Shell",
]


class FileRiskIndicator(BaseModel):
    indicator: str
    detail: str
    severity: str


class FileScanResponse(BaseModel):
    filename: str
    file_size: int
    file_hash_sha256: str
    content_type: str
    is_suspicious: bool
    risk_score: int
    threat_level: str
    risk_indicators: List[FileRiskIndicator]
    ai_explanation: Optional[str] = None
    safety_recommendations: Optional[List[str]] = None


@router.post("/analyze/file", response_model=FileScanResponse)
async def scan_file(file: UploadFile = File(...)):
    """Scan an uploaded file for malicious content."""
    try:
        # Read file content
        content = await file.read()
        file_size = len(content)

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large. Maximum size is 25 MB.")

        if file_size == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded.")

        filename = file.filename or "unknown"
        content_type = file.content_type or "application/octet-stream"

        # Compute SHA-256 hash
        file_hash = hashlib.sha256(content).hexdigest()

        risk_indicators: List[FileRiskIndicator] = []

        # 1. Check for dangerous file extensions
        parts = filename.lower().rsplit(".", 1)
        extension = parts[-1] if len(parts) > 1 else ""

        if extension in DANGEROUS_EXTENSIONS:
            risk_indicators.append(FileRiskIndicator(
                indicator="Dangerous File Extension",
                detail=f"File has .{extension} extension which can execute code on your system",
                severity="critical",
            ))

        # 2. Check for double extensions (e.g., invoice.pdf.exe)
        name_parts = filename.lower().split(".")
        if len(name_parts) > 2:
            last_ext = name_parts[-1]
            second_ext = name_parts[-2]
            if last_ext in DANGEROUS_EXTENSIONS and second_ext in (
                "pdf", "doc", "docx", "xls", "xlsx", "jpg", "png", "txt"
            ):
                risk_indicators.append(FileRiskIndicator(
                    indicator="Double File Extension",
                    detail=f"File uses double extension (.{second_ext}.{last_ext}) to disguise an executable as a document",
                    severity="critical",
                ))

        # 3. Check for PE executable magic bytes (MZ header)
        if content[:2] == b"MZ":
            risk_indicators.append(FileRiskIndicator(
                indicator="Executable Binary",
                detail="File contains PE executable header (MZ) regardless of extension",
                severity="high",
            ))

        # 4. Check for embedded scripts in text-like files
        text_extensions = {"txt", "html", "htm", "csv", "xml", "svg", "json", "md"}
        if extension in text_extensions or content_type.startswith("text/"):
            for pattern in SCRIPT_PATTERNS:
                if pattern in content.lower():
                    risk_indicators.append(FileRiskIndicator(
                        indicator="Embedded Script Detected",
                        detail=f"File contains script pattern: {pattern.decode('utf-8', errors='replace')}",
                        severity="high",
                    ))
                    break  # One indicator is enough

        # 5. Check for Office macro indicators
        if b"vbaProject.bin" in content:
            risk_indicators.append(FileRiskIndicator(
                indicator="VBA Macros Detected",
                detail="File contains VBA macro project which could execute malicious code",
                severity="high",
            ))

        # 6. Check for ZIP-based files with suspicious content
        if content[:2] == b"PK":  # ZIP signature
            if b"vbaProject.bin" in content:
                pass  # Already caught above
            elif any(ext in content for ext in [b".exe", b".bat", b".cmd", b".scr"]):
                risk_indicators.append(FileRiskIndicator(
                    indicator="Archive Contains Executables",
                    detail="Archive file appears to contain executable files inside",
                    severity="high",
                ))

        # Calculate risk score
        severity_weights = {"critical": 35, "high": 25, "medium": 15, "low": 5}
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

        # Optional Gemini AI explanation
        ai_explanation = None
        safety_recommendations = None
        try:
            indicators_for_gemini = [
                {"indicator": ind.indicator, "detail": ind.detail, "severity": ind.severity}
                for ind in risk_indicators
            ]
            gemini_result = await get_gemini_analysis(
                subject=f"File Scan: {filename}",
                body=f"Scanning file: {filename}\nSize: {file_size} bytes\nType: {content_type}\nHash: {file_hash}",
                prediction="suspicious" if is_suspicious else "safe",
                confidence=risk_score / 100.0,
                risk_score=risk_score,
                threat_level=threat_level,
                risk_indicators=indicators_for_gemini,
            )
            ai_explanation = gemini_result.ai_explanation
            safety_recommendations = gemini_result.safety_recommendations
        except Exception as e:
            logger.warning(f"Gemini analysis failed for file: {e}")

        return FileScanResponse(
            filename=filename,
            file_size=file_size,
            file_hash_sha256=file_hash,
            content_type=content_type,
            is_suspicious=is_suspicious,
            risk_score=risk_score,
            threat_level=threat_level,
            risk_indicators=risk_indicators,
            ai_explanation=ai_explanation,
            safety_recommendations=safety_recommendations,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File scan failed: {e}")
        raise HTTPException(status_code=500, detail=f"File scan failed: {str(e)}")
