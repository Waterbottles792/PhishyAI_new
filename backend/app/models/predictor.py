"""Model prediction logic."""

import joblib
import numpy as np
from pathlib import Path
from typing import Dict, Tuple, Optional


class ModelPredictor:
    """Handle predictions using trained models."""

    def __init__(self, model_path: Path, scaler_path: Path):
        """
        Initialize predictor with model and scaler.

        Args:
            model_path: Path to trained model file
            scaler_path: Path to scaler file
        """
        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
        self.model_path = model_path
        self.model_name = model_path.stem

    def predict(self, features: np.ndarray) -> Tuple[int, float]:
        """
        Make a prediction on features.

        Args:
            features: Feature array (unscaled)

        Returns:
            Tuple of (prediction, confidence)
            prediction: 0 (legitimate) or 1 (phishing)
            confidence: Probability of predicted class
        """
        # Scale features
        features_scaled = self.scaler.transform(features.reshape(1, -1))

        # Predict
        prediction = self.model.predict(features_scaled)[0]
        probabilities = self.model.predict_proba(features_scaled)[0]

        # Confidence is the probability of the predicted class
        confidence = probabilities[prediction]

        return int(prediction), float(confidence)

    def predict_proba(self, features: np.ndarray) -> np.ndarray:
        """
        Get probability distribution for features.

        Args:
            features: Feature array (unscaled)

        Returns:
            Array of probabilities [prob_legitimate, prob_phishing]
        """
        features_scaled = self.scaler.transform(features.reshape(1, -1))
        return self.model.predict_proba(features_scaled)[0]

    def get_feature_importance(self) -> Optional[np.ndarray]:
        """
        Get feature importance if model supports it.

        Returns:
            Array of feature importance values or None
        """
        if hasattr(self.model, 'feature_importances_'):
            return self.model.feature_importances_
        elif hasattr(self.model, 'coef_'):
            # For linear models, use absolute coefficients
            return np.abs(self.model.coef_[0])
        return None
