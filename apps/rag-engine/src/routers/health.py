# VectraBase AI — Health Check Router
# Author: Karthik Kathari (github.com/Karthik-Kathari)

from __future__ import annotations

import time
from fastapi import APIRouter, Depends
import asyncpg
from database import get_db

router = APIRouter()


@router.get("")
@router.get("/")
async def health_check(pool: asyncpg.Pool = Depends(get_db)):
    start = time.perf_counter()
    db_status = "healthy"

    try:
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1;")
    except Exception as e:
        db_status = f"unhealthy: {e}"

    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "service": "VectraBase AI RAG Engine",
        "author": "Karthik Kathari",
        "database": db_status,
        "responseTimeMs": elapsed_ms,
        "pgvector": "enabled",
    }
