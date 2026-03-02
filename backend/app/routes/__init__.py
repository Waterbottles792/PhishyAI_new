"""API route modules."""

from .analyze import router as analyze_router
from .batch import router as batch_router
from .models import router as models_router
from .dashboard import router as dashboard_router
from .history import router as history_router
from .image_analyze import router as image_analyze_router
from .url_analyze import router as url_analyze_router
from .file_scan import router as file_scan_router
from .document_analyze import router as document_analyze_router
from .chat import router as chat_router
from .sms_analyze import router as sms_analyze_router
from .header_analyze import router as header_analyze_router
from .qr_analyze import router as qr_analyze_router
from .domain_analyze import router as domain_analyze_router
from .training import router as training_router
from .threat_feed import router as threat_feed_router
from .report import router as report_router

__all__ = [
    "analyze_router",
    "batch_router",
    "models_router",
    "dashboard_router",
    "history_router",
    "image_analyze_router",
    "url_analyze_router",
    "file_scan_router",
    "document_analyze_router",
    "chat_router",
    "sms_analyze_router",
    "header_analyze_router",
    "qr_analyze_router",
    "domain_analyze_router",
    "training_router",
    "threat_feed_router",
    "report_router",
]
