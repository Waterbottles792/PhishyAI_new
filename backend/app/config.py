"""Configuration management for PhishGuard AI."""

import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    """Application settings."""

    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_RELOAD: bool = True

    # Project Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    MODEL_PATH: Path = BASE_DIR / "data" / "models"
    DATABASE_PATH: str = str(BASE_DIR / "data" / "phishguard.db")

    # Model Configuration
    DEFAULT_MODEL: str = "random_forest"
    AVAILABLE_MODELS: List[str] = [
        "naive_bayes",
        "logistic_regression",
        "random_forest",
        "gradient_boosting"
    ]

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"

    # Feature Extraction
    ENABLE_GRAMMAR_CHECK: bool = True
    MAX_GRAMMAR_ERRORS: int = 50

    # Logging
    LOG_LEVEL: str = "INFO"

    # Optional API Keys
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # OCR Configuration
    TESSERACT_CMD: str = ""

    # Anomaly Detection
    ANOMALY_CONTAMINATION: float = 0.1

    # Threat Intelligence
    PHISHTANK_API_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True

# Initialize settings
settings = Settings()

# Create necessary directories
settings.DATA_DIR.mkdir(exist_ok=True)
settings.MODEL_PATH.mkdir(parents=True, exist_ok=True)
(settings.DATA_DIR / "raw").mkdir(exist_ok=True)
(settings.DATA_DIR / "processed").mkdir(exist_ok=True)
