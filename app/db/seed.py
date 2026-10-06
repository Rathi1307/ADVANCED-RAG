"""Deterministic synthetic data seeder for local development and testing."""

import asyncio
from datetime import datetime, timedelta
from passlib.context import CryptContext
from sqlalchemy import select
from app.db.session import AsyncSessionLocal, init_db
from app.db.models import User, Service, Incident, Deployment, Cluster, Pod, AuditEvent

from app.security.auth import get_password_hash


async def seed_database() -> None:
    """Populate database with deterministic synthetic data."""
    await init_db()

    async with AsyncSessionLocal() as session:
        # 1. Check if already seeded
        result = await session.execute(select(User).where(User.username == "sre_lead"))
        if result.scalar_one_or_none():
            return

        # 2. Seed Users
        sre_user = User(
            id="user-sre-001",
            username="sre_lead",
            email="sre_lead@enterprise.internal",
            hashed_password=get_password_hash("Password123!"),
            role="sre",
            daily_tokens_used=1200,
        )
        admin_user = User(
            id="user-admin-001",
            username="admin_user",
            email="admin@enterprise.internal",
            hashed_password=get_password_hash("Password123!"),
            role="admin",
            daily_tokens_used=0,
        )
        approver_user = User(
            id="user-approver-001",
            username="lead_approver",
            email="approver@enterprise.internal",
            hashed_password=get_password_hash("Password123!"),
            role="approver",
            daily_tokens_used=450,
        )
        session.add_all([sre_user, admin_user, approver_user])

        # 3. Seed Services
        checkout_svc = Service(
            id="svc-checkout-001",
            name="checkout-service",
            tier="Tier-1",
            repo_url="git@github.com:enterprise/checkout-service.git",
            owning_team="payments-and-checkout",
            slo_latency_ms=200.0,
            error_budget_percent=99.95,
        )
        auth_svc = Service(
            id="svc-auth-002",
            name="auth-service",
            tier="Tier-1",
            repo_url="git@github.com:enterprise/auth-service.git",
            owning_team="security-platform",
            slo_latency_ms=50.0,
            error_budget_percent=99.99,
        )
        payment_svc = Service(
            id="svc-payment-003",
            name="payment-gateway",
            tier="Tier-1",
            repo_url="git@github.com:enterprise/payment-gateway.git",
            owning_team="payments-and-checkout",
            slo_latency_ms=150.0,
            error_budget_percent=99.95,
        )
        session.add_all([checkout_svc, auth_svc, payment_svc])

        # 4. Seed Clusters
        cluster_us = Cluster(
            id="cluster-prod-useast1",
            name="prod-us-east-1-k8s",
            environment="production",
            region="us-east-1",
            k8s_version="1.29.2",
            node_count=16,
            status="healthy",
        )
        cluster_eu = Cluster(
            id="cluster-prod-euwest1",
            name="prod-eu-west-1-k8s",
            environment="production",
            region="eu-west-1",
            k8s_version="1.29.2",
            node_count=12,
            status="healthy",
        )
        session.add_all([cluster_us, cluster_eu])

        # 5. Seed Deployments
        dep_now = datetime.utcnow() - timedelta(minutes=45)
        dep_past = datetime.utcnow() - timedelta(days=5)

        dep_checkout_bad = Deployment(
            id="dep-checkout-9901",
            deployment_id="DEP-2026-9901",
            service_id=checkout_svc.id,
            commit_sha="c9a184fe72b0129a8",
            deployed_by="alex.chen@enterprise.internal",
            deployed_at=dep_now,
            status="deployed",
            config_diff="- REDIS_POOL_SIZE=50\n+ REDIS_POOL_SIZE=5\n+ REDIS_TIMEOUT_MS=1000",
            rollback_from=None,
        )
        dep_checkout_good = Deployment(
            id="dep-checkout-9880",
            deployment_id="DEP-2026-9880",
            service_id=checkout_svc.id,
            commit_sha="a1b2c3d4e5f678901",
            deployed_by="alex.chen@enterprise.internal",
            deployed_at=dep_past,
            status="deployed",
            config_diff="Routine update",
            rollback_from=None,
        )
        session.add_all([dep_checkout_bad, dep_checkout_good])

        # 6. Seed Incidents
        inc_active = Incident(
            id="inc-2026-0812-uuid",
            incident_id="INC-2026-0812",
            title="Checkout latency 3x spike and connection timeout errors",
            severity="P1",
            status="investigating",
            service_id=checkout_svc.id,
            start_time=datetime.utcnow() - timedelta(minutes=30),
            lead_engineer="sre_lead",
            summary="Checkout service latency surged from 180ms to 620ms following deployment DEP-2026-9901. Multiple pod restarts with ERR_REDIS_TIMEOUT.",
            root_cause="Under investigation. Suspected Redis connection pool throttling.",
        )
        session.add(inc_active)

        # 7. Seed Pods
        pod1 = Pod(
            id="pod-chk-001",
            pod_name="checkout-service-78f56-kx8w2",
            cluster_id=cluster_us.id,
            service_id=checkout_svc.id,
            namespace="production",
            node_name="ip-10-0-1-12",
            restart_count=8,
            status="running",
            error_code="ERR_REDIS_TIMEOUT",
            memory_usage_mb=780.0,
            cpu_usage_percent=88.5,
        )
        pod2 = Pod(
            id="pod-chk-002",
            pod_name="checkout-service-78f56-qp91x",
            cluster_id=cluster_us.id,
            service_id=checkout_svc.id,
            namespace="production",
            node_name="ip-10-0-1-14",
            restart_count=14,
            status="CrashLoopBackOff",
            error_code="OOMKilled",
            memory_usage_mb=1024.0,
            cpu_usage_percent=95.0,
        )
        pod3 = Pod(
            id="pod-auth-001",
            pod_name="auth-service-54d9b-nm12z",
            cluster_id=cluster_us.id,
            service_id=auth_svc.id,
            namespace="production",
            node_name="ip-10-0-1-18",
            restart_count=0,
            status="running",
            error_code=None,
            memory_usage_mb=210.0,
            cpu_usage_percent=12.0,
        )
        session.add_all([pod1, pod2, pod3])

        await session.commit()


if __name__ == "__main__":
    asyncio.run(seed_database())
