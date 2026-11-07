# VectraBase AI — RAG Engine
# Author: Karthik Kathari (github.com/Karthik-Kathari)

from __future__ import annotations

import logging
from typing import AsyncGenerator

import asyncpg

logger = logging.getLogger("vectrabase.database")

_pool: asyncpg.Pool | None = None


async def init_db(database_url: str) -> None:
    """Create the asyncpg connection pool.

    The pgvector extension registers a custom codec for the ``vector`` type.
    We set up an ``init`` callback that installs a text codec so asyncpg can
    decode vector columns without needing a local type OID look-up.
    """
    global _pool

    async def _init_connection(conn: asyncpg.Connection) -> None:
        """Register pgvector codec on each new connection."""
        await conn.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        await conn.set_type_codec(
            "vector",
            encoder=lambda v: v,
            decoder=lambda v: v,
            schema="public",
            format="text",
        )

    _pool = await asyncpg.create_pool(
        dsn=database_url,
        min_size=2,
        max_size=20,
        command_timeout=60,
        init=_init_connection,
    )
    logger.info("asyncpg pool created (min=2, max=20).")


async def close_db() -> None:
    """Gracefully close the connection pool."""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
        logger.info("asyncpg pool closed.")


def get_pool() -> asyncpg.Pool:
    """Return the active pool, raising if not initialised."""
    if _pool is None:
        raise RuntimeError(
            "Database pool is not initialised. "
            "Ensure init_db() was awaited during application startup."
        )
    return _pool


def get_db() -> asyncpg.Pool:
    """FastAPI dependency: returns the active asyncpg connection pool."""
    return get_pool()
