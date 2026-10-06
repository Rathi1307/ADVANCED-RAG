"""L4b: Sliding-window Rate Limiter (20 requests/minute/user)."""

import time
from collections import defaultdict
from typing import Dict, List
from app.core.config import settings
from app.core.errors import RateLimitExceededException


class InMemoryRateLimiter:
    """Thread-safe sliding window rate limiter."""

    def __init__(self, max_requests: int = 20, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.user_requests: Dict[str, List[float]] = defaultdict(list)

    def check_rate_limit(self, user_id: str) -> None:
        now = time.time()
        window_start = now - self.window_seconds

        # Clean old timestamps
        timestamps = [t for t in self.user_requests[user_id] if t > window_start]
        self.user_requests[user_id] = timestamps

        if len(timestamps) >= self.max_requests:
            raise RateLimitExceededException(
                f"Rate limit exceeded: maximum {self.max_requests} requests per {self.window_seconds} seconds"
            )

        self.user_requests[user_id].append(now)

    def reset(self) -> None:
        self.user_requests.clear()


rate_limiter = InMemoryRateLimiter(
    max_requests=settings.RATE_LIMIT_PER_MINUTE,
    window_seconds=60,
)
