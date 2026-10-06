"""Knowledge Ingestion API Router."""

import uuid
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.request import DocumentIngestRequest
from app.models.response import IngestionResponse
from app.models.domain import UserRole
from app.security.auth import get_current_user
from app.security.rbac import require_roles
from app.ingestion.pipeline import ingestion_pipeline

router = APIRouter(prefix="/ingestion", tags=["Ingestion"])


@router.post("/text", response_model=IngestionResponse)
async def ingest_document(
    payload: DocumentIngestRequest,
    current_user: Dict[str, Any] = Depends(require_roles([UserRole.SRE, UserRole.ADMIN])),
):
    """Ingest operational runbooks or postmortems into hybrid dense/sparse knowledge store."""
    doc_id = f"doc-{uuid.uuid4().hex[:8]}"
    res = ingestion_pipeline.ingest_text(
        text=payload.content,
        source_id=doc_id,
        title=payload.title,
        doc_type=payload.source_type,
        metadata={
            "service_name": payload.service_name,
            "ingested_by": current_user.get("username"),
            **payload.metadata,
        }
    )

    return IngestionResponse(
        document_id=res.get("document_id", doc_id),
        chunks_created=res.get("chunks_created", 0),
        content_hash=res.get("content_hash", res.get("hash", "")),
        status=res.get("status", "indexed"),
    )
