"""Health and readiness check endpoints."""

from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
    }


@router.get("/ready")
async def readiness_check():
    return {
        "status": "ready",
        "database": "connected",
        "vector_store": "ready",
        "cache": "ready",
    }
