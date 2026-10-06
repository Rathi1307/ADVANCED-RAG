"""Unit tests for the 5-Tier Cache."""

import pytest
from app.cache.manager import cache_manager


@pytest.mark.asyncio
async def test_five_tier_cache():
    # Test Tier 2: Intent Cache
    await cache_manager.set_intent("checkout latency issue", "hybrid")
    intent = await cache_manager.get_intent("checkout latency issue")
    assert intent == "hybrid"

    # Test Tier 5: Final Answer Cache
    payload = {
        "summary": "Redis pool exhausted",
        "answer": "Rollback deployment DEP-2026-9901",
        "route": "hybrid",
        "faithfulness_score": 0.95,
        "evidence": [],
    }
    await cache_manager.set_final_answer("checkout latency spike", "sre", payload)
    cached_res = await cache_manager.get_final_answer("checkout latency spike", "sre")
    assert cached_res is not None
    assert cached_res["summary"] == "Redis pool exhausted"

    # Verify cross-role isolation (different role shouldn't see it if role is in key)
    cached_res_viewer = await cache_manager.get_final_answer("checkout latency spike", "viewer")
    assert cached_res_viewer is None
