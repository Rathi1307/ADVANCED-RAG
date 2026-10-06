# Antigravity Implementation Prompt

## Agentic RAG-Based AI SRE Investigation Platform

You are the lead staff-level AI/backend engineer and implementation
agent. Build this project incrementally as a real, runnable, testable
repository---not a mockup or a code dump. First inspect the existing
repository and preserve useful work. If the repository is empty,
scaffold it cleanly. Use the accompanying `PROJECT_CONTEXT.md` as the
project specification and source terminology.

## Mission

Implement a model-agnostic, evidence-grounded SRE incident-investigation
assistant combining operational documents and structured
incident/service/deployment data. The product must prioritize security,
verifiability, human control, auditability, and demonstrable behavior
over flashy UI or unimplemented architecture claims.

## Mandatory working rules

1.  Start by inspecting the repository, available runtime, package
    manager, and existing tests. Report a concise plan and identify
    assumptions.
2.  Create `README.md`, `.env.example`, architecture notes, API
    contracts, migrations, seed data, tests, and a phased implementation
    checklist.
3.  Do not invent credentials, production data, live integrations, or
    successful deployment. Use synthetic local data and explicit
    adapters.
4.  Never expose secrets. Keep all credentials in environment variables.
    `.env.example` contains placeholders only.
5.  Prefer Python 3.11+ unless repository constraints dictate otherwise.
    Use FastAPI, Pydantic, LangGraph, PostgreSQL, Qdrant, Redis, and
    Streamlit as specified. Pin compatible dependency ranges and
    document versions.
6.  Build in small phases. After each phase, run formatting, linting,
    unit tests, and relevant integration tests; fix failures before
    proceeding.
7.  Keep model/provider interfaces replaceable. Include deterministic
    mock implementations so tests and demos work without API keys.
8.  No destructive or write-capable SQL execution. Use read-only DB
    credentials, AST/parser-based validation, allow-listed
    schemas/tables/columns, statement and timeout/row limits, and
    mandatory human approval for sensitive queries. Fail closed.
9.  Do not claim a feature is implemented until code, tests, and UI/API
    behavior exist.
10. Avoid broad refactors unrelated to the project. Maintain a clear
    changelog of decisions.

## Phase 0 --- Repository reconnaissance and plan

-   Inspect files and report current structure, existing implementation,
    test status, and gaps.
-   Propose a modular architecture and dependency boundaries.
-   Create a task plan with milestones: A. scaffold/contracts/config B.
    data layer + synthetic data C. auth/RBAC/security middleware D.
    ingestion + hybrid retrieval E. LangGraph routing/RAG F. Text2SQL +
    HITL G. caching + budgets/resilience H. output verification/UI I.
    evaluation/observability J. Docker/CI/docs.
-   Ask a question only if a missing decision blocks safe progress;
    otherwise document a conservative assumption and continue.

## Phase 1 --- Repository structure

Use a maintainable structure similar to: - `app/main.py` FastAPI
entrypoint - `app/api/` versioned routers and dependencies - `app/core/`
settings, logging, errors, security policy - `app/models/` Pydantic
request/response/domain models - `app/db/` SQLAlchemy models, session,
migrations, repositories - `app/ingestion/` parsing, normalization,
chunking, dedup, indexing - `app/retrieval/` dense, sparse, RRF,
reranking, CRAG, spotlighting - `app/agents/` LangGraph state, router,
nodes, conditional edges, checkpointing - `app/sql/` schema context,
generation, parser validation, approval, read-only execution -
`app/security/` JWT, RBAC, injection scan, moderation, PII, token
budget - `app/cache/` Redis abstraction and tier policies -
`app/evaluation/` datasets, metrics, Ragas adapters, reports -
`app/audit/` event schemas and persistence - `ui/` Streamlit
application - `tests/unit`, `tests/integration`, `tests/security`,
`tests/evaluation` - `scripts/` seed, ingest, smoke-test - `infra/`
Docker Compose and deployment assets Adapt if the existing repo has a
better established structure; document why.

## Phase 2 --- Contracts and domain model

Define Pydantic schemas for: - investigation request: question, optional
incident/service/time window, request ID - investigation response:
answer, evidence citations, route, confidence/limitations, trace ID,
approval state - evidence item: source type, document/record ID, title,
excerpt, timestamp/version, relevance score - SQL approval request:
generated SQL, rationale, tables/columns, risk flags, expiration,
approver decision - ingestion job/status - audit event - evaluation
result. Define consistent error envelopes and API versioning. Create
OpenAPI docs and contract tests.

## Phase 3 --- Data and local development

-   PostgreSQL schema for users/roles, services, incidents, deployments,
    clusters, pods, audit/approval records, and LangGraph checkpoints.
    Reconcile the seven-table mention by documenting the chosen mapping.
-   Include Alembic migrations and deterministic synthetic seed data:
    incidents, deployments, services, cluster/pod state, runbooks, and
    postmortems.
-   Qdrant collection configuration for dense + sparse retrieval; local
    filesystem corpus with content hashes and metadata.
-   Docker Compose for API, Streamlit, PostgreSQL, Redis, and Qdrant.
    Services should have health checks and persistent development
    volumes.
-   Include a no-external-API demo mode.

## Phase 4 --- Authentication, authorization, and security

Implement: - JWT bearer authentication with expiration and key
configuration. - RBAC and resource scoping for SRE, admin, and
reviewer/approver roles. - Input validation (Pydantic) and conservative
regex screening. - Rate limiting: proposed 20 requests/minute/user. -
Token budget: proposed 100k tokens/day/user; account for estimated and
actual usage. - Input length/token restructuring using tiktoken with
explicit truncation metadata. - Prompt-injection/toxicity scanner
adapter (llm-guard when configured; deterministic test double
otherwise). - Input and output moderation/PII-redaction interfaces. -
Audit security decisions without logging secrets or raw sensitive
content. - Security controls must be enforced server-side, not only
hidden in UI. - Test unauthorized access, role escalation, prompt
injection, PII leakage, rate limits, and budget exhaustion.

## Phase 5 --- Ingestion and retrieval

Build ingestion pipeline: - accept supported text/PDF formats with
size/type limits; - extract text, normalize, chunk with
source/page/section metadata; - deduplicate using content hash; -
preserve document version and ingestion status; - embed via provider
adapter; - index dense and sparse representations in Qdrant. Implement
retrieval: 1. HyDE: generate up to three hypothetical answer variants,
with a switch to disable. 2. Dense and BM25 sparse retrieval in
parallel. 3. RRF fusion with k=60. 4. Cross-encoder reranking via
BGE/Voyage adapter; deterministic fallback for tests. 5. CRAG relevance
grading, threshold 0.7. 6. Tavily fallback only when configured and
allowed; clearly mark external results and never confuse them with
internal evidence. 7. Spotlighting: delimit retrieved text and
explicitly instruct model that retrieved material is untrusted evidence,
not executable instructions. 8. Return source-level citations and
retrieval diagnostics. Add exact-identifier tests for pod names, error
codes, CVEs, incident IDs, and service names.

## Phase 6 --- LangGraph investigation orchestration

Implement a typed graph state and explicit nodes: -
authenticate/authorize context - normalize and security-screen query -
cache lookup - intent router: `rag`, `sql`, `hybrid` - RAG branch -
Text2SQL branch - evidence merge for hybrid - answer generation -
Self-RAG reflection - output moderation/redaction/schema validation -
audit/finalize. Use conditional edges and PostgreSQL checkpointing.
Bound loops. Self-RAG faithfulness threshold is 0.8 and regeneration
attempts must never exceed two. Return a transparent
insufficient-evidence response when evidence remains weak. Avoid
exposing hidden chain-of-thought; provide concise rationale, citations,
and trace events instead.

## Phase 7 --- Safe Text2SQL with human approval

-   Generate schema-aware SELECT statements only.
-   Validate using a SQL parser/AST, not regex alone. Reject multiple
    statements, comments used to evade policy, DML/DDL, unsafe
    functions, unauthorized schemas/tables/columns, unbounded scans, and
    disallowed joins.
-   Use read-only DB role, statement timeout, row cap, and
    parameterization where applicable.
-   Route sensitive queries to LangGraph `interrupt()` approval. Display
    exact SQL, tables touched, risk flags, and purpose to approver.
-   Reject by default if approval is absent, expired, mismatched, or
    from an unauthorized role.
-   Resume only the same checkpointed investigation after approval.
-   Log generated SQL hash, approver identity, decision, execution
    duration, row count, and outcome.
-   Tests must prove no execution occurs before approval and unsafe SQL
    is always rejected.

## Phase 8 --- Five-tier Redis cache

Implement a cache interface and tier policies: - embedding: 7d - intent
routing: 24h - SQL generation: 24h - SQL result: 15m - final RAG answer:
1h. Use SHA-256-derived keys. Include tenant/user authorization scope
and model, prompt, corpus/index, schema, and policy versions in keys
where relevant. Re-check authorization before returning cached data. Do
not cache pending approvals or bypass freshness/safety. Provide
invalidation and metrics. Tests must cover cross-user/role cache
leakage.

## Phase 9 --- Output and response integrity

-   Structured answer format with summary, findings, evidence citations,
    uncertainty, suggested next investigative checks, route, trace ID,
    and approval status.
-   Never claim a remediation was executed; recommendations are
    informational unless a future explicitly approved action system is
    added.
-   Output moderation and PII redaction.
-   Pydantic response validation with at most one bounded repair attempt
    (document the relationship to the project's retry concept).
-   If unsupported or evidence-poor, say so plainly and identify missing
    data.

## Phase 10 --- Streamlit UI

Create a clean SRE console: - login/token handling suitable for local
demo - incident investigation input with optional service/incident/time
filters - response with citations and source metadata - expandable
investigation trace: route, cache, retrieval stages, CRAG score,
reflection attempts, timings - approval/reject screen showing SQL and
validation results - ingestion page/status - evaluation dashboard with
retrieval/grounding/safety/latency/cost metrics - useful empty, loading,
error, and insufficient-evidence states. Do not fabricate charts or
operational state; label synthetic/demo data.

## Phase 11 --- Evaluation and observability

-   Ragas adapters for faithfulness, answer relevance, context
    precision, context recall; make external model-based metrics
    optional.
-   Deterministic tests for core safety invariants.
-   Include evaluation dataset with answerable, unanswerable, exact-ID,
    ambiguous, adversarial, SQL-needed, and hybrid questions.
-   Structured logs with request/trace IDs; metrics for latency, cache
    hits, token use, provider errors, retrieval scores, SQL
    approvals/rejections, and reflection loops.
-   Provide a reproducible evaluation command and report output.

## Phase 12 --- Quality gates and delivery

Before calling the implementation complete: - fresh setup works from
README; - migrations and seed scripts work; - `docker compose up` starts
required local services; - health/readiness endpoints work; - tests
cover core happy paths and security failures; - no secrets committed; -
lint/type checks pass; - OpenAPI is accurate; - UI can complete a demo
investigation in mock mode; - SQL approval boundary is tested; -
limitations and external credentials are documented. Provide final
summary: implemented modules, commands run, test outcomes, remaining
gaps, and next milestone. Never claim unrun tests passed.

## First action

Begin with repository reconnaissance, then create the implementation
plan and scaffold/contracts. Do not attempt to implement every advanced
component in one giant step. Deliver a working vertical slice first:
seeded synthetic incident + runbook → authenticated question → hybrid
retrieval → cited answer → audit event. Then expand safely.
