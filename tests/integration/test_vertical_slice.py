"""Integration test verifying the end-to-end working vertical slice."""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.seed import seed_database
from app.ingestion.pipeline import ingestion_pipeline


@pytest.mark.asyncio
async def test_vertical_slice_end_to_end():
    # 1. Seed database and ingest runbooks
    await seed_database()
    ingestion_pipeline.ingest_directory("data/runbooks", doc_type="runbook")
    ingestion_pipeline.ingest_directory("data/postmortems", doc_type="postmortem")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 2. Health probe test
        health_resp = await client.get("/api/v1/health")
        assert health_resp.status_code == 200
        assert health_resp.json()["status"] == "healthy"

        # 3. Authenticate SRE engineer
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"username": "sre_lead", "password": "Password123!"}
        )
        assert login_resp.status_code == 200
        token_data = login_resp.json()
        token = token_data["access_token"]
        assert token is not None

        headers = {"Authorization": f"Bearer {token}"}

        # 4. Investigate core incident use case
        investigation_payload = {
            "question": "Checkout latency has increased 3x since the last deployment --- what changed, and has this happened before?",
            "service_name": "checkout-service",
            "force_refresh": True,
        }
        inv_resp = await client.post(
            "/api/v1/investigate",
            json=investigation_payload,
            headers=headers,
        )
        assert inv_resp.status_code == 200
        data = inv_resp.json()

        # 5. Assert grounded findings and citations
        assert "DEP-2026-9901" in data["answer"] or "Redis" in data["answer"]
        assert data["trace_id"].startswith("trace-")
        assert len(data["evidence"]) > 0

        # Check that evidence items include both documentary (runbook/postmortem) and SQL records
        evidence_sources = [e["source_type"] for e in data["evidence"]]
        assert "sql_record" in evidence_sources
        assert "runbook" in evidence_sources or "postmortem" in evidence_sources

        # 6. Verify audit logs record the event
        audit_resp = await client.get("/api/v1/audit/events?limit=5", headers=headers)
        assert audit_resp.status_code == 200
        audit_events = audit_resp.json()
        assert len(audit_events) > 0
        assert audit_events[0]["username"] == "sre_lead"
