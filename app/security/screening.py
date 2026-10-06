"""L1 Regex Screening and L2 Prompt-Injection / Toxicity Scanner."""

import re
from typing import Tuple, List
from app.core.errors import SecurityViolationException

# L1: Disallowed injection and destructive pattern rules
DISALLOWED_PATTERNS = [
    (r"(?i)\b(ignore\s+(all\s+)?previous\s+instructions|system\s+prompt\s+override|disregard\s+all\s+rules)\b", "Prompt injection attempt detected"),
    (r"(?i)\b(drop\s+table|drop\s+database|truncate\s+table|delete\s+from|insert\s+into|update\s+\w+\s+set)\b", "Direct mutation SQL pattern detected in query text"),
    (r"(?i)(<\s*script[^>]*>|javascript:|eval\(|base64_decode\()", "Potentially malicious script payload"),
    (r"(?i)\b(rm\s+-rf|curl\s+.*\|\s*sh|chmod\s+777|wget\s+.*\|\s*bash)\b", "Disallowed shell execution pattern"),
]


def screen_input_text(text: str) -> Tuple[bool, List[str]]:
    """L1 screening against known injection and attack vectors."""
    violations = []
    for pattern, reason in DISALLOWED_PATTERNS:
        if re.search(pattern, text):
            violations.append(reason)
    return len(violations) == 0, violations


def scan_prompt_injection(text: str) -> Tuple[bool, float, str]:
    """
    L2 scanner adapter (llm-guard or deterministic safety double).
    Returns (is_safe, injection_score, message).
    """
    # Check L1 first
    is_clean, violations = screen_input_text(text)
    if not is_clean:
        return False, 0.95, "; ".join(violations)

    # Secondary heuristic check
    suspicious_keywords = ["jailbreak", "DAN mode", "unrestricted assistant", "reveal system instructions"]
    for kw in suspicious_keywords:
        if kw.lower() in text.lower():
            return False, 0.85, f"Suspicious override keyword: '{kw}'"

    return True, 0.05, "Clean"
