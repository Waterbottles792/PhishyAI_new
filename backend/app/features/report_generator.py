"""PDF report generator for analysis results."""

import io
import logging
import time
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


def generate_pdf_report(
    analysis_type: str,
    results: Dict[str, Any],
) -> bytes:
    """
    Generate a branded PDF report for any analysis type.

    Args:
        analysis_type: Type of analysis (email, url, file, document, sms, headers, qr, domain)
        results: The analysis results dictionary

    Returns:
        PDF file bytes
    """
    try:
        from fpdf import FPDF
    except ImportError:
        raise RuntimeError("fpdf2 is required. Install with: pip install fpdf2")

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    # Title
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(20, 20, 60)
    pdf.cell(0, 12, "PhishGuard AI", new_x="LMARGIN", new_y="NEXT", align="C")

    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 8, f"Security Analysis Report - {analysis_type.replace('_', ' ').title()}", new_x="LMARGIN", new_y="NEXT", align="C")

    pdf.set_font("Helvetica", "", 9)
    pdf.cell(0, 6, f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}", new_x="LMARGIN", new_y="NEXT", align="C")

    pdf.ln(8)

    # Divider
    pdf.set_draw_color(200, 200, 200)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(6)

    # Verdict Section
    is_suspicious = results.get("is_suspicious", False)
    risk_score = results.get("risk_score", 0)
    threat_level = results.get("threat_level", "low")

    pdf.set_font("Helvetica", "B", 14)
    pdf.set_text_color(20, 20, 60)
    pdf.cell(0, 10, "Verdict", new_x="LMARGIN", new_y="NEXT")

    # Verdict box
    if is_suspicious:
        pdf.set_fill_color(255, 240, 240)
        pdf.set_text_color(180, 30, 30)
        verdict_text = "SUSPICIOUS / POTENTIALLY MALICIOUS"
    else:
        pdf.set_fill_color(240, 255, 240)
        pdf.set_text_color(30, 130, 30)
        verdict_text = "SAFE / NO THREATS DETECTED"

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 10, verdict_text, new_x="LMARGIN", new_y="NEXT", fill=True, align="C")
    pdf.ln(4)

    # Risk Score
    pdf.set_text_color(60, 60, 60)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(50, 7, "Risk Score:", new_x="RIGHT")
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(0, 7, f"{risk_score}/100", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 10)
    pdf.cell(50, 7, "Threat Level:", new_x="RIGHT")
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(0, 7, threat_level.upper(), new_x="LMARGIN", new_y="NEXT")

    # Type-specific summary
    summary_field = None
    if "url" in results:
        summary_field = ("URL Analyzed", results["url"])
    elif "filename" in results:
        summary_field = ("File Analyzed", results["filename"])
    elif "message" in results:
        summary_field = ("SMS Message", results["message"][:200])
    elif "domain" in results:
        summary_field = ("Domain Monitored", results["domain"])
    elif "decoded_data" in results:
        summary_field = ("QR Data", results["decoded_data"][:200])
    elif "from_address" in results:
        summary_field = ("From", results["from_address"])

    if summary_field:
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(50, 7, f"{summary_field[0]}:", new_x="RIGHT")
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(0, 7, _safe_text(summary_field[1]), new_x="LMARGIN", new_y="NEXT")

    pdf.ln(6)

    # Risk Indicators Section
    indicators = results.get("risk_indicators", [])
    if indicators:
        pdf.set_draw_color(200, 200, 200)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(4)

        pdf.set_font("Helvetica", "B", 14)
        pdf.set_text_color(20, 20, 60)
        pdf.cell(0, 10, f"Risk Indicators ({len(indicators)})", new_x="LMARGIN", new_y="NEXT")

        # Table header
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_fill_color(240, 240, 240)
        pdf.set_text_color(60, 60, 60)
        pdf.cell(70, 7, "Indicator", border=1, fill=True)
        pdf.cell(90, 7, "Detail", border=1, fill=True)
        pdf.cell(30, 7, "Severity", border=1, fill=True, new_x="LMARGIN", new_y="NEXT")

        pdf.set_font("Helvetica", "", 8)
        pdf.set_text_color(40, 40, 40)

        for ind in indicators:
            name = ind.get("indicator", "") if isinstance(ind, dict) else getattr(ind, "indicator", "")
            detail = ind.get("detail", "") if isinstance(ind, dict) else getattr(ind, "detail", "")
            severity = ind.get("severity", "") if isinstance(ind, dict) else getattr(ind, "severity", "")

            # Truncate long text
            detail_short = _safe_text(detail[:80] + "..." if len(detail) > 80 else detail)

            # Severity color
            if severity == "critical":
                pdf.set_text_color(180, 30, 30)
            elif severity == "high":
                pdf.set_text_color(200, 80, 20)
            elif severity == "medium":
                pdf.set_text_color(180, 140, 20)
            else:
                pdf.set_text_color(60, 60, 60)

            pdf.cell(70, 7, _safe_text(name[:35]), border=1)
            pdf.set_text_color(40, 40, 40)
            pdf.cell(90, 7, detail_short, border=1)

            if severity == "critical":
                pdf.set_text_color(180, 30, 30)
            elif severity == "high":
                pdf.set_text_color(200, 80, 20)
            elif severity == "medium":
                pdf.set_text_color(180, 140, 20)
            else:
                pdf.set_text_color(100, 100, 100)

            pdf.cell(30, 7, severity.upper(), border=1, new_x="LMARGIN", new_y="NEXT")
            pdf.set_text_color(40, 40, 40)

    pdf.ln(6)

    # AI Explanation
    ai_explanation = results.get("ai_explanation", "")
    if ai_explanation:
        pdf.set_draw_color(200, 200, 200)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(4)

        pdf.set_font("Helvetica", "B", 14)
        pdf.set_text_color(20, 20, 60)
        pdf.cell(0, 10, "AI Analysis", new_x="LMARGIN", new_y="NEXT")

        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(40, 40, 40)
        pdf.multi_cell(0, 6, _safe_text(ai_explanation))

    pdf.ln(4)

    # Safety Recommendations
    recommendations = results.get("safety_recommendations", [])
    if recommendations:
        pdf.set_draw_color(200, 200, 200)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(4)

        pdf.set_font("Helvetica", "B", 14)
        pdf.set_text_color(20, 20, 60)
        pdf.cell(0, 10, "Safety Recommendations", new_x="LMARGIN", new_y="NEXT")

        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(40, 40, 40)
        for i, rec in enumerate(recommendations, 1):
            pdf.multi_cell(0, 6, f"{i}. {_safe_text(rec)}")
            pdf.ln(1)

    # Footer
    pdf.ln(8)
    pdf.set_draw_color(200, 200, 200)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(4)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(150, 150, 150)
    pdf.cell(0, 6, "Generated by PhishGuard AI - AI-Powered Phishing Detection Platform", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.cell(0, 6, "This report is for informational purposes only.", new_x="LMARGIN", new_y="NEXT", align="C")

    return pdf.output()


def _safe_text(text: str) -> str:
    """Replace problematic characters for PDF rendering."""
    if not text:
        return ""
    # Replace common unicode that fpdf2 might struggle with
    replacements = {
        "\u2018": "'", "\u2019": "'",
        "\u201c": '"', "\u201d": '"',
        "\u2013": "-", "\u2014": "--",
        "\u2026": "...",
        "\u00a0": " ",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    # Encode to latin-1 with replacement for any remaining chars
    return text.encode("latin-1", errors="replace").decode("latin-1")
