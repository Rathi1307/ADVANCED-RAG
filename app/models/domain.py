"""Core domain entities and enums."""

from enum import Enum
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class UserRole(str, Enum):
    SRE = "sre"
    ADMIN = "admin"
    APPROVER = "approver"
    VIEWER = "viewer"


class RouteType(str, Enum):
    RAG = "rag"
    SQL = "sql"
    HYBRID = "hybrid"


class IncidentSeverity(str, Enum):
    P0 = "P0"
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"


class IncidentStatus(str, Enum):
    TRIGGERED = "triggered"
    INVESTIGATING = "investigating"
    IDENTIFIED = "identified"
    RESOLVED = "resolved"


class DeploymentStatus(str, Enum):
    DEPLOYED = "deployed"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"


class PodStatus(str, Enum):
    RUNNING = "running"
    PENDING = "pending"
    CRASH_LOOP_BACKOFF = "CrashLoopBackOff"
    OOM_KILLED = "OOMKilled"
    ERROR = "Error"


class EvidenceType(str, Enum):
    RUNBOOK = "runbook"
    POSTMORTEM = "postmortem"
    SQL_RECORD = "sql_record"
    METRIC_OR_EVENT = "metric_or_event"
    EXTERNAL_DOC = "external_doc"


class EvidenceItem(BaseModel):
    """Represents a single verifiable evidence source cited in an answer."""
    id: str = Field(..., description="Unique ID of document chunk or SQL record")
    source_type: EvidenceType
    title: str
    excerpt: str
    relevance_score: float = Field(default=1.0, ge=0.0, le=1.0)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: Optional[datetime] = None
