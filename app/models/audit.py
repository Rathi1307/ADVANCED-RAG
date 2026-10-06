"""Audit event schemas for compliance and traceability."""

from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class AuditEventSchema(BaseModel):
    id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    request_id: str
    trace_id: str
    user_id: str
    username: str
    user_role: str
    event_type: str = Field(..., description="e.g., 'investigation_query', 'sql_execution', 'approval_submitted'")
    route: Optional[str] = None
    query_text: str
    tokens_consumed: int = 0
    latency_ms: float = 0.0
    cache_hit: bool = False
    sql_query_hash: Optional[str] = None
    approval_decision: Optional[str] = None
    pii_redacted_count: int = 0
    security_flagged: bool = False
    details: Dict[str, Any] = Field(default_factory=dict)
