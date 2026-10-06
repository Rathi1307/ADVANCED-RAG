"""Intent Classification Router for routing between RAG, SQL, and Hybrid."""

import re
from app.models.domain import RouteType


class IntentRouter:
    """Classifies user queries into RAG (docs/runbooks), SQL (live database), or HYBRID."""

    @staticmethod
    def classify(query: str) -> RouteType:
        q_lower = query.lower()

        # Check for hybrid signals (asking what happened/runbooks AND recent deployments/pods/metrics)
        has_doc_signal = any(term in q_lower for term in ["runbook", "postmortem", "why", "how to", "procedure", "happened before", "triage", "troubleshoot"])
        has_sql_signal = any(term in q_lower for term in ["deployment", "pod", "cluster", "restart count", "latency", "last deploy", "commit", "error code", "status of", "how many"])

        if has_doc_signal and has_sql_signal:
            return RouteType.HYBRID

        if has_sql_signal and not has_doc_signal:
            return RouteType.SQL

        return RouteType.RAG


intent_router = IntentRouter()
