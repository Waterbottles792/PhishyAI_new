"""Email header analysis for phishing detection."""

import re
import email
from typing import Dict, List, Optional
from dataclasses import dataclass, field


@dataclass
class HeaderAnalysisResult:
    """Parsed email header analysis."""
    from_address: str = ""
    reply_to: str = ""
    return_path: str = ""
    sender_ip: str = ""
    spf_result: str = "none"
    dkim_result: str = "none"
    dmarc_result: str = "none"
    received_hops: List[Dict[str, str]] = field(default_factory=list)
    reply_to_mismatch: bool = False
    authentication_results: Dict[str, str] = field(default_factory=dict)
    raw_headers: Dict[str, str] = field(default_factory=dict)


class HeaderAnalyzer:
    """Analyzes raw email headers for security indicators."""

    def analyze(self, raw_headers: str) -> HeaderAnalysisResult:
        """Parse and analyze raw email headers."""
        result = HeaderAnalysisResult()

        # Parse headers using Python email module
        msg = email.message_from_string(raw_headers)

        # Extract key headers
        result.from_address = msg.get("From", "")
        result.reply_to = msg.get("Reply-To", "")
        result.return_path = msg.get("Return-Path", "")

        # Store all raw headers
        for key, value in msg.items():
            result.raw_headers[key] = value

        # Extract sender IP from Received headers
        result.sender_ip = self._extract_sender_ip(msg)

        # Parse authentication results
        auth_results = msg.get("Authentication-Results", "")
        result.spf_result = self._parse_auth_result(auth_results, "spf")
        result.dkim_result = self._parse_auth_result(auth_results, "dkim")
        result.dmarc_result = self._parse_auth_result(auth_results, "dmarc")

        # Also check individual headers
        spf_header = msg.get("Received-SPF", "")
        if spf_header and result.spf_result == "none":
            if "pass" in spf_header.lower():
                result.spf_result = "pass"
            elif "fail" in spf_header.lower():
                result.spf_result = "fail"
            elif "softfail" in spf_header.lower():
                result.spf_result = "softfail"

        dkim_sig = msg.get("DKIM-Signature", "")
        if dkim_sig and result.dkim_result == "none":
            result.dkim_result = "present"

        result.authentication_results = {
            "spf": result.spf_result,
            "dkim": result.dkim_result,
            "dmarc": result.dmarc_result,
        }

        # Parse received hops
        result.received_hops = self._parse_received_hops(msg)

        # Check Reply-To mismatch
        result.reply_to_mismatch = self._check_reply_to_mismatch(
            result.from_address, result.reply_to
        )

        return result

    def _extract_sender_ip(self, msg: email.message.Message) -> str:
        """Extract the originating sender IP from Received headers."""
        received_headers = msg.get_all("Received", [])
        if not received_headers:
            return ""

        # The last Received header is typically the originating one
        last_received = received_headers[-1] if received_headers else ""
        ip_match = re.search(r'\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]', last_received)
        if ip_match:
            return ip_match.group(1)
        return ""

    def _parse_auth_result(self, auth_header: str, mechanism: str) -> str:
        """Parse SPF/DKIM/DMARC result from Authentication-Results header."""
        if not auth_header:
            return "none"

        auth_lower = auth_header.lower()
        # Match patterns like "spf=pass", "dkim=fail", "dmarc=none"
        pattern = rf'{mechanism}\s*=\s*(\w+)'
        match = re.search(pattern, auth_lower)
        if match:
            return match.group(1)
        return "none"

    def _parse_received_hops(self, msg: email.message.Message) -> List[Dict[str, str]]:
        """Parse Received headers into a list of routing hops."""
        received_headers = msg.get_all("Received", [])
        hops = []

        for i, header in enumerate(received_headers):
            hop = {"hop": str(i + 1), "raw": header.strip()}

            # Extract 'from' server
            from_match = re.search(r'from\s+([\w\.\-]+)', header, re.IGNORECASE)
            if from_match:
                hop["from"] = from_match.group(1)

            # Extract 'by' server
            by_match = re.search(r'by\s+([\w\.\-]+)', header, re.IGNORECASE)
            if by_match:
                hop["by"] = by_match.group(1)

            # Extract IP
            ip_match = re.search(r'\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]', header)
            if ip_match:
                hop["ip"] = ip_match.group(1)

            # Extract timestamp
            date_match = re.search(r';\s*(.+)$', header)
            if date_match:
                hop["timestamp"] = date_match.group(1).strip()

            hops.append(hop)

        return hops

    def _check_reply_to_mismatch(self, from_addr: str, reply_to: str) -> bool:
        """Check if Reply-To domain differs from From domain."""
        if not reply_to or not from_addr:
            return False

        from_domain = self._extract_domain(from_addr)
        reply_domain = self._extract_domain(reply_to)

        if from_domain and reply_domain:
            return from_domain.lower() != reply_domain.lower()
        return False

    def _extract_domain(self, address: str) -> str:
        """Extract domain from an email address string."""
        # Handle format: "Name <email@domain.com>" or "email@domain.com"
        match = re.search(r'[\w\.\-\+]+@([\w\.\-]+)', address)
        if match:
            return match.group(1)
        return ""
