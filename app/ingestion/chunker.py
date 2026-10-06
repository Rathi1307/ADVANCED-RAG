"""Markdown and text chunker preserving section headers and exact identifiers."""

import re
from typing import List, Dict, Any


class MarkdownChunker:
    """Splits Markdown documents on headers (## / ###) while keeping section context."""

    def __init__(self, chunk_size: int = 600, chunk_overlap: int = 100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_document(self, parsed_doc: Dict[str, Any]) -> List[Dict[str, Any]]:
        content = parsed_doc["content"]
        source_id = parsed_doc["source_id"]
        title = parsed_doc["title"]
        doc_type = parsed_doc["doc_type"]

        # Split on markdown headers
        sections = re.split(r"(?=\n##+\s+)", content)
        chunks: List[Dict[str, Any]] = []

        chunk_idx = 0
        for section in sections:
            section_clean = section.strip()
            if not section_clean:
                continue

            # Extract header if present
            header_match = re.match(r"^##+\s+(.+)", section_clean)
            section_header = header_match.group(1) if header_match else "General"

            chunk_id = f"{source_id}_chunk_{chunk_idx}"
            chunks.append({
                "chunk_id": chunk_id,
                "source_id": source_id,
                "title": f"{title} - {section_header}",
                "section": section_header,
                "doc_type": doc_type,
                "text": section_clean,
                "metadata": {
                    **parsed_doc.get("metadata", {}),
                    "chunk_index": chunk_idx,
                    "section_header": section_header,
                },
            })
            chunk_idx += 1

        return chunks
