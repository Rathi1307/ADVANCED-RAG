"""Unit tests for Hybrid Retrieval (Dense + BM25 + RRF + Spotlighting)."""

import pytest
from app.retrieval.bm25 import BM25Retriever
from app.retrieval.rrf import reciprocal_rank_fusion
from app.retrieval.spotlight import format_spotlighted_context


def test_bm25_exact_identifier_retrieval():
    retriever = BM25Retriever()
    chunks = [
        {
            "chunk_id": "chunk-1",
            "title": "Checkout Runbook",
            "text": "Pod checkout-service-78f56-kx8w2 failed with error code ERR_REDIS_TIMEOUT.",
        },
        {
            "chunk_id": "chunk-2",
            "title": "Auth Runbook",
            "text": "Auth service token rotation procedures.",
        },
    ]
    retriever.index_chunks(chunks)

    # Search by exact error code
    results = retriever.search("ERR_REDIS_TIMEOUT", top_k=1)
    assert len(results) == 1
    assert results[0]["chunk_id"] == "chunk-1"


def test_rrf_fusion():
    dense = [
        {"chunk_id": "doc_a", "score": 0.95},
        {"chunk_id": "doc_b", "score": 0.85},
    ]
    sparse = [
        {"chunk_id": "doc_b", "score": 4.2},
        {"chunk_id": "doc_c", "score": 3.1},
    ]

    fused = reciprocal_rank_fusion(dense, sparse, k=60, top_n=3)
    assert len(fused) == 3
    # doc_b is present in both lists, so its combined RRF score should be highest
    assert fused[0]["chunk_id"] == "doc_b"


def test_xml_spotlighting():
    chunks = [
        {
            "chunk_id": "rbk-1",
            "title": "Checkout Latency",
            "doc_type": "runbook",
            "text": "Restart the pod when ERR_REDIS_TIMEOUT occurs.",
            "relevance_score": 0.92,
        }
    ]
    spotlighted = format_spotlighted_context(chunks)
    assert "<untrusted_operational_evidence>" in spotlighted
    assert "</untrusted_operational_evidence>" in spotlighted
    assert "SECURITY NOTICE:" in spotlighted
    assert "Restart the pod when ERR_REDIS_TIMEOUT occurs." in spotlighted
