"""API route modules."""

from .analyze import router as analyze_router
from .batch import router as batch_router
from .models import router as models_router
from .dashboard import router as dashboard_router
from .history import router as history_router
from .image_analyze import router as image_analyze_router

__all__ = [
    "analyze_router",
    "batch_router",
    "models_router",
    "dashboard_router",
    "history_router",
    "image_analyze_router",
]
