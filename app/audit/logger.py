"""Audit event recording and compliance persistence."""

import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from app.db.session import AsyncSessionLocal
from app.db.models import AuditEvent
from app.models.audit import AuditEventSchema
from app.core.logging import logger


class AuditLogger:
    """Records security, investigation, and execution events to database and log stream."""

    @staticmethod
    async def record_event(
        request_id: str,
        trace_id: str,
        user_id: str,
        username: str,
        user_role: str,
        event_type: str,
        query_text: str,
        tokens_consumed: int = 0,
        latency_ms: float = 0.0,
        cache_hit: bool = False,
        route: Optional[str] = None,
        sql_query_hash: Optional[str] = None,
        approval_decision: Optional[str] = None,
        pii_redacted_count: int = 0,
        security_flagged: bool = False,
        details: Optional[Dict[str, Any]] = None,
    ) -> str:
        event_id = str(uuid.uuid4())
        details_payload = details or {}

        # Log structured JSON
        logger.info(
            f"AUDIT_EVENT: {event_type} | User: {username} ({user_role}) | Trace: {trace_id} | Route: {route} | Latency: {latency_ms:.2f}ms",
            extra={
                "request_id": request_id,
                "trace_id": trace_id,
                "user_id": user_id,
            }
        )

        # Async persist to DB
        try:
            async with AsyncSessionLocal() as session:
                audit_record = AuditEvent(
                    id=event_id,
                    timestamp=datetime.utcnow(),
                    request_id=request_id,
                    trace_id=trace_id,
                    user_id=user_id,
                    username=username,
                    user_role=user_role,
                    event_type=event_type,
                    route=route,
                    query_text=query_text,
                    tokens_consumed=tokens_consumed,
                    latency_ms=latency_ms,
                    cache_hit=cache_hit,
                    sql_query_hash=sql_query_hash,
                    approval_decision=approval_decision,
                    pii_redacted_count=pii_redacted_count,
                    security_flagged=security_flagged,
                    details=details_payload,
                )
                session.add(audit_record)
                await session.commit()
        except Exception as e:
            logger.error("Failed to persist audit record to database: %s", str(e))

        return event_id


audit_logger = AuditLogger()
