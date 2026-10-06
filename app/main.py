"""Main FastAPI Application Entrypoint."""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.core.errors import SREPlatformException, ErrorResponse, ErrorDetail
from app.api.v1.router import api_v1_router
from app.db.seed import seed_database
from app.ingestion.pipeline import ingestion_pipeline


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup initialization and graceful shutdown."""
    logger.info("Starting up %s (env=%s)...", settings.APP_NAME, settings.APP_ENV)

    # 1. Initialize DB and Seed Synthetic SRE data
    try:
        await seed_database()
        logger.info("Database initialized and synthetic SRE entities seeded successfully.")
    except Exception as e:
        logger.error("Database seed failed: %s", str(e))

    # 2. Ingest Runbooks and Postmortems into Hybrid Vector/BM25 Index
    try:
        runbook_dir = os.path.join(os.getcwd(), "data", "runbooks")
        postmortem_dir = os.path.join(os.getcwd(), "data", "postmortems")

        if os.path.exists(runbook_dir):
            rb_count = ingestion_pipeline.ingest_directory(runbook_dir, doc_type="runbook")
            logger.info("Ingested %d operational runbooks.", rb_count)

        if os.path.exists(postmortem_dir):
            pm_count = ingestion_pipeline.ingest_directory(postmortem_dir, doc_type="postmortem")
            logger.info("Ingested %d incident postmortems.", pm_count)
    except Exception as e:
        logger.error("Knowledge ingestion startup error: %s", str(e))

    yield

    logger.info("Shutting down %s...", settings.APP_NAME)


app = FastAPI(
    title="Agentic RAG AI SRE Platform",
    description="Model-agnostic, evidence-grounded AI SRE incident investigation platform with multi-tier caching, 9-layer security gate, and audit logging.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Enable CORS for Streamlit UI and clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(SREPlatformException)
async def custom_sre_exception_handler(request: Request, exc: SREPlatformException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=ErrorDetail(
                code=exc.code,
                message=exc.message,
                details=exc.details,
            )
        ).model_dump(),
    )


# Mount API V1 routes
app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    return {
        "service": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "health": f"{settings.API_V1_PREFIX}/health",
    }
