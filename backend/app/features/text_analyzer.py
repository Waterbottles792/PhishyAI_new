"""Text analysis for basic email features."""

import re
from typing import Dict


class TextAnalyzer:
    """Analyzes basic text features of emails."""

    GREETING_PATTERNS = [
        r'^(dear|hello|hi|greetings|good morning|good afternoon|hey)',
    ]

    GENERIC_GREETING_PATTERNS = [
        r'^dear\s+(customer|user|member|account holder|sir|madam|valued customer|friend)',
        r'^hello\s+(customer|user|member)',
        r'^hi\s+(customer|user|member)',
    ]

    SIGNATURE_PATTERNS = [
        r'(best regards|sincerely|yours truly|kind regards|thanks|best|cheers)',
        r'(sent from my|get outlook|sent via)',
    ]

    def __init__(self):
        """Initialize text analyzer."""
        pass

    def analyze(self, subject: str, body: str) -> Dict:
        """
        Analyze basic text features.

        Args:
            subject: Email subject
            body: Email body

        Returns:
            Dictionary of text features
        """
        full_text = f"{subject} {body}"
        words = full_text.split()
        body_lower = body.lower().strip()

        features = {
            'word_count': len(words),
            'avg_word_length': self._calculate_avg_word_length(words),
            'special_char_ratio': self._calculate_special_char_ratio(full_text),
            'capitalized_word_ratio': self._calculate_caps_ratio(full_text),
            'exclamation_count': full_text.count('!'),
            'has_greeting': self._has_greeting(body_lower),
            'generic_greeting': self._is_generic_greeting(body_lower),
            'has_signature': self._has_signature(body_lower),
        }

        return features

    def _calculate_avg_word_length(self, words: list) -> float:
        """Calculate average word length."""
        if not words:
            return 0.0
        # Filter out non-alphanumeric words
        alpha_words = [w for w in words if any(c.isalnum() for c in w)]
        if not alpha_words:
            return 0.0
        return sum(len(w) for w in alpha_words) / len(alpha_words)

    def _calculate_special_char_ratio(self, text: str) -> float:
        """Calculate ratio of special characters to total characters."""
        if not text:
            return 0.0
        special_count = sum(1 for c in text if not c.isalnum() and not c.isspace())
        return special_count / len(text)

    def _calculate_caps_ratio(self, text: str) -> float:
        """Calculate ratio of ALL-CAPS words to total words."""
        words = text.split()
        if not words:
            return 0.0
        # Count words that are all caps and longer than 1 character
        caps_words = sum(1 for w in words if w.isupper() and len(w) > 1 and w.isalpha())
        return caps_words / len(words)

    def _has_greeting(self, text: str) -> bool:
        """Check if email starts with a greeting."""
        # Check first 100 characters
        start_text = text[:100]
        for pattern in self.GREETING_PATTERNS:
            if re.search(pattern, start_text, re.IGNORECASE):
                return True
        return False

    def _is_generic_greeting(self, text: str) -> bool:
        """Check if email uses generic greeting instead of personalized."""
        # Check first 100 characters
        start_text = text[:100]
        for pattern in self.GENERIC_GREETING_PATTERNS:
            if re.search(pattern, start_text, re.IGNORECASE):
                return True
        return False

    def _has_signature(self, text: str) -> bool:
        """Check if email has a signature at the end."""
        # Check last 200 characters
        end_text = text[-200:]
        for pattern in self.SIGNATURE_PATTERNS:
            if re.search(pattern, end_text, re.IGNORECASE):
                return True
        return False
