# VectraBase AI — Vector Store & Hybrid Search Service
# Author: Karthik Kathari (github.com/Karthik-Kathari)

from __future__ import annotations

import json
import logging
from typing import Any
import asyncpg

logger = logging.getLogger("vectrabase.vector_store")


def vector_to_sql_literal(vec: list[float]) -> str:
    """Format float array into pgvector literal format: '[0.1, 0.2, ...]'."""
    return f"[{','.join(f'{x:.6f}' for x in vec)}]"


async def store_chunks(
    pool: asyncpg.Pool,
    document_id: str,
    tenant_id: str,
    chunks: list[dict[str, Any]],
    embeddings: list[list[float]],
) -> int:
    """Store document chunks and their pgvector embeddings into DocumentChunk table."""
    if not chunks:
        return 0

    query = """
        INSERT INTO "DocumentChunk" (
            id,
            "documentId",
            "tenantId",
            content,
            "chunkIndex",
            "tokenCount",
            "pageNumber",
            embedding,
            "createdAt"
        )
        VALUES (
            gen_random_uuid(),
            $1::uuid,
            $2::uuid,
            $3,
            $4,
            $5,
            $6,
            $7::vector,
            NOW()
        );
    """

    inserted = 0
    async with pool.acquire() as conn:
        async with conn.transaction():
            for i, chunk in enumerate(chunks):
                emb_literal = vector_to_sql_literal(embeddings[i]) if i < len(embeddings) else None
                await conn.execute(
                    query,
                    document_id,
                    tenant_id,
                    chunk.get("content", ""),
                    chunk.get("chunk_index", i),
                    chunk.get("token_count", 0),
                    chunk.get("page_number", 1),
                    emb_literal,
                )
                inserted += 1

    logger.info("Inserted %d chunks for document %s", inserted, document_id)
    return inserted


async def hybrid_search(
    pool: asyncpg.Pool,
    query_embedding: list[float],
    query_text: str,
    tenant_id: str,
    top_k: int = 5,
    similarity_threshold: float = 0.72,
) -> list[dict[str, Any]]:
    """Execute hybrid search combining pgvector cosine similarity and tsvector keyword rank."""
    emb_literal = vector_to_sql_literal(query_embedding)

    query = """
        SELECT
            dc.id,
            dc."documentId",
            dc.content,
            dc."chunkIndex",
            dc."tokenCount",
            dc."pageNumber",
            d.name as document_name,
            ROUND((1 - (dc.embedding <=> $1::vector))::numeric, 4) as cosine_similarity,
            COALESCE(ts_rank(to_tsvector('english', dc.content), plainto_tsquery('english', $2)), 0.0) as keyword_rank,
            ROUND(
                (
                    0.75 * (1 - (dc.embedding <=> $1::vector)) +
                    0.25 * COALESCE(ts_rank(to_tsvector('english', dc.content), plainto_tsquery('english', $2)), 0.0)
                )::numeric, 4
            ) as hybrid_score
        FROM "DocumentChunk" dc
        JOIN "Document" d ON d.id = dc."documentId"
        WHERE dc."tenantId" = $3::uuid
          AND (1 - (dc.embedding <=> $1::vector)) >= $4
        ORDER BY hybrid_score DESC
        LIMIT $5;
    """

    async with pool.acquire() as conn:
        rows = await conn.fetch(
            query,
            emb_literal,
            query_text,
            tenant_id,
            similarity_threshold,
            top_k,
        )

    results = []
    for r in rows:
        results.append({
            "chunk_id": str(r["id"]),
            "document_id": str(r["documentId"]),
            "document_name": r["document_name"],
            "page_number": r["pageNumber"],
            "chunk_index": r["chunkIndex"],
            "similarity": float(r["cosine_similarity"]),
            "keyword_rank": float(r["keyword_rank"]),
            "hybrid_score": float(r["hybrid_score"]),
            "raw_text": r["content"],
        })

    return results


async def update_document_status(
    pool: asyncpg.Pool,
    document_id: str,
    status: str,
    total_chunks: int = 0,
    total_tokens: int = 0,
    error_message: str | None = None,
) -> None:
    """Update document ingestion status in the Document table."""
    query = """
        UPDATE "Document"
        SET
            status = $1::"DocumentStatus",
            "totalChunks" = $2,
            "totalTokens" = $3,
            "errorMessage" = $4,
            "updatedAt" = NOW()
        WHERE id = $5::uuid;
    """
    async with pool.acquire() as conn:
        await conn.execute(query, status, total_chunks, total_tokens, error_message, document_id)
