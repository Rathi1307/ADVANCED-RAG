"""Request schemas for API endpoints."""

from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class InvestigationRequest(BaseModel):
    """Payload for submitting an SRE incident inquiry."""
    question: str = Field(..., min_length=3, max_length=2000, description="The incident investigation question")
    service_name: Optional[str] = Field(default=None, description="Optional service scope e.g., 'checkout-service'")
    incident_id: Optional[str] = Field(default=None, description="Optional incident ID e.g., 'INC-2026-0812'")
    time_window_start: Optional[datetime] = None
    time_window_end: Optional[datetime] = None
    force_refresh: bool = Field(default=False, description="Bypass cache for fresh retrieval")


class DocumentIngestRequest(BaseModel):
    """Payload for ingesting raw runbook/postmortem text into knowledge store."""
    title: str = Field(..., min_length=1)
    content: str = Field(..., min_length=10)
    source_type: str = Field(default="runbook", description="runbook, postmortem, or architecture_doc")
    service_name: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SQLApprovalSubmission(BaseModel):
    """Payload for approving or rejecting a sensitive generated SQL query."""
    approval_id: str
    decision: str = Field(..., description="'approved' or 'rejected'")
    rejection_reason: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str
