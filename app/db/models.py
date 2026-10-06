"""SQLAlchemy 2.0 relational models for the 7 operational SRE tables."""

import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="sre", nullable=False)
    daily_tokens_used: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Service(Base):
    __tablename__ = "services"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    tier: Mapped[str] = mapped_column(String(20), default="Tier-1", nullable=False)
    repo_url: Mapped[str] = mapped_column(String(255), default="")
    owning_team: Mapped[str] = mapped_column(String(100), default="core-platform")
    slo_latency_ms: Mapped[float] = mapped_column(Float, default=200.0)
    error_budget_percent: Mapped[float] = mapped_column(Float, default=99.9)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    incidents: Mapped[list["Incident"]] = relationship("Incident", back_populates="service")
    deployments: Mapped[list["Deployment"]] = relationship("Deployment", back_populates="service")
    pods: Mapped[list["Pod"]] = relationship("Pod", back_populates="service")


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    severity: Mapped[str] = mapped_column(String(10), default="P1", nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="investigating", nullable=False)
    service_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("services.id"), nullable=True)
    start_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    lead_engineer: Mapped[str] = mapped_column(String(100), default="on-call-sre")
    summary: Mapped[str] = mapped_column(Text, default="")
    root_cause: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    service: Mapped[Optional["Service"]] = relationship("Service", back_populates="incidents")


class Deployment(Base):
    __tablename__ = "deployments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    deployment_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    service_id: Mapped[str] = mapped_column(String(36), ForeignKey("services.id"), nullable=False)
    commit_sha: Mapped[str] = mapped_column(String(40), nullable=False)
    deployed_by: Mapped[str] = mapped_column(String(100), default="ci-pipeline")
    deployed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[str] = mapped_column(String(30), default="deployed")
    config_diff: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rollback_from: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    service: Mapped["Service"] = relationship("Service", back_populates="deployments")


class Cluster(Base):
    __tablename__ = "clusters"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    environment: Mapped[str] = mapped_column(String(50), default="production")
    region: Mapped[str] = mapped_column(String(50), default="us-east-1")
    k8s_version: Mapped[str] = mapped_column(String(30), default="1.29.2")
    node_count: Mapped[int] = mapped_column(Integer, default=12)
    status: Mapped[str] = mapped_column(String(30), default="healthy")

    pods: Mapped[list["Pod"]] = relationship("Pod", back_populates="cluster")


class Pod(Base):
    __tablename__ = "pods"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pod_name: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    cluster_id: Mapped[str] = mapped_column(String(36), ForeignKey("clusters.id"), nullable=False)
    service_id: Mapped[str] = mapped_column(String(36), ForeignKey("services.id"), nullable=False)
    namespace: Mapped[str] = mapped_column(String(50), default="production")
    node_name: Mapped[str] = mapped_column(String(100), default="ip-10-0-1-12")
    restart_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(40), default="running")
    error_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    memory_usage_mb: Mapped[float] = mapped_column(Float, default=256.0)
    cpu_usage_percent: Mapped[float] = mapped_column(Float, default=15.0)

    cluster: Mapped["Cluster"] = relationship("Cluster", back_populates="pods")
    service: Mapped["Service"] = relationship("Service", back_populates="pods")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    request_id: Mapped[str] = mapped_column(String(64), index=True)
    trace_id: Mapped[str] = mapped_column(String(64), index=True)
    user_id: Mapped[str] = mapped_column(String(36), index=True)
    username: Mapped[str] = mapped_column(String(100))
    user_role: Mapped[str] = mapped_column(String(50))
    event_type: Mapped[str] = mapped_column(String(100), index=True)
    route: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    query_text: Mapped[str] = mapped_column(Text)
    tokens_consumed: Mapped[int] = mapped_column(Integer, default=0)
    latency_ms: Mapped[float] = mapped_column(Float, default=0.0)
    cache_hit: Mapped[bool] = mapped_column(Boolean, default=False)
    sql_query_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    approval_decision: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    pii_redacted_count: Mapped[int] = mapped_column(Integer, default=0)
    security_flagged: Mapped[bool] = mapped_column(Boolean, default=False)
    details: Mapped[dict] = mapped_column(JSON, default=dict)
