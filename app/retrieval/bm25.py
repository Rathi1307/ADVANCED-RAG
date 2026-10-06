"""BM25 Sparse Keyword Retrieval for exact identifiers (pod names, error codes, incident IDs)."""

import re
from typing import List, Dict, Any
from rank_bm25 import BM25Plus


def tokenize(text: str) -> List[str]:
    """Tokenize keeping underscores, dashes, and alphanumerics (e.g. ERR_REDIS_TIMEOUT, INC-2026-0812)."""
    tokens = re.findall(r"[A-Za-z0-9_-]+", text.lower())
    return tokens


class BM25Retriever:
    """In-memory BM25 index over ingested document chunks."""

    def __init__(self):
        self.chunks: List[Dict[str, Any]] = []
        self.corpus_tokens: List[List[str]] = []
        self.bm25: BM25Plus = None

    def index_chunks(self, chunks: List[Dict[str, Any]]) -> None:
        self.chunks.extend(chunks)
        for chunk in chunks:
            # Index title, section, and text
            full_text = f"{chunk.get('title', '')} {chunk.get('section', '')} {chunk['text']}"
            self.corpus_tokens.append(tokenize(full_text))

        if self.corpus_tokens:
            self.bm25 = BM25Plus(self.corpus_tokens)

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        if not self.bm25 or not self.chunks:
            return []

        query_tokens = tokenize(query)
        if not query_tokens:
            return []

        doc_scores = self.bm25.get_scores(query_tokens)
        query_set = set(query_tokens)

        scored_candidates = []
        for idx, score in enumerate(doc_scores):
            # Check for exact token overlaps as strong boost for identifiers
            doc_token_set = set(self.corpus_tokens[idx])
            overlap = len(query_set.intersection(doc_token_set))
            if overlap > 0 or score > 0.0:
                adjusted_score = float(score) + (overlap * 2.0)
                chunk = self.chunks[idx].copy()
                chunk["score"] = adjusted_score
                scored_candidates.append(chunk)

        scored_candidates.sort(key=lambda x: x["score"], reverse=True)
        return scored_candidates[:top_k]


bm25_retriever = BM25Retriever()
