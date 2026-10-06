"""L5 and L6: Token Budget Management and Input Restructuring."""

from typing import Tuple
from app.core.config import settings
from app.core.errors import TokenBudgetExceededException


def estimate_or_count_tokens(text: str) -> int:
    """Accurately count tokens via tiktoken with fallback to word heuristic."""
    try:
        import tiktoken
        enc = tiktoken.get_encoding("cl100k_base")
        return len(enc.encode(text))
    except Exception:
        # 1 token ~= 4 chars or 0.75 words
        return max(1, len(text.split()) * 4 // 3)


def truncate_input_tokens(text: str, max_tokens: int = settings.MAX_INPUT_TOKENS) -> Tuple[str, bool, int]:
    """
    L5: Truncate oversized input queries safely.
    Returns (truncated_text, was_truncated, token_count).
    """
    try:
        import tiktoken
        enc = tiktoken.get_encoding("cl100k_base")
        tokens = enc.encode(text)
        if len(tokens) > max_tokens:
            truncated = enc.decode(tokens[:max_tokens])
            return truncated, True, max_tokens
        return text, False, len(tokens)
    except Exception:
        words = text.split()
        if len(words) > max_tokens:
            return " ".join(words[:max_tokens]), True, max_tokens
        return text, False, len(words)


def verify_user_token_budget(current_used: int, new_tokens: int, daily_budget: int = settings.TOKEN_BUDGET_PER_DAY) -> None:
    """L6: Verify user has not exceeded daily token allocation."""
    if current_used + new_tokens > daily_budget:
        raise TokenBudgetExceededException(
            f"Daily token budget of {daily_budget} exceeded (currently used: {current_used}, attempted: {new_tokens})"
        )
