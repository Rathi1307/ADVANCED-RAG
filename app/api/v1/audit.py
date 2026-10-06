"""Audit query endpoint for authorized SREs/Admins."""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.db.models import AuditEvent
from app.models.domain import UserRole
from app.models.audit import AuditEventSchema
from app.security.rbac import require_roles

router = APIRouter(prefix="/audit", tags=["Audit"])


@router.get("/events", response_model=List[AuditEventSchema])
async def list_audit_events(
    limit: int = Query(default=20, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_roles([UserRole.SRE, UserRole.ADMIN])),
):
    """Retrieve immutable audit events and trace logs (restricted to SRE/Admin roles)."""
    stmt = select(AuditEvent).order_by(AuditEvent.timestamp.desc()).limit(limit)
    result = await db.execute(stmt)
    records = result.scalars().all()

    response_items = []
    for r in records:
        response_items.append(
            AuditEventSchema(
                id=r.id,
                timestamp=r.timestamp,
                request_id=r.request_id,
                trace_id=r.trace_id,
                user_id=r.user_id,
                username=r.username,
                user_role=r.user_role,
                event_type=r.event_type,
                route=r.route,
                query_text=r.query_text,
                tokens_consumed=r.tokens_consumed,
                latency_ms=r.latency_ms,
                cache_hit=r.cache_hit,
                sql_query_hash=r.sql_query_hash,
                approval_decision=r.approval_decision,
                pii_redacted_count=r.pii_redacted_count,
                security_flagged=r.security_flagged,
                details=r.details or {},
            )
        )
    return response_items
