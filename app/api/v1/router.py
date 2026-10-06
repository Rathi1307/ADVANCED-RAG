"""Aggregated V1 API Router."""

from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.investigate import router as investigate_router
from app.api.v1.ingestion import router as ingestion_router
from app.api.v1.audit import router as audit_router
from app.api.v1.health import router as health_router

api_v1_router = APIRouter()
api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(investigate_router)
api_v1_router.include_router(ingestion_router)
api_v1_router.include_router(audit_router)
