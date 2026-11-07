# VectraBase AI — RAG Streaming Query Router
# Author: Karthik Kathari (github.com/Karthik-Kathari)

from __future__ import annotations

import json
import logging
import time
from typing import AsyncGenerator

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
import asyncpg
from pydantic import BaseModel

from config import get_settings
from database import get_db
from services.embedder import embed_query
from services.vector_store import hybrid_search
from services.llm import stream_rag_response

logger = logging.getLogger("vectrabase.query")
settings = get_settings()
router = APIRouter()


class QueryPayload(BaseModel):
    query: str
    tenant_id: str
    session_id: str | None = None
    top_k: int = 5
    similarity_threshold: float = 0.72


@router.post("")
@router.post("/")
async def query_rag(payload: QueryPayload, pool: asyncpg.Pool = Depends(get_db)):
    """Query the RAG engine and stream citations and answer tokens via SSE."""
    start_total = time.perf_counter()

    async def event_generator() -> AsyncGenerator[str, None]:
        nonlocal start_total

        # 1. Embedding generation
        emb_start = time.perf_counter()
        query_vector = await embed_query(payload.query)
        embedding_ms = int((time.perf_counter() - emb_start) * 1000)

        # 2. Hybrid pgvector search
        search_start = time.perf_counter()
        chunks = await hybrid_search(
            pool=pool,
            query_embedding=query_vector,
            query_text=payload.query,
            tenant_id=payload.tenant_id,
            top_k=payload.top_k,
            similarity_threshold=payload.similarity_threshold,
        )
        vector_search_ms = int((time.perf_counter() - search_start) * 1000)

        # 3. Stream citation pills first
        for chunk in chunks:
            citation_payload = {
                "chunkId": chunk["chunk_id"],
                "documentId": chunk["document_id"],
                "documentName": chunk["document_name"],
                "pageNumber": chunk["page_number"],
                "chunkIndex": chunk["chunk_index"],
                "similarity": chunk["similarity"],
                "rawText": chunk["raw_text"],
            }
            yield f"data: {json.dumps({'type': 'citation', 'citation': citation_payload})}\n\n"

        # 4. Stream LLM tokens
        llm_start = time.perf_counter()
        token_count = 0

        async for token in stream_rag_response(
            query=payload.query,
            chunks=chunks,
            model=settings.llm_model,
        ):
            token_count += 1
            yield f"data: {json.dumps({'type': 'token', 'token': token})}\n\n"

        llm_stream_ms = int((time.perf_counter() - llm_start) * 1000)
        total_latency_ms = int((time.perf_counter() - start_total) * 1000)

        # 5. Emit done event with complete latency breakdown
        yield f"data: {json.dumps({'type': 'done', 'totalLatencyMs': total_latency_ms, 'embeddingMs': embedding_ms, 'vectorSearchMs': vector_search_ms, 'llmStreamMs': llm_stream_ms, 'tokensUsed': token_count, 'chunkCount': len(chunks)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
