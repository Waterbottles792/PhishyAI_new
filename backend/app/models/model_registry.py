"""Model registry for loading and managing trained models."""

import json
import joblib
from pathlib import Path
from typing import Dict, Optional, List
from .predictor import ModelPredictor
from ..config import settings


class ModelRegistry:
    """Registry for managing multiple trained models."""

    def __init__(self, model_dir: Optional[Path] = None):
        """
        Initialize model registry.

        Args:
            model_dir: Directory containing trained models
        """
        self.model_dir = model_dir or settings.MODEL_PATH
        self.models: Dict[str, ModelPredictor] = {}
        self.metrics: Dict[str, Dict] = {}
        self.feature_names: List[str] = []

        # Load models
        self._load_models()

    def _load_models(self) -> None:
        """Load all available models from model directory."""
        if not self.model_dir.exists():
            print(f"Warning: Model directory not found: {self.model_dir}")
            return

        # Load scaler (shared across all models)
        scaler_path = self.model_dir / "scaler.joblib"
        if not scaler_path.exists():
            print(f"Warning: Scaler not found at {scaler_path}")
            return

        # Load feature names
        feature_names_path = self.model_dir / "feature_names.json"
        if feature_names_path.exists():
            with open(feature_names_path, 'r') as f:
                self.feature_names = json.load(f)

        # Load each model
        for model_name in settings.AVAILABLE_MODELS:
            model_path = self.model_dir / f"{model_name}.joblib"
            metrics_path = self.model_dir / f"{model_name}_metrics.json"

            if model_path.exists():
                try:
                    # Load model
                    self.models[model_name] = ModelPredictor(model_path, scaler_path)
                    print(f"Loaded model: {model_name}")

                    # Load metrics
                    if metrics_path.exists():
                        with open(metrics_path, 'r') as f:
                            self.metrics[model_name] = json.load(f)
                except Exception as e:
                    print(f"Error loading model {model_name}: {e}")
            else:
                print(f"Model file not found: {model_path}")

    def get_model(self, model_name: str) -> Optional[ModelPredictor]:
        """
        Get a specific model by name.

        Args:
            model_name: Name of the model

        Returns:
            ModelPredictor instance or None
        """
        return self.models.get(model_name)

    def get_metrics(self, model_name: str) -> Optional[Dict]:
        """
        Get metrics for a specific model.

        Args:
            model_name: Name of the model

        Returns:
            Dictionary of metrics or None
        """
        return self.metrics.get(model_name)

    def get_all_metrics(self) -> Dict[str, Dict]:
        """Get metrics for all loaded models."""
        return self.metrics

    def list_models(self) -> List[str]:
        """Get list of available model names."""
        return list(self.models.keys())

    def get_default_model(self) -> Optional[ModelPredictor]:
        """Get the default model."""
        return self.get_model(settings.DEFAULT_MODEL)

    def reload_models(self) -> None:
        """Reload all models from disk."""
        self.models.clear()
        self.metrics.clear()
        self._load_models()


# Global model registry instance
model_registry = ModelRegistry()
