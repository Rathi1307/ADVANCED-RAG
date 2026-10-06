"""Ingestion pipeline coordinating parsing, chunking, deduplication, and indexing."""

import os
import glob
from typing import List, Dict, Any
from app.ingestion.parser import DocumentParser
from app.ingestion.chunker import MarkdownChunker
from app.retrieval.vector_store import vector_store
from app.retrieval.bm25 import bm25_retriever
from app.core.logging import logger


class IngestionPipeline:
    """Manages document ingestion into dense and sparse stores."""

    def __init__(self):
        self.parser = DocumentParser()
        self.chunker = MarkdownChunker()
        self.seen_hashes: set[str] = set()

    def ingest_text(self, text: str, source_id: str, title: str, doc_type: str = "runbook", metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        parsed = self.parser.parse_text(text, source_id=source_id, title=title, doc_type=doc_type, metadata=metadata)

        # Deduplication check
        if parsed["content_hash"] in self.seen_hashes:
            logger.info("Document '%s' already indexed (hash match)", title)
            return {"status": "duplicate_skipped", "chunks": 0, "hash": parsed["content_hash"]}

        self.seen_hashes.add(parsed["content_hash"])
        chunks = self.chunker.chunk_document(parsed)

        # Index in Qdrant (dense) and BM25 (sparse)
        vector_store.upsert_chunks(chunks)
        bm25_retriever.index_chunks(chunks)

        logger.info("Ingested '%s' (%d chunks, hash %s)", title, len(chunks), parsed["content_hash"][:8])
        return {
            "status": "indexed",
            "document_id": source_id,
            "chunks_created": len(chunks),
            "content_hash": parsed["content_hash"],
        }

    def ingest_directory(self, dir_path: str, doc_type: str = "runbook") -> int:
        """Scan directory for markdown files and ingest them."""
        files = glob.glob(os.path.join(dir_path, "**/*.md"), recursive=True)
        count = 0
        for filepath in files:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            filename = os.path.basename(filepath)
            source_id = os.path.splitext(filename)[0]
            title = source_id.replace("_", " ").title()
            self.ingest_text(content, source_id=source_id, title=title, doc_type=doc_type)
            count += 1
        return count


ingestion_pipeline = IngestionPipeline()
