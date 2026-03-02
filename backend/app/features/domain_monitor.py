"""Domain monitoring for typosquatting and lookalike domain detection."""

import asyncio
import logging
from typing import Dict, List, Tuple
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class LookalikeDomain:
    """A potential lookalike domain."""
    domain: str
    technique: str  # char_swap, homoglyph, tld_variation, hyphenation, double_char, missing_char
    similarity: float  # 0.0 to 1.0
    dns_resolved: bool = False
    risk_level: str = "low"  # low, medium, high


# Common homoglyph substitutions
HOMOGLYPHS = {
    'a': ['4', '@'],
    'e': ['3'],
    'i': ['1', 'l'],
    'l': ['1', 'i'],
    'o': ['0'],
    's': ['5', '$'],
    't': ['7'],
    'g': ['9', 'q'],
    'b': ['8'],
}

# Popular TLDs for typosquatting
COMMON_TLDS = [
    "com", "net", "org", "info", "co", "io", "xyz", "online",
    "site", "website", "tech", "app", "dev", "biz",
]


def generate_lookalikes(domain: str, max_variants: int = 50) -> List[LookalikeDomain]:
    """
    Generate potential lookalike/typosquatting domains.

    Args:
        domain: The legitimate domain to check (e.g., "google.com")
        max_variants: Maximum number of variants to generate

    Returns:
        List of lookalike domains with technique and similarity
    """
    # Split domain and TLD
    parts = domain.rsplit(".", 1)
    if len(parts) != 2:
        return []

    name, tld = parts[0], parts[1]
    variants: List[LookalikeDomain] = []
    seen = set()

    def _add(d: str, technique: str, similarity: float):
        if d not in seen and d != domain and len(variants) < max_variants:
            seen.add(d)
            variants.append(LookalikeDomain(
                domain=d, technique=technique, similarity=similarity,
            ))

    # 1. Character swap (adjacent characters)
    for i in range(len(name) - 1):
        swapped = list(name)
        swapped[i], swapped[i + 1] = swapped[i + 1], swapped[i]
        _add(f"{''.join(swapped)}.{tld}", "char_swap", 0.9)

    # 2. Homoglyph substitution
    for i, char in enumerate(name):
        for sub in HOMOGLYPHS.get(char.lower(), []):
            replaced = name[:i] + sub + name[i + 1:]
            _add(f"{replaced}.{tld}", "homoglyph", 0.85)

    # 3. TLD variations
    for alt_tld in COMMON_TLDS:
        if alt_tld != tld:
            _add(f"{name}.{alt_tld}", "tld_variation", 0.7)

    # 4. Hyphenation
    for i in range(1, len(name)):
        hyphenated = name[:i] + "-" + name[i:]
        _add(f"{hyphenated}.{tld}", "hyphenation", 0.75)

    # 5. Double character
    for i in range(len(name)):
        doubled = name[:i] + name[i] + name[i:]
        _add(f"{doubled}.{tld}", "double_char", 0.8)

    # 6. Missing character
    for i in range(len(name)):
        missing = name[:i] + name[i + 1:]
        if missing:
            _add(f"{missing}.{tld}", "missing_char", 0.85)

    return variants[:max_variants]


async def check_dns_resolution(domains: List[LookalikeDomain], timeout: float = 2.0) -> List[LookalikeDomain]:
    """
    Check DNS resolution for lookalike domains.

    Args:
        domains: List of lookalike domains to check
        timeout: Timeout per DNS query in seconds

    Returns:
        Updated list with DNS resolution status
    """
    try:
        import dns.resolver
    except ImportError:
        logger.warning("dnspython not installed. Skipping DNS resolution checks.")
        return domains

    async def _check_single(domain: LookalikeDomain) -> LookalikeDomain:
        try:
            resolver = dns.resolver.Resolver()
            resolver.timeout = timeout
            resolver.lifetime = timeout

            # Run DNS query in thread to avoid blocking
            result = await asyncio.to_thread(
                resolver.resolve, domain.domain, "A"
            )
            if result:
                domain.dns_resolved = True
                # Resolved lookalike domains are more dangerous
                if domain.similarity >= 0.85:
                    domain.risk_level = "high"
                elif domain.similarity >= 0.7:
                    domain.risk_level = "medium"
                else:
                    domain.risk_level = "low"
        except Exception:
            domain.dns_resolved = False
            domain.risk_level = "low"

        return domain

    # Check all domains concurrently with timeout
    tasks = [_check_single(d) for d in domains]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    checked = []
    for r in results:
        if isinstance(r, LookalikeDomain):
            checked.append(r)
        # Skip exceptions

    return checked
