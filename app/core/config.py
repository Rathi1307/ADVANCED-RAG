"""Core configuration module with Pydantic settings."""

import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Agentic-RAG-SRE"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    SECRET_KEY: str = "temporary-insecure-secret-key-for-development-32chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    DATABASE_URL: str = "sqlite+aiosqlite:///./sre_platform.db"
    DATABASE_READONLY_URL: str = "sqlite+aiosqlite:///./sre_platform.db"

    QDRANT_URL: Optional[str] = None
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_COLLECTION_NAME: str = "sre_operational_knowledge"

    REDIS_URL: Optional[str] = None

    OPENAI_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gpt-4o"
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    USE_MOCK_MODELS: bool = True

    # Security & Budget Settings
    RATE_LIMIT_PER_MINUTE: int = 20
    TOKEN_BUDGET_PER_DAY: int = 100000
    MAX_INPUT_TOKENS: int = 4000
    CRAG_RELEVANCE_THRESHOLD: float = 0.7
    SELF_RAG_FAITHFULNESS_THRESHOLD: float = 0.8
    MAX_SELF_RAG_RETRIES: int = 2

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
