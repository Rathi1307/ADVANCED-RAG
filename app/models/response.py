"""Response schemas for API endpoints."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.models.domain import EvidenceItem, RouteType


class InvestigationResponse(BaseModel):
    """Evidence-grounded answer to an SRE incident investigation."""
    answer: str = Field(..., description="Evidence-grounded diagnostic answer")
    summary: str = Field(..., description="High-level executive summary")
    evidence: List[EvidenceItem] = Field(default_factory=list, description="Citations and evidence items")
    route: RouteType = Field(..., description="Selected resolution route (rag, sql, hybrid)")
    trace_id: str = Field(..., description="Unique investigation trace ID")
    cache_hit: bool = Field(default=False, description="Whether answer was served from tier-5 cache")
    faithfulness_score: float = Field(default=1.0, ge=0.0, le=1.0)
    reflection_attempts: int = Field(default=0, description="Self-RAG bounded regeneration count")
    limitations_and_uncertainty: Optional[str] = None
    suggested_next_checks: List[str] = Field(default_factory=list)
    sql_executed: Optional[str] = None
    sql_approval_id: Optional[str] = None
    sql_status: Optional[str] = None


class IngestionResponse(BaseModel):
    document_id: str
    chunks_created: int
    content_hash: str
    status: str = "indexed"


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: str
    username: str
    role: str
