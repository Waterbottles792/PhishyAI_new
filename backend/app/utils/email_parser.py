"""Email parsing utilities for .eml files."""

import email
from email import policy
from email.parser import BytesParser
from typing import Dict, Optional
from io import BytesIO


def parse_eml_file(file_content: bytes) -> Dict[str, str]:
    """
    Parse .eml file and extract subject, body, and headers.

    Args:
        file_content: Raw bytes of .eml file

    Returns:
        Dictionary with 'subject', 'body', and 'headers'
    """
    # Parse email
    msg = BytesParser(policy=policy.default).parsebytes(file_content)

    # Extract subject
    subject = msg.get('subject', '')

    # Extract body
    body = ""
    if msg.is_multipart():
        # Handle multipart emails
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition", ""))

            # Skip attachments
            if "attachment" in content_disposition:
                continue

            # Get text content
            if content_type == "text/plain":
                try:
                    body += part.get_content()
                except Exception:
                    pass
            elif content_type == "text/html":
                try:
                    # If no plain text found yet, use HTML
                    if not body:
                        body += part.get_content()
                except Exception:
                    pass
    else:
        # Simple email
        try:
            body = msg.get_content()
        except Exception:
            body = str(msg.get_payload())

    # Extract headers
    headers = {
        'from': msg.get('from', ''),
        'to': msg.get('to', ''),
        'date': msg.get('date', ''),
        'reply-to': msg.get('reply-to', ''),
        'message-id': msg.get('message-id', ''),
        'x-mailer': msg.get('x-mailer', ''),
    }

    # Check for authentication headers
    headers['spf'] = 'spf' in str(msg.get('received-spf', '')).lower()
    headers['dkim'] = msg.get('dkim-signature') is not None

    return {
        'subject': subject,
        'body': body,
        'headers': headers
    }


def extract_sender_domain(email_address: str) -> Optional[str]:
    """
    Extract domain from email address.

    Args:
        email_address: Email address string

    Returns:
        Domain name or None
    """
    try:
        if '@' in email_address:
            # Remove any display name
            if '<' in email_address:
                email_address = email_address.split('<')[1].split('>')[0]
            return email_address.split('@')[1].strip()
    except Exception:
        pass
    return None
