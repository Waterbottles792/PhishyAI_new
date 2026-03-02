"""Threat intelligence feed aggregator."""

import asyncio
import logging
import time
from typing import Dict, List, Optional
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)

try:
    from cachetools import TTLCache
    _feed_cache: TTLCache = TTLCache(maxsize=1, ttl=1800)  # 30-minute cache
except ImportError:
    logger.warning("cachetools not installed. Feed caching disabled.")
    _feed_cache: dict = {}


@dataclass
class ThreatEntry:
    """A single threat intelligence entry."""
    url: str
    source: str
    timestamp: str = ""
    status: str = "active"


@dataclass
class ThreatFeedResult:
    """Aggregated threat feed results."""
    threats: List[ThreatEntry] = field(default_factory=list)
    total_count: int = 0
    sources: List[str] = field(default_factory=list)
    last_updated: str = ""


async def fetch_openphish_feed() -> List[ThreatEntry]:
    """Fetch from OpenPhish free community feed."""
    try:
        import aiohttp

        async with aiohttp.ClientSession() as session:
            async with session.get(
                "https://openphish.com/feed.txt",
                timeout=aiohttp.ClientTimeout(total=10),
            ) as response:
                if response.status == 200:
                    text = await response.text()
                    entries = []
                    for line in text.strip().split("\n"):
                        line = line.strip()
                        if line and line.startswith("http"):
                            entries.append(ThreatEntry(
                                url=line,
                                source="OpenPhish",
                                timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                            ))
                    return entries
                else:
                    logger.warning(f"OpenPhish returned status {response.status}")
                    return []
    except ImportError:
        logger.warning("aiohttp not installed. Cannot fetch OpenPhish feed.")
        return []
    except Exception as e:
        logger.error(f"OpenPhish fetch failed: {e}")
        return []


async def fetch_phishtank_feed(api_key: str = "") -> List[ThreatEntry]:
    """Fetch from PhishTank (requires optional API key for higher rate limits)."""
    if not api_key:
        return []

    try:
        import aiohttp

        url = "http://data.phishtank.com/data/online-valid.json"
        headers = {}
        if api_key:
            url = f"http://data.phishtank.com/data/{api_key}/online-valid.json"

        async with aiohttp.ClientSession() as session:
            async with session.get(
                url,
                timeout=aiohttp.ClientTimeout(total=15),
                headers=headers,
            ) as response:
                if response.status == 200:
                    data = await response.json(content_type=None)
                    entries = []
                    for item in data[:500]:  # Limit to 500 entries
                        entries.append(ThreatEntry(
                            url=item.get("url", ""),
                            source="PhishTank",
                            timestamp=item.get("submission_time", ""),
                            status="active" if item.get("verified") == "yes" else "unverified",
                        ))
                    return entries
                else:
                    logger.warning(f"PhishTank returned status {response.status}")
                    return []
    except ImportError:
        logger.warning("aiohttp not installed. Cannot fetch PhishTank feed.")
        return []
    except Exception as e:
        logger.error(f"PhishTank fetch failed: {e}")
        return []


async def get_threat_feed(phishtank_api_key: str = "") -> ThreatFeedResult:
    """
    Get aggregated threat intelligence feed.

    Uses 30-minute TTL cache to avoid excessive API calls.
    """
    cache_key = "threat_feed"
    cached = _feed_cache.get(cache_key)
    if cached:
        return cached

    # Fetch from all sources concurrently
    openphish_task = fetch_openphish_feed()
    phishtank_task = fetch_phishtank_feed(phishtank_api_key)

    openphish_entries, phishtank_entries = await asyncio.gather(
        openphish_task, phishtank_task
    )

    all_threats = openphish_entries + phishtank_entries
    sources = []
    if openphish_entries:
        sources.append("OpenPhish")
    if phishtank_entries:
        sources.append("PhishTank")

    result = ThreatFeedResult(
        threats=all_threats,
        total_count=len(all_threats),
        sources=sources,
        last_updated=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    )

    # Cache the result
    _feed_cache[cache_key] = result

    return result
