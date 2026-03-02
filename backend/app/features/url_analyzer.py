"""URL analysis for phishing detection."""

import re
from typing import Dict, List, Optional, Tuple
import tldextract
from urllib.parse import urlparse


class URLAnalyzer:
    """Analyzes URLs in email content for phishing indicators."""

    SUSPICIOUS_TLDS = [
        ".xyz", ".top", ".buzz", ".click", ".info", ".tk",
        ".ml", ".ga", ".cf", ".gq", ".work", ".party"
    ]

    SHORTENED_DOMAINS = [
        "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly",
        "is.gd", "buff.ly", "adf.ly", "bc.vc", "short.link"
    ]

    # Known brands that phishers commonly impersonate
    KNOWN_BRANDS = [
        "paypal", "apple", "google", "microsoft", "amazon", "netflix",
        "facebook", "instagram", "twitter", "linkedin", "dropbox",
        "chase", "wellsfargo", "bankofamerica", "citibank", "usbank",
        "americanexpress", "amex", "visa", "mastercard",
        "outlook", "office365", "onedrive", "icloud",
        "coinbase", "binance", "blockchain",
        "dhl", "fedex", "ups", "usps",
        "whatsapp", "telegram", "discord", "slack", "zoom",
        "ebay", "walmart", "target", "costco",
        "steam", "epicgames", "roblox",
    ]

    # Common character substitutions used in typosquatting
    HOMOGLYPHS = {
        'a': ['@', '4', 'à', 'á', 'â', 'ã', 'ä'],
        'e': ['3', 'è', 'é', 'ê', 'ë'],
        'i': ['1', '!', 'l', '|', 'í', 'ì', 'î', 'ï'],
        'l': ['1', '!', 'i', '|'],
        'o': ['0', 'ò', 'ó', 'ô', 'õ', 'ö'],
        's': ['5', '$'],
        't': ['7', '+'],
        'g': ['9', 'q'],
        'b': ['8'],
    }

    # Suspicious keywords commonly found in phishing URLs
    SUSPICIOUS_KEYWORDS = [
        "verify", "secure", "account", "login", "signin", "sign-in",
        "update", "confirm", "billing", "suspend", "restore",
        "unlock", "authenticate", "validate", "recover", "alert",
        "notification", "security", "password", "credential",
    ]

    def __init__(self):
        """Initialize URL analyzer."""
        # Build reverse homoglyph map: substitute -> original char
        self._reverse_homoglyphs: Dict[str, str] = {}
        for original, subs in self.HOMOGLYPHS.items():
            for sub in subs:
                self._reverse_homoglyphs[sub] = original

    def analyze(self, text: str) -> Dict:
        """
        Analyze URLs in the given text.

        Args:
            text: Text content to analyze

        Returns:
            Dictionary of URL-related features
        """
        # Extract all URLs
        urls = self._extract_urls(text)

        # Check for brand impersonation
        brand_match = self._detect_brand_impersonation(urls)

        features = {
            'url_count': len(urls),
            'has_ip_url': self._has_ip_based_url(urls),
            'has_shortened_url': self._has_shortened_url(urls),
            'url_domain_mismatch': self._check_domain_mismatch(text, urls),
            'has_suspicious_tld': self._has_suspicious_tld(urls),
            'has_https': self._has_https(urls),
            'url_length_max': self._get_max_url_length(urls),
            'has_at_in_url': self._has_at_symbol(urls),
            'subdomain_count_max': self._get_max_subdomain_count(urls),
            'has_brand_impersonation': brand_match[0],
            'impersonated_brand': brand_match[1],
            'has_suspicious_keywords': self._has_suspicious_keywords(urls),
            'suspicious_keywords_found': self._get_suspicious_keywords(urls),
            'has_excessive_hyphens': self._has_excessive_hyphens(urls),
        }

        return features

    def _extract_urls(self, text: str) -> List[str]:
        """Extract all URLs from text."""
        # Match http:// or https:// URLs
        url_pattern = r'https?://[^\s<>"\']+|www\.[^\s<>"\']+'
        urls = re.findall(url_pattern, text, re.IGNORECASE)
        return urls

    def _has_ip_based_url(self, urls: List[str]) -> bool:
        """Check if any URL uses an IP address instead of domain."""
        ip_pattern = r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}'
        return any(re.match(ip_pattern, url) for url in urls)

    def _has_shortened_url(self, urls: List[str]) -> bool:
        """Check if any URL is from a URL shortening service."""
        return any(
            any(domain in url.lower() for domain in self.SHORTENED_DOMAINS)
            for url in urls
        )

    def _check_domain_mismatch(self, text: str, urls: List[str]) -> bool:
        """
        Check if displayed link text doesn't match the actual URL.
        Example: <a href="http://evil.com">paypal.com</a>
        """
        # Find HTML links with href and text
        link_pattern = r'<a[^>]*href=["\']([^"\']+)["\'][^>]*>([^<]+)</a>'
        html_links = re.findall(link_pattern, text, re.IGNORECASE)

        for href, link_text in html_links:
            # Extract domain from href
            try:
                href_domain = urlparse(href).netloc.lower()
                # Check if link text looks like a different domain
                if re.match(r'^[a-zA-Z0-9.-]+\.(com|net|org|edu)', link_text.lower()):
                    text_domain = link_text.lower().strip()
                    if text_domain not in href_domain and href_domain not in text_domain:
                        return True
            except Exception:
                continue

        return False

    def _has_suspicious_tld(self, urls: List[str]) -> bool:
        """Check if any URL has a suspicious top-level domain."""
        for url in urls:
            for tld in self.SUSPICIOUS_TLDS:
                # Check if URL ends with suspicious TLD
                if tld in url.lower():
                    return True
        return False

    def _has_https(self, urls: List[str]) -> bool:
        """Check if any URLs use HTTPS."""
        if not urls:
            return False
        return any(url.lower().startswith('https://') for url in urls)

    def _get_max_url_length(self, urls: List[str]) -> int:
        """Get the length of the longest URL."""
        return max((len(url) for url in urls), default=0)

    def _has_at_symbol(self, urls: List[str]) -> bool:
        """Check if any URL contains @ symbol (phishing technique)."""
        return any('@' in url for url in urls)

    def _get_max_subdomain_count(self, urls: List[str]) -> int:
        """Get the maximum number of subdomains in any URL."""
        max_subdomains = 0

        for url in urls:
            try:
                extracted = tldextract.extract(url)
                # Count dots in subdomain
                if extracted.subdomain:
                    subdomain_count = extracted.subdomain.count('.') + 1
                    max_subdomains = max(max_subdomains, subdomain_count)
            except Exception:
                continue

        return max_subdomains

    def _normalize_homoglyphs(self, text: str) -> str:
        """Replace common homoglyph substitutions with their original characters."""
        result = []
        for char in text.lower():
            result.append(self._reverse_homoglyphs.get(char, char))
        return ''.join(result)

    def _detect_brand_impersonation(self, urls: List[str]) -> Tuple[bool, Optional[str]]:
        """
        Detect if any URL is trying to impersonate a known brand
        via typosquatting or homoglyph substitution.
        """
        for url in urls:
            try:
                extracted = tldextract.extract(url)
                # Combine all domain parts for checking
                full_domain = f"{extracted.subdomain}.{extracted.domain}".lower()
                # Remove hyphens and dots for comparison
                domain_parts = re.split(r'[.\-]', full_domain)

                for part in domain_parts:
                    if not part:
                        continue
                    # Normalize homoglyphs in this part
                    normalized = self._normalize_homoglyphs(part)

                    for brand in self.KNOWN_BRANDS:
                        # Exact match on a legitimate domain is NOT impersonation
                        if part == brand and extracted.domain == brand:
                            continue

                        # Check if the normalized part matches a brand
                        # but the original part doesn't (homoglyph attack)
                        if normalized == brand and part != brand:
                            return True, brand

                        # Check for close misspellings (off by 1 char)
                        if part != brand and len(part) >= 4 and self._is_typosquat(part, brand):
                            return True, brand

            except Exception:
                continue

        return False, None

    def _is_typosquat(self, candidate: str, brand: str) -> bool:
        """Check if candidate is a typosquat of brand (edit distance = 1)."""
        if abs(len(candidate) - len(brand)) > 1:
            return False

        # Also check normalized version
        normalized = self._normalize_homoglyphs(candidate)
        for text in [candidate, normalized]:
            distance = self._levenshtein_distance(text, brand)
            if distance == 1:
                return True
        return False

    @staticmethod
    def _levenshtein_distance(s1: str, s2: str) -> int:
        """Compute Levenshtein distance between two strings."""
        if len(s1) < len(s2):
            return URLAnalyzer._levenshtein_distance(s2, s1)
        if len(s2) == 0:
            return len(s1)
        prev_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            curr_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = prev_row[j + 1] + 1
                deletions = curr_row[j] + 1
                substitutions = prev_row[j] + (c1 != c2)
                curr_row.append(min(insertions, deletions, substitutions))
            prev_row = curr_row
        return prev_row[-1]

    def _has_suspicious_keywords(self, urls: List[str]) -> bool:
        """Check if URL domain contains suspicious phishing keywords."""
        return len(self._get_suspicious_keywords(urls)) > 0

    def _get_suspicious_keywords(self, urls: List[str]) -> List[str]:
        """Get list of suspicious keywords found in URL domains."""
        found = set()
        for url in urls:
            try:
                extracted = tldextract.extract(url)
                # Check subdomain + domain (not path, to reduce false positives)
                domain_str = f"{extracted.subdomain}.{extracted.domain}".lower()
                for keyword in self.SUSPICIOUS_KEYWORDS:
                    if keyword in domain_str:
                        found.add(keyword)
            except Exception:
                continue
        return list(found)

    def _has_excessive_hyphens(self, urls: List[str]) -> bool:
        """Check if any URL domain has excessive hyphens (common in phishing)."""
        for url in urls:
            try:
                extracted = tldextract.extract(url)
                full_domain = f"{extracted.subdomain}.{extracted.domain}"
                if full_domain.count('-') >= 2:
                    return True
            except Exception:
                continue
        return False
