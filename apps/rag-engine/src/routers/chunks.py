# VectraBase AI — Document Chunk Retrieval Router
# Author: Karthik Kathari (github.com/Karthik-Kathari)

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
import asyncpg
from database import get_db

router = APIRouter()


@router.get("/{document_id}")
async def get_document_chunks(
    document_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    pool: asyncpg.Pool = Depends(get_db),
):
    query = """
        SELECT
            id,
            "documentId",
            "tenantId",
            content,
            "chunkIndex",
            "tokenCount",
            "pageNumber",
            "createdAt"
        FROM "DocumentChunk"
        WHERE "documentId" = $1::uuid
        ORDER BY "chunkIndex" ASC
        LIMIT $2 OFFSET $3;
    """

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, document_id, limit, offset)
        count = await conn.fetchval(
            'SELECT COUNT(*) FROM "DocumentChunk" WHERE "documentId" = $1::uuid;',
            document_id,
        )

    chunks = [
        {
            "id": str(r["id"]),
            "documentId": str(r["documentId"]),
            "content": r["content"],
            "chunkIndex": r["chunkIndex"],
            "tokenCount": r["tokenCount"],
            "pageNumber": r["pageNumber"],
            "createdAt": r["createdAt"].isoformat(),
        }
        for r in rows
    ]

    return {
        "success": True,
        "total": count,
        "limit": limit,
        "offset": offset,
        "data": chunks,
    }

