"""Threat intelligence feed endpoint."""

import asyncio
import json
import logging
from typing import List, Optional
from urllib.parse import urlparse

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from ..config import settings
from ..features.threat_feed import get_threat_feed

logger = logging.getLogger(__name__)

router = APIRouter()


class ThreatEntryResponse(BaseModel):
    url: str
    source: str
    timestamp: str
    domain: str = ""


class ThreatFeedStats(BaseModel):
    total_threats: int
    sources: List[str]
    top_domains: List[dict]
    last_updated: str


class ThreatFeedResponse(BaseModel):
    threats: List[ThreatEntryResponse]
    stats: ThreatFeedStats
    trend_summary: Optional[str] = None


@router.get("/threat-feed", response_model=ThreatFeedResponse)
async def get_threat_intelligence(
    limit: int = Query(default=50, ge=1, le=500, description="Number of threats to return"),
):
    """Get live threat intelligence feed from public phishing databases."""
    try:
        phishtank_key = getattr(settings, "PHISHTANK_API_KEY", "")
        feed = await get_threat_feed(phishtank_api_key=phishtank_key)

        # Extract domains for stats
        domain_counts: dict = {}
        threat_entries = []

        for entry in feed.threats[:limit]:
            try:
                parsed = urlparse(entry.url)
                domain = parsed.netloc or ""
            except Exception:
                domain = ""

            if domain:
                domain_counts[domain] = domain_counts.get(domain, 0) + 1

            threat_entries.append(ThreatEntryResponse(
                url=entry.url,
                source=entry.source,
                timestamp=entry.timestamp,
                domain=domain,
            ))

        # Top targeted domains
        top_domains = sorted(domain_counts.items(), key=lambda x: -x[1])[:10]
        top_domains_list = [{"domain": d, "count": c} for d, c in top_domains]

        stats = ThreatFeedStats(
            total_threats=feed.total_count,
            sources=feed.sources,
            top_domains=top_domains_list,
            last_updated=feed.last_updated,
        )

        # Optional Gemini trend summary
        trend_summary = None
        if settings.GEMINI_API_KEY and threat_entries:
            try:
                from google import genai

                client = genai.Client(api_key=settings.GEMINI_API_KEY)

                sample_urls = [t.url for t in threat_entries[:20]]
                sample_domains = [d["domain"] for d in top_domains_list[:5]]

                prompt = f"""You are a cybersecurity analyst. Based on this sample of current phishing threats, provide a brief 2-3 sentence trend summary.

Sample phishing URLs ({len(sample_urls)} of {feed.total_count} total):
{chr(10).join(sample_urls[:15])}

Most targeted domains: {', '.join(sample_domains) if sample_domains else 'Various'}
Sources: {', '.join(feed.sources)}

Provide a concise trend analysis (2-3 sentences) identifying patterns like targeted sectors, common techniques, or notable campaigns. Be specific and actionable."""

                def _call():
                    response = client.models.generate_content(
                        model=settings.GEMINI_MODEL,
                        contents=prompt,
                    )
                    return response.text

                trend_summary = await asyncio.to_thread(_call)
            except Exception as e:
                logger.warning(f"Gemini trend summary failed: {e}")

        return ThreatFeedResponse(
            threats=threat_entries,
            stats=stats,
            trend_summary=trend_summary,
        )

    except Exception as e:
        logger.error(f"Threat feed failed: {e}")
        raise HTTPException(status_code=500, detail=f"Threat feed failed: {str(e)}")
