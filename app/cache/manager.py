"""5-Tier SHA-256 Cache Manager."""

import hashlib
import json
from typing import Optional, Any, Dict
from app.cache.redis_client import cache_client

# Tier TTL definitions (in seconds)
TIER_1_EMBEDDING_TTL = 7 * 86400        # 7 days
TIER_2_INTENT_TTL = 24 * 3600           # 24 hours
TIER_3_SQL_GEN_TTL = 24 * 3600          # 24 hours
TIER_4_SQL_RESULTS_TTL = 15 * 60        # 15 minutes
TIER_5_FINAL_ANSWER_TTL = 1 * 3600      # 1 hour


class CacheManager:
    """Manages 5-tier SHA-256 keyed caching."""

    @staticmethod
    def _generate_sha256_key(tier: str, **kwargs: Any) -> str:
        """Constructs a deterministic SHA-256 cache key incorporating authorization scope and versions."""
        # Sort keys deterministically
        serialized = json.dumps(kwargs, sort_keys=True, default=str)
        hash_digest = hashlib.sha256(serialized.encode("utf-8")).hexdigest()
        return f"sre_cache:{tier}:{hash_digest}"

    # Tier 1: Embeddings
    @classmethod
    async def get_embedding(cls, text: str, model: str) -> Optional[list[float]]:
        key = cls._generate_sha256_key("tier1_emb", text=text, model=model)
        val = await cache_client.get(key)
        return json.loads(val) if val else None

    @classmethod
    async def set_embedding(cls, text: str, model: str, embedding: list[float]) -> None:
        key = cls._generate_sha256_key("tier1_emb", text=text, model=model)
        await cache_client.set(key, json.dumps(embedding), TIER_1_EMBEDDING_TTL)

    # Tier 2: Intent Routing
    @classmethod
    async def get_intent(cls, question: str, prompt_version: str = "v1") -> Optional[str]:
        key = cls._generate_sha256_key("tier2_intent", question=question.strip().lower(), pv=prompt_version)
        return await cache_client.get(key)

    @classmethod
    async def set_intent(cls, question: str, intent: str, prompt_version: str = "v1") -> None:
        key = cls._generate_sha256_key("tier2_intent", question=question.strip().lower(), pv=prompt_version)
        await cache_client.set(key, intent, TIER_2_INTENT_TTL)

    # Tier 3: SQL Generation
    @classmethod
    async def get_sql_generation(cls, question: str, schema_version: str, user_role: str) -> Optional[str]:
        key = cls._generate_sha256_key("tier3_sql_gen", question=question, sv=schema_version, role=user_role)
        return await cache_client.get(key)

    @classmethod
    async def set_sql_generation(cls, question: str, schema_version: str, user_role: str, sql: str) -> None:
        key = cls._generate_sha256_key("tier3_sql_gen", question=question, sv=schema_version, role=user_role)
        await cache_client.set(key, sql, TIER_3_SQL_GEN_TTL)

    # Tier 4: SQL Results
    @classmethod
    async def get_sql_result(cls, sql_query: str, user_role: str) -> Optional[list[dict]]:
        key = cls._generate_sha256_key("tier4_sql_res", sql=sql_query.strip(), role=user_role)
        val = await cache_client.get(key)
        return json.loads(val) if val else None

    @classmethod
    async def set_sql_result(cls, sql_query: str, user_role: str, results: list[dict]) -> None:
        key = cls._generate_sha256_key("tier4_sql_res", sql=sql_query.strip(), role=user_role)
        await cache_client.set(key, json.dumps(results), TIER_4_SQL_RESULTS_TTL)

    # Tier 5: Final RAG Answers
    @classmethod
    async def get_final_answer(cls, question: str, user_role: str, corpus_version: str = "v1") -> Optional[dict]:
        key = cls._generate_sha256_key("tier5_answer", q=question.strip().lower(), role=user_role, cv=corpus_version)
        val = await cache_client.get(key)
        return json.loads(val) if val else None

    @classmethod
    async def set_final_answer(cls, question: str, user_role: str, answer_payload: dict, corpus_version: str = "v1") -> None:
        key = cls._generate_sha256_key("tier5_answer", q=question.strip().lower(), role=user_role, cv=corpus_version)
        await cache_client.set(key, json.dumps(answer_payload), TIER_5_FINAL_ANSWER_TTL)


cache_manager = CacheManager()
