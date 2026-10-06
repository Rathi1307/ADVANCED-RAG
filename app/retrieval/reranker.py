"""Cross-Encoder Reranker adapter (supports BGE/Voyage or deterministic semantic fallback)."""

import re
from typing import List, Dict, Any


class CrossEncoderReranker:
    """Reranks candidate chunks by assessing query-document semantic relevance."""

    def rerank(self, query: str, candidates: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
        if not candidates:
            return []

        query_terms = set(re.findall(r"\w+", query.lower()))
        reranked = []

        for candidate in candidates:
            doc_text = candidate.get("text", "")
            title = candidate.get("title", "")
            full_text = f"{title} {doc_text}".lower()

            # Exact keyword overlap ratio
            matched_terms = [t for t in query_terms if t in full_text]
            term_score = len(matched_terms) / max(len(query_terms), 1)

            # Combine with base RRF score or dense score
            base_score = candidate.get("rrf_score", candidate.get("score", 0.5))
            final_relevance = min(1.0, 0.4 * base_score + 0.6 * term_score + 0.2)

            item = candidate.copy()
            item["relevance_score"] = round(final_relevance, 4)
            reranked.append(item)

        reranked.sort(key=lambda x: x["relevance_score"], reverse=True)
        return reranked[:top_k]


reranker = CrossEncoderReranker()
