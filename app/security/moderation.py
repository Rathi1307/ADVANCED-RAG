"""L7a / L7b: Content Moderation & PII Redaction Filter."""

import re
from typing import Tuple

# Regex patterns for common sensitive SRE data (PII, tokens, IPs, keys)
PII_PATTERNS = [
    # IPv4 addresses
    (r"\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b", "[REDACTED_IP]"),
    # Email addresses
    (r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b", "[REDACTED_EMAIL]"),
    # API keys / Bearer tokens / AWS secrets
    (r"(?i)(?:bearer\s+[a-zA-Z0-9_\-\.]{20,}|(?:akias|aws|sk_live|secret_key)[a-zA-Z0-9_]{16,})", "[REDACTED_SECRET]"),
    # Credit Card numbers (13-16 digits)
    (r"\b(?:\d[ -]*?){13,16}\b", "[REDACTED_CARD]"),
]


def redact_pii(text: str) -> Tuple[str, int]:
    """
    Redacts sensitive personal and operational secrets from text.
    Returns (redacted_text, count_of_redactions).
    """
    redacted = text
    total_redactions = 0
    for pattern, placeholder in PII_PATTERNS:
        matches = len(re.findall(pattern, redacted))
        if matches > 0:
            total_redactions += matches
            redacted = re.sub(pattern, placeholder, redacted)
    return redacted, total_redactions
