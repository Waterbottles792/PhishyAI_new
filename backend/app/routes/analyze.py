"""Email analysis endpoint."""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import numpy as np
from typing import List, Dict

from ..schemas.request import AnalyzeRequest
from ..schemas.response import AnalyzeResponse, RiskIndicator, FeatureImportance
from ..features import FeatureExtractor
from ..models.model_registry import model_registry
from ..explainability import SHAPExplainer
from ..database.db import get_db, save_analysis
from ..features.linguistic import LinguisticAnalyzer

router = APIRouter()


def apply_rule_based_correction(
    features: Dict,
    ml_prediction: int,
    ml_proba: "tuple[float, float]",
) -> "tuple[int, float]":
    """
    Adjust ML prediction using rule-based signals to compensate for
    the model being trained on older (CEAS 2008) data that lacks modern
    phishing patterns such as social-engineering urgency and HTTPS phishing.

    Returns:
        (prediction_class, confidence) – corrected values.
    """
    prob_legit, prob_phish = ml_proba

    # ── Compute a rule-based phishing score (0-1) ──────────────────────
    phishing_signals = 0.0
    legit_signals = 0.0

    # Strong phishing indicators
    urgency = features.get("urgency_score", 0)
    threat = features.get("threat_score", 0)
    reward = features.get("reward_score", 0)

    if urgency > 0.1:
        phishing_signals += min(urgency, 1.0) * 0.25
    if threat > 0.1:
        phishing_signals += min(threat, 1.0) * 0.25
    if reward > 0.1:
        phishing_signals += min(reward, 1.0) * 0.20

    if features.get("generic_greeting", False):
        phishing_signals += 0.15
    if features.get("has_suspicious_tld", False):
        phishing_signals += 0.20
    if features.get("has_ip_url", False):
        phishing_signals += 0.20
    if features.get("has_shortened_url", False):
        phishing_signals += 0.10
    if features.get("has_at_in_url", False):
        phishing_signals += 0.15
    if features.get("url_domain_mismatch", False):
        phishing_signals += 0.20
    if features.get("has_attachment_mention", False) and (urgency > 0.1 or threat > 0.1):
        phishing_signals += 0.10
    if features.get("exclamation_count", 0) > 3:
        phishing_signals += 0.05

    # Legitimacy indicators
    if features.get("has_signature", False):
        legit_signals += 0.15
    if features.get("has_greeting", False) and not features.get("generic_greeting", False):
        legit_signals += 0.10
    if urgency <= 0.05 and threat <= 0.05 and reward <= 0.05:
        legit_signals += 0.15

    phishing_signals = min(phishing_signals, 1.0)
    legit_signals = min(legit_signals, 1.0)

    # ── Blend ML probability with rule-based score ─────────────────────
    # Weight: 40% ML model, 60% rule-based (because the model's training
    # data doesn't capture modern phishing patterns well).
    rule_phish_prob = max(0.0, min(1.0, 0.5 + phishing_signals - legit_signals))
    blended_phish = 0.4 * prob_phish + 0.6 * rule_phish_prob
    blended_legit = 1.0 - blended_phish

    prediction = 1 if blended_phish >= 0.5 else 0
    confidence = blended_phish if prediction == 1 else blended_legit

    return prediction, round(confidence, 4)


def determine_threat_level(confidence: float, prediction: str) -> str:
    """Determine threat level based on confidence and prediction."""
    if prediction == "legitimate":
        return "low"

    # For phishing emails
    if confidence >= 0.9:
        return "critical"
    elif confidence >= 0.75:
        return "high"
    elif confidence >= 0.5:
        return "medium"
    else:
        return "low"


def generate_risk_indicators(features: Dict, prediction: str) -> List[Dict]:
    """Generate risk indicators from features."""
    indicators = []

    # Urgency language
    if features.get('urgency_score', 0) > 0.1:
        severity = "high" if features['urgency_score'] > 0.3 else "medium"
        indicators.append({
            "indicator": "Urgency Language Detected",
            "detail": f"High urgency score: {features['urgency_score']:.2f}. Email uses urgent language to pressure action.",
            "severity": severity
        })

    # Threat language
    if features.get('threat_score', 0) > 0.1:
        severity = "high" if features['threat_score'] > 0.3 else "medium"
        indicators.append({
            "indicator": "Threatening Language Detected",
            "detail": f"Threat score: {features['threat_score']:.2f}. Email contains threatening language.",
            "severity": severity
        })

    # Reward/prize language
    if features.get('reward_score', 0) > 0.1:
        severity = "high" if features['reward_score'] > 0.3 else "medium"
        indicators.append({
            "indicator": "Reward/Prize Language Detected",
            "detail": f"Reward score: {features['reward_score']:.2f}. Email offers prizes or rewards.",
            "severity": severity
        })

    # IP-based URL
    if features.get('has_ip_url', False):
        indicators.append({
            "indicator": "IP-Based URL Detected",
            "detail": "Email contains URLs using IP addresses instead of domain names. This is a common phishing technique.",
            "severity": "critical"
        })

    # Shortened URLs
    if features.get('has_shortened_url', False):
        indicators.append({
            "indicator": "Shortened URL Detected",
            "detail": "Email contains shortened URLs (bit.ly, tinyurl, etc.) which can hide the true destination.",
            "severity": "high"
        })

    # Suspicious TLD
    if features.get('has_suspicious_tld', False):
        indicators.append({
            "indicator": "Suspicious Domain Extension",
            "detail": "Email contains URLs with suspicious top-level domains (.xyz, .top, .click, etc.).",
            "severity": "high"
        })

    # Generic greeting
    if features.get('generic_greeting', False):
        indicators.append({
            "indicator": "Generic Greeting",
            "detail": "Email uses generic greeting like 'Dear Customer' instead of your name.",
            "severity": "medium"
        })

    # No HTTPS
    if features.get('url_count', 0) > 0 and not features.get('has_https', False):
        indicators.append({
            "indicator": "Insecure URLs",
            "detail": "Email contains URLs without HTTPS encryption.",
            "severity": "medium"
        })

    # @ symbol in URL
    if features.get('has_at_in_url', False):
        indicators.append({
            "indicator": "@ Symbol in URL",
            "detail": "URLs contain '@' symbol, a technique to obscure the true destination.",
            "severity": "high"
        })

    # High grammar errors
    if features.get('grammar_error_count', 0) > 10:
        indicators.append({
            "indicator": "Poor Grammar/Spelling",
            "detail": f"Detected {features['grammar_error_count']} potential grammar/spelling errors.",
            "severity": "medium"
        })

    # Many exclamation marks
    if features.get('exclamation_count', 0) > 3:
        indicators.append({
            "indicator": "Excessive Punctuation",
            "detail": f"Email uses {features['exclamation_count']} exclamation marks, often seen in spam/phishing.",
            "severity": "low"
        })

    # Positive indicators for legitimate emails
    if prediction == "legitimate":
        if features.get('has_signature', False):
            indicators.append({
                "indicator": "Professional Signature Present",
                "detail": "Email contains a professional signature.",
                "severity": "low"
            })
        if features.get('has_https', False):
            indicators.append({
                "indicator": "Secure URLs (HTTPS)",
                "detail": "Email uses secure HTTPS links.",
                "severity": "low"
            })

    return indicators


def generate_highlighted_words(body: str, features: Dict) -> List[Dict]:
    """Generate word positions to highlight in the email body."""
    linguistic = LinguisticAnalyzer()

    # Find urgency words
    urgency_positions = linguistic.find_keyword_positions(body, 'urgency')
    threat_positions = linguistic.find_keyword_positions(body, 'threat')
    reward_positions = linguistic.find_keyword_positions(body, 'reward')

    all_positions = urgency_positions + threat_positions + reward_positions

    # Add URL positions
    import re
    for match in re.finditer(r'https?://[^\s<>"]+', body):
        all_positions.append({
            'word': match.group(),
            'start': match.start(),
            'end': match.end(),
            'type': 'url'
        })

    return all_positions


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_email(
    request: AnalyzeRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze a single email for phishing indicators.

    Args:
        request: Email analysis request
        db: Database session

    Returns:
        Analysis response with prediction, confidence, and explanations
    """
    try:
        # Get model
        model_name = request.model_name or "random_forest"
        predictor = model_registry.get_model(model_name)

        if not predictor:
            raise HTTPException(
                status_code=404,
                detail=f"Model '{model_name}' not found. Available models: {model_registry.list_models()}"
            )

        # Extract features
        feature_extractor = FeatureExtractor()
        features = feature_extractor.extract(request.subject, request.body)
        features_dict = features.to_dict()
        features_array = features.to_array()

        # Make prediction (ML model + rule-based correction)
        ml_prediction_class, ml_confidence = predictor.predict(features_array)
        ml_proba = predictor.predict_proba(features_array)
        prediction_class, confidence = apply_rule_based_correction(
            features_dict, ml_prediction_class, (float(ml_proba[0]), float(ml_proba[1]))
        )
        prediction = "phishing" if prediction_class == 1 else "legitimate"

        # Determine threat level
        threat_level = determine_threat_level(confidence, prediction)

        # Calculate risk score (0-100)
        risk_score = int(confidence * 100) if prediction == "phishing" else int((1 - confidence) * 100)

        # Generate risk indicators
        risk_indicators_list = generate_risk_indicators(features_dict, prediction)
        risk_indicators = [RiskIndicator(**ind) for ind in risk_indicators_list]

        # Generate SHAP explanation
        explainer = SHAPExplainer(
            predictor.model,
            model_registry.feature_names
        )
        explanation = explainer.explain(features_array)

        # Convert explanation to FeatureImportance objects
        feature_importance = [
            FeatureImportance(**feat) for feat in explanation['feature_importance']
        ]
        top_phishing_indicators = [
            FeatureImportance(**feat) for feat in explanation['top_phishing_indicators']
        ]
        top_legitimate_indicators = [
            FeatureImportance(**feat) for feat in explanation['top_legitimate_indicators']
        ]

        # Generate highlighted words
        highlighted_words = generate_highlighted_words(request.body, features_dict)

        # Save to database
        save_analysis(
            db=db,
            subject=request.subject,
            body=request.body,
            prediction=prediction,
            confidence=confidence,
            threat_level=threat_level,
            risk_score=risk_score,
            model_used=model_name,
            features=features_dict,
            indicators=risk_indicators_list,
            explanation=explanation
        )

        # Build response
        response = AnalyzeResponse(
            prediction=prediction,
            confidence=confidence,
            threat_level=threat_level,
            risk_score=risk_score,
            model_used=model_name,
            risk_indicators=risk_indicators,
            feature_importance=feature_importance,
            top_phishing_indicators=top_phishing_indicators,
            top_legitimate_indicators=top_legitimate_indicators,
            features_extracted=features_dict,
            highlighted_words=highlighted_words
        )

        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")
