"""Anomaly detection service using IsolationForest."""

import logging
from pathlib import Path
from typing import Optional

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

from ..config import settings

logger = logging.getLogger(__name__)


class AnomalyDetector:
    """IsolationForest-based anomaly detector for email features."""

    def __init__(self):
        self.model: Optional[IsolationForest] = None
        self.scaler = None
        self._model_path = settings.MODEL_PATH / "anomaly_detector.joblib"
        self._features_path = settings.DATA_DIR / "processed" / "features.csv"
        self._scaler_path = settings.MODEL_PATH / "scaler.joblib"

    def initialize(self):
        """Load existing anomaly model or train a new one."""
        # Load the shared scaler
        if self._scaler_path.exists():
            self.scaler = joblib.load(self._scaler_path)
            logger.info("Loaded existing scaler for anomaly detection")
        else:
            logger.warning("No scaler found at %s", self._scaler_path)

        # Try to load existing model
        if self._model_path.exists():
            self.model = joblib.load(self._model_path)
            logger.info("Loaded existing anomaly detection model")
            return

        # Train new model from features.csv
        if not self._features_path.exists():
            logger.warning(
                "No features.csv found at %s. Anomaly detection disabled.",
                self._features_path,
            )
            return

        try:
            df = pd.read_csv(self._features_path)
            # Drop label column if present
            if "label" in df.columns:
                df = df.drop(columns=["label"])

            X = df.values.astype(np.float64)

            # Scale features if scaler is available
            if self.scaler is not None:
                X = self.scaler.transform(X)

            self.model = IsolationForest(
                contamination=settings.ANOMALY_CONTAMINATION,
                random_state=42,
                n_estimators=100,
            )
            self.model.fit(X)

            # Save trained model
            joblib.dump(self.model, self._model_path)
            logger.info(
                "Trained and saved anomaly detection model (%d samples)", len(X)
            )
        except Exception as e:
            logger.error("Failed to train anomaly detector: %s", e)
            self.model = None

    def score(self, features_array) -> Optional[float]:
        """
        Compute anomaly score for a feature vector.

        Returns a score from 0 to 100 where 100 is most anomalous.
        Returns None if the model is not available.
        """
        if self.model is None:
            return None

        try:
            features = np.array(features_array).reshape(1, -1)

            # Scale features if scaler is available
            if self.scaler is not None:
                features = self.scaler.transform(features)

            # decision_function returns negative values for anomalies
            # More negative = more anomalous
            raw_score = self.model.decision_function(features)[0]

            # Normalize to 0-100 scale
            # decision_function typically ranges from about -0.5 to 0.5
            # Negative = anomalous, positive = normal
            # Map so that -0.5 -> 100 (most anomalous) and 0.5 -> 0 (least anomalous)
            normalized = max(0.0, min(100.0, (0.5 - raw_score) * 100))
            return round(normalized, 1)

        except Exception as e:
            logger.error("Anomaly scoring failed: %s", e)
            return None


# Global singleton
anomaly_detector = AnomalyDetector()
