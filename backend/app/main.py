"""
PhishGuard AI - Main FastAPI Application
AI-Powered Phishing Email Detection System
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import settings
from .database.db import init_db
from .models.model_registry import model_registry
from .services.anomaly_service import anomaly_detector
from .routes import (
    analyze_router,
    batch_router,
    models_router,
    dashboard_router,
    history_router,
    image_analyze_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    print("=" * 60)
    print("Starting PhishGuard AI API...")
    print("=" * 60)

    # Initialize database
    init_db()
    print("✓ Database initialized")

    # Load models
    available_models = model_registry.list_models()
    if available_models:
        print(f"✓ Loaded {len(available_models)} models: {', '.join(available_models)}")
    else:
        print("⚠ Warning: No trained models found!")
        print("  Please run: python scripts/train.py")

    # Initialize anomaly detector
    anomaly_detector.initialize()
    print("✓ Anomaly detector initialized")

    print("=" * 60)
    print(f"API ready at http://{settings.API_HOST}:{settings.API_PORT}")
    print(f"API docs at http://{settings.API_HOST}:{settings.API_PORT}/docs")
    print("=" * 60)

    yield

    # Shutdown
    print("\nShutting down PhishGuard AI API...")


# Create FastAPI app
app = FastAPI(
    title="PhishGuard AI API",
    description="""
    ## AI-Powered Phishing Email Detection System

    This API provides intelligent phishing email detection using machine learning models
    with explainable AI (SHAP) to help users understand why an email was flagged.

    ### Features:
    - **Real-time Email Analysis**: Analyze emails for phishing indicators
    - **Multiple ML Models**: Compare results from Naive Bayes, Logistic Regression, Random Forest, and Gradient Boosting
    - **Explainability**: SHAP-based explanations showing which features contributed to the prediction
    - **Batch Processing**: Analyze multiple emails at once
    - **Analytics Dashboard**: Track trends and statistics
    - **History Management**: Store and retrieve past analyses

    ### Quick Start:
    1. POST to `/api/analyze` with email subject and body
    2. Get prediction, confidence score, threat level, and detailed explanations
    3. View all available models at `/api/models`
    4. Check dashboard stats at `/api/dashboard/stats`
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analyze_router, prefix="/api", tags=["Analysis"])
app.include_router(batch_router, prefix="/api", tags=["Batch Analysis"])
app.include_router(models_router, prefix="/api", tags=["Models"])
app.include_router(dashboard_router, prefix="/api", tags=["Dashboard"])
app.include_router(history_router, prefix="/api", tags=["History"])
app.include_router(image_analyze_router, prefix="/api", tags=["Image Analysis"])


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "PhishGuard AI - Intelligent Phishing Email Detection System",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "analyze": "POST /api/analyze - Analyze a single email",
            "batch": "POST /api/batch - Analyze multiple emails",
            "models": "GET /api/models - Get all model metrics",
            "dashboard": "GET /api/dashboard/stats - Get dashboard statistics",
            "history": "GET /api/history - Get analysis history",
        },
        "status": "operational"
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    models_loaded = len(model_registry.list_models()) > 0

    return {
        "status": "healthy" if models_loaded else "degraded",
        "models_loaded": models_loaded,
        "available_models": model_registry.list_models(),
        "database": "connected"
    }


@app.get("/api/info")
async def api_info():
    """Get API information and configuration."""
    return {
        "name": "PhishGuard AI API",
        "version": "1.0.0",
        "models": {
            "available": model_registry.list_models(),
            "default": settings.DEFAULT_MODEL,
        },
        "features": {
            "real_time_analysis": True,
            "batch_processing": True,
            "explainability": True,
            "history_tracking": True,
            "multiple_models": True,
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD
    )
