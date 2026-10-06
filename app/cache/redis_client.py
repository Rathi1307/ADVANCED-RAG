"""Redis Cache Client with thread-safe In-Memory Fallback."""

import time
import json
from typing import Optional, Any, Dict
from app.core.config import settings
from app.core.logging import logger

try:
    import redis.asyncio as redis
except ImportError:
    redis = None


class BaseCache:
    async def get(self, key: str) -> Optional[str]:
        raise NotImplementedError

    async def set(self, key: str, value: str, ttl_seconds: int) -> None:
        raise NotImplementedError

    async def delete(self, key: str) -> None:
        raise NotImplementedError

    async def flush(self) -> None:
        raise NotImplementedError


class InMemoryCache(BaseCache):
    """In-memory cache with explicit TTL expiration."""

    def __init__(self):
        self._store: Dict[str, tuple[str, float]] = {}

    async def get(self, key: str) -> Optional[str]:
        if key in self._store:
            val, expiry = self._store[key]
            if expiry > time.time():
                return val
            else:
                del self._store[key]
        return None

    async def set(self, key: str, value: str, ttl_seconds: int) -> None:
        expiry = time.time() + ttl_seconds
        self._store[key] = (value, expiry)

    async def delete(self, key: str) -> None:
        self._store.pop(key, None)

    async def flush(self) -> None:
        self._store.clear()


class RedisCache(BaseCache):
    """Async Redis cache client."""

    def __init__(self, redis_url: str):
        self.client = redis.from_url(redis_url, decode_responses=True)

    async def get(self, key: str) -> Optional[str]:
        return await self.client.get(key)

    async def set(self, key: str, value: str, ttl_seconds: int) -> None:
        await self.client.set(key, value, ex=ttl_seconds)

    async def delete(self, key: str) -> None:
        await self.client.delete(key)

    async def flush(self) -> None:
        await self.client.flushdb()


# Initialize cache instance based on configuration
if settings.REDIS_URL and redis:
    try:
        cache_client = RedisCache(settings.REDIS_URL)
        logger.info("Connected to Redis cache at %s", settings.REDIS_URL)
    except Exception as e:
        logger.warning("Failed to connect to Redis (%s), falling back to InMemoryCache", str(e))
        cache_client = InMemoryCache()
else:
    cache_client = InMemoryCache()
