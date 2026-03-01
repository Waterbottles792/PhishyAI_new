"""Linguistic analysis including sentiment, keywords, and grammar."""

import re
from typing import Dict, List
from textblob import TextBlob


class LinguisticAnalyzer:
    """Analyzes linguistic features like keywords, sentiment, and grammar."""

    URGENCY_WORDS = [
        "immediately", "urgent", "act now", "expires", "limited time",
        "warning", "suspended", "verify now", "within 24 hours",
        "action required", "time sensitive", "deadline", "asap",
        "right away", "don't delay", "hurry", "last chance",
        "respond immediately", "final notice", "expiring soon"
    ]

    THREAT_WORDS = [
        "suspended", "terminated", "unauthorized", "breach",
        "compromised", "locked", "disabled", "restricted",
        "illegal", "violation", "penalty", "fraud detected",
        "account closed", "security alert", "unusual activity",
        "blocked", "deactivated", "frozen"
    ]

    REWARD_WORDS = [
        "winner", "congratulations", "prize", "selected",
        "reward", "free", "bonus", "gift", "lottery",
        "exclusive offer", "claim your", "you've won",
        "cash prize", "grand prize", "lucky", "jackpot",
        "claim now", "limited offer"
    ]

    def __init__(self, enable_grammar_check: bool = True, max_errors: int = 50):
        """
        Initialize linguistic analyzer.

        Args:
            enable_grammar_check: Whether to perform grammar checking
            max_errors: Maximum number of grammar errors to count
        """
        self.enable_grammar_check = enable_grammar_check
        self.max_errors = max_errors

    def analyze(self, full_text: str, body: str) -> Dict:
        """
        Analyze linguistic features.

        Args:
            full_text: Combined subject + body
            body: Email body only

        Returns:
            Dictionary of linguistic features
        """
        full_text_lower = full_text.lower()
        words = full_text_lower.split()

        features = {
            'urgency_score': self._calculate_keyword_density(
                full_text_lower, words, self.URGENCY_WORDS
            ),
            'threat_score': self._calculate_keyword_density(
                full_text_lower, words, self.THREAT_WORDS
            ),
            'reward_score': self._calculate_keyword_density(
                full_text_lower, words, self.REWARD_WORDS
            ),
            'sentiment_score': self._analyze_sentiment(body),
            'grammar_error_count': self._count_grammar_errors(body),
        }

        return features

    def _calculate_keyword_density(
        self,
        text: str,
        words: List[str],
        keywords: List[str]
    ) -> float:
        """
        Calculate density of specific keywords in text.

        Args:
            text: Text to analyze
            words: List of words in text
            keywords: List of keywords to search for

        Returns:
            Keyword density score (0.0 to 1.0)
        """
        if not words:
            return 0.0

        # Count keyword occurrences
        count = sum(1 for keyword in keywords if keyword in text)

        # Normalize by word count and scale
        # Using scaling factor of 10 to make scores more meaningful
        density = min(count / len(words) * 10, 1.0)
        return round(density, 4)

    def _analyze_sentiment(self, text: str) -> float:
        """
        Analyze sentiment polarity of text.

        Args:
            text: Text to analyze

        Returns:
            Sentiment score (-1.0 to 1.0)
        """
        try:
            blob = TextBlob(text)
            # Polarity ranges from -1 (negative) to 1 (positive)
            return round(blob.sentiment.polarity, 4)
        except Exception:
            return 0.0

    def _count_grammar_errors(self, text: str) -> int:
        """
        Count grammar errors in text.

        Note: This is a simplified version. For production, you could use
        language_tool_python for more accurate grammar checking, but it
        requires downloading a language model and is slower.

        Args:
            text: Text to analyze

        Returns:
            Number of grammar errors (simplified heuristic)
        """
        if not self.enable_grammar_check:
            return 0

        error_count = 0

        # Simple heuristic-based grammar checks
        # 1. Check for repeated words
        words = text.lower().split()
        for i in range(len(words) - 1):
            if words[i] == words[i + 1] and len(words[i]) > 2:
                error_count += 1

        # 2. Check for sentences not starting with capital letter
        sentences = re.split(r'[.!?]+', text)
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence and not sentence[0].isupper():
                error_count += 1

        # 3. Check for basic spelling issues (very simple)
        # Multiple consecutive consonants or vowels
        unusual_patterns = re.findall(r'[bcdfghjklmnpqrstvwxyz]{4,}|[aeiou]{4,}', text.lower())
        error_count += len(unusual_patterns)

        # 4. Check for excessive punctuation
        excessive_punct = re.findall(r'[!?]{2,}|\.{4,}', text)
        error_count += len(excessive_punct)

        return min(error_count, self.max_errors)

    def find_keyword_positions(
        self,
        text: str,
        keyword_type: str = 'all'
    ) -> List[Dict]:
        """
        Find positions of keywords in text for highlighting.

        Args:
            text: Text to search
            keyword_type: Type of keywords ('urgency', 'threat', 'reward', or 'all')

        Returns:
            List of dicts with {word, start, end, type}
        """
        positions = []
        text_lower = text.lower()

        keyword_sets = {
            'urgency': self.URGENCY_WORDS,
            'threat': self.THREAT_WORDS,
            'reward': self.REWARD_WORDS,
        }

        if keyword_type == 'all':
            search_sets = keyword_sets
        else:
            search_sets = {keyword_type: keyword_sets.get(keyword_type, [])}

        for kw_type, keywords in search_sets.items():
            for keyword in keywords:
                # Find all occurrences of this keyword
                for match in re.finditer(re.escape(keyword), text_lower):
                    positions.append({
                        'word': keyword,
                        'start': match.start(),
                        'end': match.end(),
                        'type': kw_type
                    })

        # Sort by position
        positions.sort(key=lambda x: x['start'])
        return positions
