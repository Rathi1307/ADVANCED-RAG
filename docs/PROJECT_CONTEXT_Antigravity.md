# Project Context: Agentic RAG-Based AI SRE Investigation Platform

## Purpose

Build a model-agnostic, evidence-grounded AI SRE investigation assistant
that combines enterprise operational knowledge (runbooks, postmortems,
documentation) with live structured operational records (incidents,
services, deployments, clusters, pods). It should help on-call engineers
investigate incidents quickly while making evidence, approvals, security
controls, and audit trails visible.

## Source-of-truth documents

This context is derived from: - `Agentic_RAG_SRE_Synopsis (1).docx` -
`Enterprise_RAG_Architecture_revised (1).pptx`

Preserve the project framing and terminology. Treat exact thresholds and
named technologies below as the current proposed design, not as proof
they are already implemented. Where details conflict or are
underspecified, record an open decision rather than silently inventing
behavior.

## Core use case

An engineer asks: "Checkout latency has increased 3x since the last
deployment --- what changed, and has this happened before?"

The system should: 1. Authenticate and authorize the engineer. 2.
Validate, sanitize, scan, and budget the request. 3. Use a five-tier
Redis cache where safe. 4. Route the request to RAG, Text2SQL, or hybrid
investigation. 5. Retrieve documentary evidence and/or query structured
operational records. 6. Check retrieval relevance, isolate retrieved
content from instructions, and ground the answer in evidence. 7. Require
human approval before executing sensitive generated SQL. 8. Reflect on
answer faithfulness/completeness and allow at most two bounded
regeneration attempts. 9. Apply output moderation, PII redaction, and
response-schema validation. 10. Return answer, citations/evidence,
query/approval metadata, and auditable trace information.

## Problem map: 15 problems and intended responses

### Small scale: finding the right data

1.  Fragmented operational knowledge → unified knowledge retrieval.
2.  Vector search misses exact identifiers → dense + BM25 hybrid
    retrieval.
3.  Poor document ranking → cross-encoder reranking.
4.  Irrelevant retrieved evidence → CRAG retrieval grading and
    corrective fallback.
5.  Unsupported generated answers → Self-RAG answer verification.

### Medium scale: using data safely

6.  Some answers exist only in databases → Text2SQL.
7.  Generated SQL may be destructive → SQL validation and SELECT-only
    execution.
8.  Sensitive queries need human control → human-in-the-loop approval.
9.  Users have different permissions → RBAC/authorization.
10. Retrieved content may attack the model → prompt-injection defenses
    and spotlighting.

### Large scale: reliable operation

11. Repeated AI operations are expensive → multi-tier caching.
12. Concurrency may overload the pipeline → rate limits, resilience,
    scaling.
13. LLM usage may be unbounded → token/cost budgets.
14. Conclusions need verification → evaluation and evidence.
15. Decisions must be investigable → auditability and observability.

## Proposed architecture and stack

-   API: Python FastAPI, Uvicorn/Gunicorn, Pydantic schemas, OpenAPI.
-   UI: Streamlit.
-   Orchestration: LangGraph + LangChain, conditional edges, PostgreSQL
    checkpointing, `interrupt()` for human approval.
-   LLM: OpenAI GPT-4o as proposed primary generation model.
-   Embeddings: `text-embedding-3-small`.
-   Retrieval: Qdrant dense + sparse/BM25; Reciprocal Rank Fusion (RRF,
    k=60); cross-encoder reranker (BGE or Voyage AI).
-   Retrieval techniques: HyDE (the deck specifies 3 hypothetical
    answers), CRAG relevance grader, Tavily fallback below 0.7,
    XML-delimited spotlighting, Self-RAG reflection with threshold 0.8
    and maximum two regeneration attempts.
-   Structured data: PostgreSQL 16, SQLAlchemy/psycopg2, LangChain SQL
    toolkit, SELECT-only SQL validation and blocklist.
-   Cache: Upstash Redis, SHA-256 keyed, five tiers:
    -   embeddings: 7 days
    -   intent routing: 24 hours
    -   SQL generation: 24 hours
    -   SQL results: 15 minutes
    -   final RAG answers: 1 hour
-   Security: JWT bearer authentication (PyJWT); rate limit 20
    requests/minute; token budget 100k tokens/day/user; Pydantic + regex
    input screening; llm-guard prompt-injection/toxicity scan; tiktoken
    input restructuring/truncation; content moderation and PII redaction
    on input and output; response Pydantic validation.
-   Storage: PostgreSQL operational data + LangGraph checkpoints;
    Qdrant; S3 or local filesystem for raw documents and deduplication.
-   Evaluation: Ragas faithfulness, answer relevance, context precision,
    context recall; log per-response scores.
-   Deployment direction: Docker, Docker Compose, AWS ECS Fargate,
    GitHub Actions CI/CD.

## Request-side security layers as named in source

-   L1: Pydantic + regex injection-pattern screening.
-   L2: llm-guard scan for prompt injection and toxicity.
-   L3: Spotlighting/context isolation within the LangGraph pipeline.
-   L4a: JWT bearer validation.
-   L4b: 20 requests/minute rate limit.
-   L5: tiktoken-based input restructuring/truncation.
-   L6: 100k tokens/day/user budget.
-   L7a: input moderation and PII redaction.
-   L7b: output moderation and PII redaction.
-   L8: Spotlighting is also identified in the presentation as an
    in-graph layer; clarify implementation mapping without weakening it.
-   L9: Pydantic response-schema validation, with bounded retry on
    schema failure.

Note: The synopsis/deck describe the nine-layer defense with different
grouping/placement details. Implement the controls explicitly and
document the mapping; do not omit a control because numbering overlaps.

## RAG flow

1.  Accept and normalize query.
2.  Optionally generate three HyDE hypothetical answers to enrich
    retrieval.
3.  Embed enriched query.
4.  Run dense and BM25/sparse retrieval in parallel.
5.  Fuse rankings using RRF with k=60.
6.  Rerank fused candidates using BGE or Voyage AI.
7.  Grade evidence relevance.
8.  If relevance \<0.7, use Tavily fallback as specified; label external
    web evidence distinctly and do not present it as internal
    operational truth.
9.  Spotlight retrieved text using explicit delimiters and treat it as
    untrusted data, never instructions.
10. Generate an evidence-grounded answer with citations to
    document/chunk identifiers.
11. Self-reflect for faithfulness/completeness; if score \<0.8,
    regenerate at most twice.
12. Apply output security and schema validation.

## Text2SQL flow

1.  Determine user authorization and query scope.
2.  Generate schema-aware SQL.
3.  Parse and validate SQL structurally; allow SELECT only, reject
    multiple statements, writes, DDL, dangerous functions, unauthorized
    tables/columns, and unsafe constructs.
4.  Apply read-only database credentials and query timeout/row limits as
    defense in depth.
5.  Pause with LangGraph `interrupt()` for human approval when
    sensitive, per project design.
6.  Execute only approved validated queries.
7.  Format rows as structured evidence with query metadata and source
    timestamps.
8.  Include SQL approval/execution trace in audit log. Never execute
    generated SQL against production by default. Use seeded
    synthetic/demo data during development.

## Five-tier cache behavior

Use SHA-256 keys and per-tier TTLs listed above. Cache keys must include
relevant tenant/user authorization scope, normalized query,
model/version, corpus/index version, schema version, and policy version
as applicable. Never let a cache hit bypass authorization, approval,
freshness requirements, or security scanning. Keep SQL-result TTL short
and make invalidation/versioning explicit.

## Data model scope

The synopsis identifies users, incidents, services, runbooks, audit
logs; the deck additionally names clusters and pods, and describes seven
PostgreSQL tables. Design a documented schema that includes at least: -
users/roles or identity mapping - services - incidents - deployments
(needed for change correlation in the use case) - clusters - pods -
audit events / approval records - LangGraph checkpoint persistence
Document whether runbooks live as relational metadata, files, or both.
If exact seven-table mapping is not specified, propose one and label it
as an implementation decision.

## UI expectations

Streamlit interface for authenticated SRE investigation: -
sign-in/session state - incident question/chat panel - route
classification (RAG / SQL / hybrid) visible as trace metadata - evidence
citations with source title, chunk/record ID, timestamp, and relevance
score where available - SQL approval/reject panel showing generated SQL
and safety findings before execution - investigation trace/status (cache
hit, retrieval stages, reflection attempts) - clear uncertainty /
insufficient-evidence state - no fabricated remediation actions or
claims of executing changes

## API surface to implement

Define and document versioned endpoints for: - health/readiness -
authentication or token/session validation - document ingestion and
ingestion status - incident investigation/query - SQL approval/rejection
and resume - evaluation runs/results - audit/trace retrieval (authorized
users only)

Exact endpoint paths and payloads are implementation choices; create
OpenAPI schemas and tests before wiring the UI.

## Evaluation and acceptance measures

Build a repeatable test corpus with synthetic incidents, runbooks,
postmortems, identifiers, and adversarial documents. Track: - retrieval
precision/recall and exact-identifier recall - citation coverage and
evidence attribution - faithfulness and answer relevance - CRAG
threshold behavior - Self-RAG regeneration count (never \>2) - SQL
policy rejection rate on unsafe cases; no unapproved execution - RBAC
isolation and cache-scope isolation - PII redaction and prompt-injection
resilience - latency, cache hit rate, token use, cost, errors,
concurrency behavior - audit completeness

## Development principles

-   Build a working vertical slice before implementing every advanced
    technique.
-   Use synthetic data and local Docker Compose services first.
-   Keep external services behind interfaces/adapters so models and
    providers can be swapped.
-   Provide `.env.example`; never commit secrets.
-   Provide migrations, seed scripts, typed Pydantic contracts,
    structured logs, tests, and setup documentation.
-   Use deterministic mock providers so core tests run without paid API
    keys.
-   Fail closed on authorization, SQL safety, approval, and output
    validation.
-   Show evidence and uncertainty; do not hallucinate operational state.
-   Make each advanced feature measurable and configurable; avoid
    decorative/nonfunctional claims.
