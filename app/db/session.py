"""Database engine and session management with fallback support."""

import asyncio
from typing import AsyncGenerator, Any
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.db.base import Base

# Sync engine (works across all environments with zero extra C-extensions)
db_url = settings.DATABASE_URL.replace("+aiosqlite", "").replace("+asyncpg", "")
if "sqlite" in db_url and "check_same_thread" not in db_url:
    sync_engine = create_engine(db_url, connect_args={"check_same_thread": False}, future=True)
else:
    sync_engine = create_engine(db_url, future=True)

SyncSessionLocal = sessionmaker(
    bind=sync_engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


class AsyncSessionAdapter:
    """Async wrapper around standard SQLAlchemy session using thread pool executor."""

    def __init__(self, session: Session = None):
        self._session = session or SyncSessionLocal()

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            await self.rollback()
        else:
            await self.commit()
        await self.close()

    async def execute(self, statement: Any, params: Any = None):
        return await asyncio.to_thread(self._session.execute, statement, params)

    async def commit(self):
        return await asyncio.to_thread(self._session.commit)

    async def rollback(self):
        return await asyncio.to_thread(self._session.rollback)

    async def close(self):
        return await asyncio.to_thread(self._session.close)

    def add(self, instance: Any):
        self._session.add(instance)

    def add_all(self, instances: Any):
        self._session.add_all(instances)


def AsyncSessionLocal() -> AsyncSessionAdapter:
    return AsyncSessionAdapter()


async def init_db() -> None:
    """Initialize database tables."""
    await asyncio.to_thread(Base.metadata.create_all, sync_engine)


async def get_db() -> AsyncGenerator[AsyncSessionAdapter, None]:
    """FastAPI dependency for obtaining an async-compatible database session."""
    session = AsyncSessionAdapter()
    try:
        yield session
    finally:
        await session.close()
