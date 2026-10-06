# Agentic RAG-Based AI SRE Investigation Platform

A production-grade, model-agnostic, and evidence-grounded AI SRE investigation assistant combining enterprise operational knowledge (runbooks, postmortems) with live structured operational records (incidents, deployments, pods, clusters, services).

---

## Key Features

1. **Hybrid Retrieval**: Dense vector embeddings + BM25 sparse keyword search fused via **Reciprocal Rank Fusion (RRF, $k=60$)** and cross-encoder reranking.
2. **Context Isolation (XML Spotlighting)**: Delimited XML tags ensuring untrusted retrieved context is never executed as instructions.
3. **9-Layer Security Gate**:
   - **L1**: Pydantic & Regex pattern screening (SQL injection, shell execution).
   - **L2**: Prompt injection and jailbreak scanner.
   - **L3/L8**: In-graph XML context spotlighting.
   - **L4a**: JWT Bearer token authentication & RBAC.
   - **L4b**: 20 requests/minute sliding-window rate limiter.
   - **L5**: Input token restructuring & tiktoken truncation.
   - **L6**: 100k tokens/day/user budget tracker.
   - **L7a/L7b**: Input & output PII redaction and moderation filter.
   - **L9**: Pydantic response schema verification.
4. **5-Tier SHA-256 Cache**:
   - Tier 1: Embeddings (7 days)
   - Tier 2: Intent routing (24 hours)
   - Tier 3: SQL generation (24 hours)
   - Tier 4: SQL execution results (15 minutes)
   - Tier 5: Final RAG answers (1 hour)
5. **Traceable Audit Logging**: Immutable database persistence and structured JSON logging for all queries, security flags, and evidence citations.
6. **Zero-Setup Local Mode**: Built-in deterministic mock adapters, SQLite fallback, and in-memory vector/cache stores allowing instant execution without requiring paid API keys or external services.

---

## Quickstart Guide

### 1. Setup Environment
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Run Test Suite
```bash
source .venv/bin/activate
PYTHONPATH=. pytest -v
```

### 3. Start Backend API Server
```bash
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
API Documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 4. Start the Modern React SRE Command Center UI
```bash
cd frontend
npm install
npm run dev
```
Open your browser at: **[http://localhost:5173](http://localhost:5173)**

*(Alternatively, to run the Streamlit UI)*:
```bash
source .venv/bin/activate
streamlit run ui/app.py
```

Default SRE Demo Credentials:
- **Username**: `sre_lead`
- **Password**: `Password123!`

---

## Project Structure

```text
.
├── app/
│   ├── main.py                     # FastAPI application factory & lifespan
│   ├── core/                       # Config, logging, error handling
│   ├── models/                     # Domain, request, response, audit Pydantic models
│   ├── db/                         # SQLAlchemy models, sessions, synthetic seeder
│   ├── security/                   # JWT, RBAC, screening, rate limiter, PII redaction
│   ├── cache/                      # 5-tier SHA-256 cache engine
│   ├── ingestion/                  # Parser, chunker, ingestion pipeline
│   ├── retrieval/                  # Dense vector, BM25, RRF (k=60), Cross-Encoder, Spotlighting
│   ├── agents/                     # LangGraph investigation nodes & graph builder
│   └── api/v1/                     # FastAPI v1 REST routers
├── ui/                             # Streamlit SRE Console
├── data/                           # Synthetic runbooks and postmortems
└── tests/                          # Unit, integration, and security test suite
```
