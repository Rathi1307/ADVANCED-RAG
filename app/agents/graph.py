"""Investigation Graph Pipeline Orchestrator."""

import uuid
from typing import Dict, Any, Optional
from app.agents.state import InvestigationState
from app.agents.nodes import (
    screen_query_node,
    cache_lookup_node,
    route_intent_node,
    rag_retrieval_node,
    sql_investigation_node,
    synthesize_grounded_answer_node,
    output_sanitization_node,
    audit_and_finalize_node,
)
from app.models.domain import RouteType


class InvestigationPipelineGraph:
    """Executes the complete multi-stage investigation workflow."""

    async def run(
        self,
        question: str,
        user_id: str,
        username: str,
        user_role: str,
        service_name: Optional[str] = None,
        incident_id: Optional[str] = None,
        force_refresh: bool = False,
    ) -> InvestigationState:
        request_id = str(uuid.uuid4())
        trace_id = f"trace-{uuid.uuid4().hex[:12]}"

        # Initialize state
        state: InvestigationState = {
            "request_id": request_id,
            "trace_id": trace_id,
            "question": question,
            "normalized_question": question,
            "service_name": service_name,
            "incident_id": incident_id,
            "user_id": user_id,
            "username": username,
            "user_role": user_role,
            "force_refresh": force_refresh,
            "is_safe": True,
            "security_violations": [],
            "pii_redactions": 0,
            "tokens_consumed": 0,
            "route": RouteType.HYBRID,
            "cache_hit": False,
            "retrieved_chunks": [],
            "crag_score": 0.85,
            "spotlighted_context": "",
            "sql_query": None,
            "sql_results": None,
            "sql_approval_required": False,
            "sql_approval_id": None,
            "summary": "",
            "answer": "",
            "evidence_items": [],
            "faithfulness_score": 1.0,
            "reflection_attempts": 0,
            "limitations": None,
            "suggested_checks": [],
            "error": None,
            "completed": False,
        }

        # Step 1: Security screening (L1, L2, L5, L7a)
        state = await screen_query_node(state)
        if not state["is_safe"]:
            state = await audit_and_finalize_node(state)
            return state

        # Step 2: Tier-5 Cache lookup
        state = await cache_lookup_node(state)
        if state["cache_hit"]:
            state = await output_sanitization_node(state)
            state = await audit_and_finalize_node(state)
            return state

        # Step 3: Intent routing
        state = await route_intent_node(state)

        # Step 4: Parallel Documentary (RAG) & Structured (SQL) Retrieval
        state = await rag_retrieval_node(state)
        state = await sql_investigation_node(state)

        # Step 5: Evidence-grounded synthesis
        state = await synthesize_grounded_answer_node(state)

        # Step 6: Output moderation & PII redaction (L7b)
        state = await output_sanitization_node(state)

        # Step 7: Audit logging & trace recording
        state = await audit_and_finalize_node(state)

        return state


investigation_graph = InvestigationPipelineGraph()
