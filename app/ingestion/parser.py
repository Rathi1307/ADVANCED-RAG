"""Document parsing and normalization."""

import hashlib
from typing import Dict, Any


class DocumentParser:
    """Parses raw text, Markdown, or JSON documents with normalization and hash calculation."""

    @staticmethod
    def parse_text(text: str, source_id: str, title: str, doc_type: str = "runbook", metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        cleaned_text = text.strip()
        content_hash = hashlib.sha256(cleaned_text.encode("utf-8")).hexdigest()
        return {
            "source_id": source_id,
            "title": title,
            "doc_type": doc_type,
            "content": cleaned_text,
            "content_hash": content_hash,
            "metadata": metadata or {},
        }
