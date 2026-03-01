"""
Feature extraction engine.
Takes raw email text (and optionally headers) and returns a feature dictionary.
"""

import re
import numpy as np
from dataclasses import dataclass, asdict
from typing import Optional, Dict, List
from .url_analyzer import URLAnalyzer
from .text_analyzer import TextAnalyzer
from .linguistic import LinguisticAnalyzer


@dataclass
class EmailFeatures:
    """Email feature dataclass with all extracted features."""

    # Text/Linguistic Features
    urgency_score: float = 0.0
    threat_score: float = 0.0
    reward_score: float = 0.0
    grammar_error_count: int = 0
    capitalized_word_ratio: float = 0.0
    exclamation_count: int = 0
    sentiment_score: float = 0.0
    word_count: int = 0
    avg_word_length: float = 0.0
    special_char_ratio: float = 0.0
    has_greeting: bool = False
    generic_greeting: bool = False
    has_signature: bool = False

    # URL Features
    url_count: int = 0
    has_ip_url: bool = False
    has_shortened_url: bool = False
    url_domain_mismatch: bool = False
    has_suspicious_tld: bool = False
    has_https: bool = False
    url_length_max: int = 0
    has_at_in_url: bool = False
    subdomain_count_max: int = 0

    # Structural Features
    has_html: bool = False
    has_attachment_mention: bool = False
    has_form: bool = False
    link_text_ratio: float = 0.0

    def to_dict(self) -> Dict:
        """Convert features to dictionary."""
        return asdict(self)

    def to_array(self) -> np.ndarray:
        """Convert to numpy array for model input."""
        d = self.to_dict()
        return np.array([float(v) for v in d.values()])

    def get_feature_names(self) -> List[str]:
        """Get list of feature names in order."""
        return list(self.to_dict().keys())


class FeatureExtractor:
    """Main feature extraction class that coordinates all analyzers."""

    def __init__(self):
        """Initialize all sub-analyzers."""
        self.url_analyzer = URLAnalyzer()
        self.text_analyzer = TextAnalyzer()
        self.linguistic_analyzer = LinguisticAnalyzer()

    def extract(
        self,
        subject: str,
        body: str,
        headers: Optional[Dict] = None
    ) -> EmailFeatures:
        """
        Extract all features from an email.

        Args:
            subject: Email subject line
            body: Email body text
            headers: Optional email headers (for .eml files)

        Returns:
            EmailFeatures object with all extracted features
        """
        features = EmailFeatures()
        full_text = f"{subject} {body}"

        # Extract text/linguistic features
        text_features = self.text_analyzer.analyze(subject, body)
        features.word_count = text_features['word_count']
        features.avg_word_length = text_features['avg_word_length']
        features.special_char_ratio = text_features['special_char_ratio']
        features.capitalized_word_ratio = text_features['capitalized_word_ratio']
        features.exclamation_count = text_features['exclamation_count']
        features.has_greeting = text_features['has_greeting']
        features.generic_greeting = text_features['generic_greeting']
        features.has_signature = text_features['has_signature']

        # Extract linguistic features (keywords, sentiment, grammar)
        ling_features = self.linguistic_analyzer.analyze(full_text, body)
        features.urgency_score = ling_features['urgency_score']
        features.threat_score = ling_features['threat_score']
        features.reward_score = ling_features['reward_score']
        features.sentiment_score = ling_features['sentiment_score']
        features.grammar_error_count = ling_features['grammar_error_count']

        # Extract URL features
        url_features = self.url_analyzer.analyze(body)
        features.url_count = url_features['url_count']
        features.has_ip_url = url_features['has_ip_url']
        features.has_shortened_url = url_features['has_shortened_url']
        features.url_domain_mismatch = url_features['url_domain_mismatch']
        features.has_suspicious_tld = url_features['has_suspicious_tld']
        features.has_https = url_features['has_https']
        features.url_length_max = url_features['url_length_max']
        features.has_at_in_url = url_features['has_at_in_url']
        features.subdomain_count_max = url_features['subdomain_count_max']

        # Extract structural features
        features.has_html = bool(re.search(r'<[^>]+>', body))
        features.has_attachment_mention = bool(
            re.search(r'(see attached|download|open the|click here)', full_text.lower())
        )
        features.has_form = bool(re.search(r'<form[^>]*>', body, re.IGNORECASE))

        # Calculate link text ratio
        if features.has_html:
            # Extract text content from HTML
            text_without_tags = re.sub(r'<[^>]+>', '', body)
            link_texts = re.findall(r'<a[^>]*>([^<]+)</a>', body, re.IGNORECASE)
            link_text_length = sum(len(text) for text in link_texts)
            total_text_length = len(text_without_tags.strip())
            features.link_text_ratio = (
                link_text_length / total_text_length if total_text_length > 0 else 0.0
            )

        return features

    @staticmethod
    def get_feature_names() -> List[str]:
        """Get all feature names in the correct order."""
        return list(EmailFeatures().to_dict().keys())
