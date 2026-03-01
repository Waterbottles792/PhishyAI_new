"""
Train multiple models, evaluate, save the best ones.
Models to train:
  1. Naive Bayes (GaussianNB)
  2. Logistic Regression
  3. Random Forest
  4. Gradient Boosting

For each model, compute:
  - Accuracy, Precision, Recall, F1-Score
  - Confusion Matrix
  - ROC-AUC Score
  - ROC Curve data points (FPR, TPR at thresholds)
  - Training time

Save:
  - Trained model (.joblib)
  - Scaler (.joblib)
  - Metrics JSON
  - ROC curve data points JSON
"""

import json
import time
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Optional
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.naive_bayes import GaussianNB
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_auc_score, roc_curve, classification_report
)


class ModelTrainer:
    """Train and evaluate multiple ML models."""

    MODELS = {
        "naive_bayes": GaussianNB(),
        "logistic_regression": LogisticRegression(max_iter=1000, random_state=42),
        "random_forest": RandomForestClassifier(
            n_estimators=100,
            max_depth=20,
            min_samples_split=5,
            random_state=42,
            n_jobs=-1
        ),
        "gradient_boosting": GradientBoostingClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=42
        ),
    }

    def __init__(self, data_path: str, output_dir: str = "data/models"):
        """
        Initialize model trainer.

        Args:
            data_path: Path to processed feature CSV
            output_dir: Directory to save trained models
        """
        self.data_path = data_path
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.scaler = None
        self.feature_names = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None

    def load_and_prepare_data(self) -> None:
        """Load dataset, extract features, split into train/test."""
        print("Loading dataset...")
        df = pd.read_csv(self.data_path)

        print(f"Dataset shape: {df.shape}")
        print(f"Columns: {df.columns.tolist()}")

        # Assume last column is 'label' (0=legit, 1=phishing)
        if 'label' not in df.columns:
            raise ValueError("Dataset must have a 'label' column")

        X = df.drop(columns=["label"])
        y = df["label"]

        print(f"Features shape: {X.shape}")
        print(f"Label distribution:\n{y.value_counts()}")

        # Scale features
        print("Scaling features...")
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        # Save scaler
        scaler_path = self.output_dir / "scaler.joblib"
        joblib.dump(self.scaler, scaler_path)
        print(f"Scaler saved to {scaler_path}")

        # Save feature names
        self.feature_names = list(X.columns)
        feature_names_path = self.output_dir / "feature_names.json"
        with open(feature_names_path, "w") as f:
            json.dump(self.feature_names, f, indent=2)
        print(f"Feature names saved to {feature_names_path}")

        # Split data
        print("Splitting data into train/test sets...")
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42, stratify=y
        )

        print(f"Training set size: {len(self.X_train)}")
        print(f"Test set size: {len(self.X_test)}")

    def train_all(self) -> Dict:
        """Train all models and save results."""
        if self.X_train is None:
            raise ValueError("Data not loaded. Call load_and_prepare_data() first.")

        results = {}

        for name, model in self.MODELS.items():
            print(f"\n{'='*60}")
            print(f"Training: {name}")
            print(f"{'='*60}")

            try:
                start_time = time.time()
                model.fit(self.X_train, self.y_train)
                train_time = time.time() - start_time

                # Predictions
                y_pred = model.predict(self.X_test)
                y_prob = model.predict_proba(self.X_test)[:, 1]

                # Metrics
                fpr, tpr, thresholds = roc_curve(self.y_test, y_prob)
                cm = confusion_matrix(self.y_test, y_pred)

                metrics = {
                    "name": name,
                    "accuracy": float(accuracy_score(self.y_test, y_pred)),
                    "precision": float(precision_score(self.y_test, y_pred, zero_division=0)),
                    "recall": float(recall_score(self.y_test, y_pred, zero_division=0)),
                    "f1_score": float(f1_score(self.y_test, y_pred, zero_division=0)),
                    "roc_auc": float(roc_auc_score(self.y_test, y_prob)),
                    "training_time_seconds": float(train_time),
                    "confusion_matrix": cm.tolist(),
                    "roc_curve": {
                        "fpr": fpr.tolist(),
                        "tpr": tpr.tolist(),
                    }
                }

                results[name] = metrics

                # Save model
                model_path = self.output_dir / f"{name}.joblib"
                joblib.dump(model, model_path)
                print(f"Model saved to {model_path}")

                # Save metrics
                metrics_path = self.output_dir / f"{name}_metrics.json"
                with open(metrics_path, "w") as f:
                    json.dump(metrics, f, indent=2)
                print(f"Metrics saved to {metrics_path}")

                # Print metrics
                print(f"\nResults for {name}:")
                print(f"  Accuracy:  {metrics['accuracy']:.4f}")
                print(f"  Precision: {metrics['precision']:.4f}")
                print(f"  Recall:    {metrics['recall']:.4f}")
                print(f"  F1 Score:  {metrics['f1_score']:.4f}")
                print(f"  ROC AUC:   {metrics['roc_auc']:.4f}")
                print(f"  Time:      {train_time:.2f}s")
                print(f"\nConfusion Matrix:")
                print(f"  {cm}")

            except Exception as e:
                print(f"Error training {name}: {e}")
                continue

        # Save combined results
        all_metrics_path = self.output_dir / "all_metrics.json"
        with open(all_metrics_path, "w") as f:
            json.dump(results, f, indent=2)
        print(f"\n{'='*60}")
        print(f"All metrics saved to {all_metrics_path}")
        print(f"{'='*60}")

        return results

    def evaluate_model(self, model_name: str) -> Optional[Dict]:
        """
        Evaluate a specific model.

        Args:
            model_name: Name of the model to evaluate

        Returns:
            Dictionary of evaluation metrics
        """
        if model_name not in self.MODELS:
            print(f"Model {model_name} not found")
            return None

        model_path = self.output_dir / f"{model_name}.joblib"
        if not model_path.exists():
            print(f"Model file not found: {model_path}")
            return None

        model = joblib.load(model_path)

        y_pred = model.predict(self.X_test)
        y_prob = model.predict_proba(self.X_test)[:, 1]

        metrics = {
            "accuracy": float(accuracy_score(self.y_test, y_pred)),
            "precision": float(precision_score(self.y_test, y_pred)),
            "recall": float(recall_score(self.y_test, y_pred)),
            "f1_score": float(f1_score(self.y_test, y_pred)),
            "roc_auc": float(roc_auc_score(self.y_test, y_prob)),
        }

        return metrics
