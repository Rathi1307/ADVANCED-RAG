"""Incident Investigation API Router."""

from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.request import InvestigationRequest
from app.models.response import InvestigationResponse
from app.security.auth import get_current_user
from app.security.rate_limiter import rate_limiter
from app.agents.graph import investigation_graph

router = APIRouter(tags=["Investigation"])


@router.post("/investigate", response_model=InvestigationResponse)
async def investigate_incident(
    payload: InvestigationRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Investigate an SRE incident using evidence-grounded agentic RAG and structured operational data.
    Enforces JWT authentication, rate limiting (20 req/min), input screening, and audit logging.
    """
    user_id = current_user.get("sub", "unknown")
    username = current_user.get("username", "sre")
    user_role = current_user.get("role", "sre")

    # L4b: Enforce Rate Limiter
    rate_limiter.check_rate_limit(user_id)

    # Run Investigation Graph
    state = await investigation_graph.run(
        question=payload.question,
        user_id=user_id,
        username=username,
        user_role=user_role,
        service_name=payload.service_name,
        incident_id=payload.incident_id,
        force_refresh=payload.force_refresh,
    )

    if not state["is_safe"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=state["error"] or "Security policy violation detected.",
        )

    return InvestigationResponse(
        answer=state["answer"],
        summary=state["summary"],
        evidence=state["evidence_items"],
        route=state["route"],
        trace_id=state["trace_id"],
        cache_hit=state["cache_hit"],
        faithfulness_score=state["faithfulness_score"],
        reflection_attempts=state["reflection_attempts"],
        limitations_and_uncertainty=state["limitations"],
        suggested_next_checks=state["suggested_checks"],
        sql_executed=state.get("sql_query"),
        sql_status="executed" if state.get("sql_results") else None,
    )
