"""
Generate SHAP explanations for predictions.
Returns feature importance values that the frontend can visualize as a bar chart.
"""

import shap
import numpy as np
from typing import List, Dict, Any


class SHAPExplainer:
    """Generate SHAP explanations for model predictions."""

    def __init__(self, model: Any, feature_names: List[str], background_data: np.ndarray = None):
        """
        Initialize SHAP explainer.

        Args:
            model: Trained model
            feature_names: List of feature names
            background_data: Background dataset for KernelExplainer (optional)
        """
        self.model = model
        self.feature_names = feature_names
        self.background_data = background_data

        # Choose appropriate explainer based on model type
        try:
            if hasattr(model, 'estimators_') or hasattr(model, 'tree_'):
                # Tree-based models (Random Forest, Gradient Boosting)
                self.explainer = shap.TreeExplainer(model)
                self.explainer_type = "tree"
            else:
                # Linear models or others - use fallback
                self.explainer = None
                self.explainer_type = "fallback"
        except Exception as e:
            print(f"Warning: Could not initialize SHAP explainer: {e}")
            self.explainer = None
            self.explainer_type = "fallback"

    def explain(self, features_array: np.ndarray) -> Dict:
        """
        Explain a single prediction.

        Args:
            features_array: Feature array for a single sample

        Returns:
            Dictionary with:
              - feature_importance: list of {feature, value, impact, direction}
              - top_phishing_indicators: top features pushing toward phishing
              - top_legitimate_indicators: top features pushing toward legitimate
        """
        if self.explainer is None or self.explainer_type == "fallback":
            return self._fallback_explain(features_array)

        try:
            # Reshape for single sample
            features_reshaped = features_array.reshape(1, -1)

            # Get SHAP values
            shap_values = self.explainer.shap_values(features_reshaped)

            # For binary classification, get values for phishing class (class 1)
            if isinstance(shap_values, list):
                # Multiple outputs (binary classification with 2 output arrays)
                values = shap_values[1][0]  # Phishing class
            else:
                # Single output
                values = shap_values[0]

            # Build feature importance list
            importance = []
            for i, (name, val, shap_val) in enumerate(
                zip(self.feature_names, features_array, values)
            ):
                importance.append({
                    "feature": name,
                    "value": float(val),
                    "impact": float(abs(shap_val)),
                    "shap_value": float(shap_val),
                    "direction": "phishing" if shap_val > 0 else "legitimate"
                })

            # Sort by absolute impact
            importance.sort(key=lambda x: x["impact"], reverse=True)

            # Get top indicators for each class
            top_phishing = [f for f in importance if f["direction"] == "phishing"][:5]
            top_legitimate = [f for f in importance if f["direction"] == "legitimate"][:5]

            return {
                "feature_importance": importance[:15],  # Top 15 features
                "top_phishing_indicators": top_phishing,
                "top_legitimate_indicators": top_legitimate,
            }

        except Exception as e:
            print(f"Error in SHAP explanation: {e}")
            return self._fallback_explain(features_array)

    def _fallback_explain(self, features_array: np.ndarray) -> Dict:
        """
        Simple feature importance for models without SHAP support.

        Args:
            features_array: Feature array

        Returns:
            Dictionary of feature importance
        """
        importance = []

        # Check if model has coefficients (linear models)
        if hasattr(self.model, 'coef_'):
            coefs = self.model.coef_[0]
            for name, val, coef in zip(self.feature_names, features_array, coefs):
                contribution = val * coef
                importance.append({
                    "feature": name,
                    "value": float(val),
                    "impact": float(abs(contribution)),
                    "shap_value": float(contribution),
                    "direction": "phishing" if contribution > 0 else "legitimate"
                })

        # Check if model has feature importances (tree-based)
        elif hasattr(self.model, 'feature_importances_'):
            importances = self.model.feature_importances_
            for name, val, imp in zip(self.feature_names, features_array, importances):
                # For tree-based models, importance is always positive
                # Determine direction based on feature value
                contribution = val * imp
                importance.append({
                    "feature": name,
                    "value": float(val),
                    "impact": float(imp),
                    "shap_value": float(contribution),
                    "direction": "phishing" if val > 0.5 else "legitimate"
                })

        # Fallback: use feature values as proxy
        else:
            for name, val in zip(self.feature_names, features_array):
                importance.append({
                    "feature": name,
                    "value": float(val),
                    "impact": float(abs(val)),
                    "shap_value": float(val),
                    "direction": "phishing" if val > 0.5 else "legitimate"
                })

        # Sort by impact
        importance.sort(key=lambda x: x["impact"], reverse=True)

        # Get top indicators
        top_phishing = [f for f in importance if f["direction"] == "phishing"][:5]
        top_legitimate = [f for f in importance if f["direction"] == "legitimate"][:5]

        return {
            "feature_importance": importance[:15],
            "top_phishing_indicators": top_phishing,
            "top_legitimate_indicators": top_legitimate,
        }
