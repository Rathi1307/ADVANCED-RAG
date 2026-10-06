"""Qdrant Vector Store Adapter with Dense Embeddings and Local/In-Memory Support."""

import hashlib
import numpy as np
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from app.core.config import settings
from app.core.logging import logger


class EmbeddingGenerator:
    """Generates embeddings (either deterministic mock vectors or OpenAI embeddings)."""

    def __init__(self, dimension: int = 384):
        self.dimension = dimension

    def get_embedding(self, text: str) -> List[float]:
        if settings.USE_MOCK_MODELS or not settings.OPENAI_API_KEY:
            # Deterministic mock embedding based on SHA-256 seed
            seed = int(hashlib.sha256(text.encode("utf-8")).hexdigest()[:8], 16)
            np.random.seed(seed)
            vector = np.random.randn(self.dimension)
            # Normalize vector
            norm = np.linalg.norm(vector)
            normalized = (vector / (norm + 1e-9)).tolist()
            return normalized

        # Real OpenAI embedding if configured
        import openai
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.embeddings.create(
            input=text,
            model=settings.EMBEDDING_MODEL
        )
        return response.data[0].embedding


class VectorStore:
    """Manages Qdrant collections and dense similarity search."""

    def __init__(self, collection_name: str = settings.QDRANT_COLLECTION_NAME):
        self.collection_name = collection_name
        self.embedding_generator = EmbeddingGenerator(dimension=384)

        if settings.QDRANT_URL:
            self.client = QdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY,
            )
        else:
            # Default to in-memory Qdrant client for zero external dependency execution
            self.client = QdrantClient(":memory:")

        self._ensure_collection()

    def _ensure_collection(self) -> None:
        collections = [c.name for c in self.client.get_collections().collections]
        if self.collection_name not in collections:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=self.embedding_generator.dimension, distance=Distance.COSINE),
            )

    def upsert_chunks(self, chunks: List[Dict[str, Any]]) -> None:
        points = []
        for i, chunk in enumerate(chunks):
            vector = self.embedding_generator.get_embedding(chunk["text"])
            point_id = hashlib.md5(chunk["chunk_id"].encode()).hexdigest()
            points.append(
                PointStruct(
                    id=point_id,
                    vector=vector,
                    payload={
                        "chunk_id": chunk["chunk_id"],
                        "source_id": chunk["source_id"],
                        "title": chunk["title"],
                        "section": chunk.get("section", ""),
                        "doc_type": chunk["doc_type"],
                        "text": chunk["text"],
                        "metadata": chunk.get("metadata", {}),
                    }
                )
            )
        if points:
            self.client.upsert(collection_name=self.collection_name, points=points)

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        query_vector = self.embedding_generator.get_embedding(query)
        if hasattr(self.client, "query_points"):
            response = self.client.query_points(
                collection_name=self.collection_name,
                query=query_vector,
                limit=top_k,
            )
            hits = response.points
        elif hasattr(self.client, "search"):
            hits = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=top_k,
            )
        else:
            hits = []

        results = []
        for hit in hits:
            results.append({
                **hit.payload,
                "score": float(hit.score) if hasattr(hit, "score") and hit.score is not None else 1.0,
            })
        return results


vector_store = VectorStore()
