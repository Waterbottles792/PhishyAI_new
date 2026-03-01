"""URL analysis for phishing detection."""

import re
from typing import Dict, List
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

    def __init__(self):
        """Initialize URL analyzer."""
        pass

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
