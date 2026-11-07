# VectraBase AI — Document Ingestion Router (Streaming SSE Progress)
# Author: Karthik Kathari (github.com/Karthik-Kathari)

from __future__ import annotations

import asyncio
import json
import logging
import os
import time
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
import asyncpg

from config import get_settings
from database import get_db
from services.extractor import extract_pdf, extract_markdown, extract_url, extract_text_file
from services.chunker import chunk_pages, chunk_text
from services.embedder import embed_texts
from services.vector_store import store_chunks, update_document_status

logger = logging.getLogger("vectrabase.ingest")
settings = get_settings()
router = APIRouter()


@router.post("")
@router.post("/")
async def ingest_document(
    document_id: str = Form(...),
    tenant_id: str = Form(...),
    source_type: str = Form(...),  # PDF, MARKDOWN, URL, TXT
    url: str | None = Form(None),
    file: UploadFile | None = File(None),
    pool: asyncpg.Pool = Depends(get_db),
):
    """Ingest a document with real-time SSE progress events."""
    start_time = time.perf_counter()

    async def progress_stream() -> AsyncGenerator[str, None]:
        nonlocal start_time
        try:
            # ─── Stage 1: Extraction (0% -> 20%) ───────────────────────────────
            yield f"data: {json.dumps({'stage': 'EXTRACTING', 'progress': 10, 'message': 'Extracting text from source...'})}\n\n"
            await asyncio.sleep(0.05)

            pages: list[tuple[int, str]] = []
            extracted_text = ""

            if source_type.upper() == "PDF" and file:
                save_path = os.path.join(settings.uploads_dir, f"{document_id}_{file.filename}")
                content = await file.read()
                with open(save_path, "wb") as f:
                    f.write(content)
                pages = extract_pdf(save_path)
            elif source_type.upper() == "URL" and url:
                extracted_text = await extract_url(url)
                pages = [(1, extracted_text)]
            elif file:
                content = (await file.read()).decode("utf-8", errors="replace")
                if source_type.upper() == "MARKDOWN":
                    extracted_text = extract_markdown(content)
                else:
                    extracted_text = extract_text_file(content)
                pages = [(1, extracted_text)]
            else:
                raise ValueError("No valid file or URL provided for ingestion.")

            total_extracted_chars = sum(len(text) for _, text in pages)
            yield f"data: {json.dumps({'stage': 'EXTRACTING', 'progress': 25, 'message': f'Extracted {total_extracted_chars} characters across {len(pages)} pages.'})}\n\n"

            # ─── Stage 2: Semantic Chunking (25% -> 40%) ───────────────────────
            yield f"data: {json.dumps({'stage': 'CHUNKING', 'progress': 30, 'message': f'Splitting text (chunkSize={settings.chunk_size}, overlap={settings.chunk_overlap})...'})}\n\n"
            chunks = chunk_pages(pages, chunk_size=settings.chunk_size, overlap=settings.chunk_overlap)
            total_tokens = sum(c.get("token_count", 0) for c in chunks)

            yield f"data: {json.dumps({'stage': 'CHUNKING', 'progress': 40, 'message': f'Created {len(chunks)} semantic chunks ({total_tokens} total tokens).', 'chunksProcessed': len(chunks)})}\n\n"

            # ─── Stage 3: Vector Embeddings (40% -> 80%) ───────────────────────
            yield f"data: {json.dumps({'stage': 'EMBEDDING', 'progress': 45, 'message': 'Generating 1536-dimensional vector embeddings...'})}\n\n"
            chunk_texts = [c["content"] for c in chunks]

            batch_size = 20
            embeddings: list[list[float]] = []
            for i in range(0, len(chunk_texts), batch_size):
                batch = chunk_texts[i : i + batch_size]
                batch_emb = await embed_texts(batch)
                embeddings.extend(batch_emb)
                pct = int(45 + (35 * (len(embeddings) / len(chunk_texts))))
                yield f"data: {json.dumps({'stage': 'EMBEDDING', 'progress': pct, 'message': f'Embedded {len(embeddings)}/{len(chunk_texts)} chunks.'})}\n\n"
                await asyncio.sleep(0.01)

            # ─── Stage 4: PostgreSQL pgvector Storage (80% -> 95%) ─────────────
            yield f"data: {json.dumps({'stage': 'STORING', 'progress': 85, 'message': 'Writing to PostgreSQL pgvector with HNSW index...'})}\n\n"
            await store_chunks(pool, document_id, tenant_id, chunks, embeddings)
            await update_document_status(pool, document_id, "INDEXED", len(chunks), total_tokens)

            # ─── Stage 5: Complete (100%) ──────────────────────────────────────
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            yield f"data: {json.dumps({'stage': 'COMPLETE', 'progress': 100, 'message': 'Document successfully indexed and ready for live RAG query!', 'totalChunks': len(chunks), 'totalTokens': total_tokens, 'elapsedMs': elapsed_ms})}\n\n"

        except Exception as e:
            logger.exception("Ingestion failed: %s", e)
            try:
                await update_document_status(pool, document_id, "FAILED", 0, 0, str(e))
            except Exception:
                pass
            yield f"data: {json.dumps({'stage': 'FAILED', 'progress': 0, 'error': str(e)})}\n\n"

    return StreamingResponse(progress_stream(), media_type="text/event-stream")
