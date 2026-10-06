"""Typed dictionary schema representing state across the investigation graph."""

from typing import List, Dict, Any, Optional
from typing_extensions import TypedDict
from app.models.domain import RouteType, EvidenceItem


class InvestigationState(TypedDict):
    # Inbound context
    request_id: str
    trace_id: str
    question: str
    normalized_question: str
    service_name: Optional[str]
    incident_id: Optional[str]
    user_id: str
    username: str
    user_role: str
    force_refresh: bool

    # Security & Guard state
    is_safe: bool
    security_violations: List[str]
    pii_redactions: int
    tokens_consumed: int

    # Routing & Caching
    route: RouteType
    cache_hit: bool

    # Retrieved documentary & structured evidence
    retrieved_chunks: List[Dict[str, Any]]
    crag_score: float
    spotlighted_context: str
    sql_query: Optional[str]
    sql_results: Optional[List[Dict[str, Any]]]
    sql_approval_required: bool
    sql_approval_id: Optional[str]

    # Synthesized output & verification
    summary: str
    answer: str
    evidence_items: List[EvidenceItem]
    faithfulness_score: float
    reflection_attempts: int
    limitations: Optional[str]
    suggested_checks: List[str]

    # Status
    error: Optional[str]
    completed: bool
