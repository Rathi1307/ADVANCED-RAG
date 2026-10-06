"""Reciprocal Rank Fusion (RRF) for combining Dense and Sparse BM25 retrieval lists."""

from typing import List, Dict, Any
from collections import defaultdict


def reciprocal_rank_fusion(
    dense_results: List[Dict[str, Any]],
    sparse_results: List[Dict[str, Any]],
    k: int = 60,
    top_n: int = 5,
) -> List[Dict[str, Any]]:
    """
    Fuses two ranked lists using Reciprocal Rank Fusion:
    RRF_score(d) = sum_{m in models} 1 / (k + rank_m(d))
    """
    rrf_scores = defaultdict(float)
    doc_map: Dict[str, Dict[str, Any]] = {}

    # 1. Score dense rankings
    for rank, doc in enumerate(dense_results, start=1):
        doc_id = doc["chunk_id"]
        doc_map[doc_id] = doc
        rrf_scores[doc_id] += 1.0 / (k + rank)

    # 2. Score sparse/BM25 rankings
    for rank, doc in enumerate(sparse_results, start=1):
        doc_id = doc["chunk_id"]
        if doc_id not in doc_map:
            doc_map[doc_id] = doc
        rrf_scores[doc_id] += 1.0 / (k + rank)

    # 3. Sort by fused score
    sorted_doc_ids = sorted(rrf_scores.keys(), key=lambda did: rrf_scores[did], reverse=True)[:top_n]

    fused_results = []
    for doc_id in sorted_doc_ids:
        doc = doc_map[doc_id].copy()
        doc["rrf_score"] = float(rrf_scores[doc_id])
        fused_results.append(doc)

    return fused_results
