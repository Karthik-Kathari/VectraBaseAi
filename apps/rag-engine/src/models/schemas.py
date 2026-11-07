# VectraBase AI — RAG Engine
# Author: Karthik Kathari (github.com/Karthik-Kathari)

from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Ingestion schemas
# ---------------------------------------------------------------------------

class IngestRequest(BaseModel):
    """Request body for JSON-based ingestion (URL or raw content)."""

    document_id: str = Field(..., description="UUID of the Document record in the DB.")
    tenant_id: str = Field(..., description="UUID of the owning tenant.")
    file_path: Optional[str] = Field(
        None, description="Absolute server-side path to an already-uploaded file."
    )
    url: Optional[str] = Field(None, description="Public URL to scrape and ingest.")
    content: Optional[str] = Field(None, description="Raw text / markdown content to ingest.")
    source_type: Literal["pdf", "markdown", "url", "text"] = Field(
        "text", description="Type of the source material."
    )


class IngestProgressEvent(BaseModel):
    """Server-sent event emitted during the ingestion pipeline."""

    document_id: str
    stage: Literal["EXTRACTING", "CHUNKING", "EMBEDDING", "STORING", "COMPLETE", "ERROR"]
    progress: int = Field(..., ge=0, le=100, description="Overall pipeline progress (0-100).")
    chunks_processed: int = Field(0, ge=0)
    total_chunks: int = Field(0, ge=0)
    current_chunk_preview: str = Field(
        "", description="First 120 chars of the chunk being processed."
    )
    elapsed_ms: int = Field(0, ge=0, description="Wall-clock ms since ingestion started.")
    error: Optional[str] = Field(None)


# ---------------------------------------------------------------------------
# Query schemas
# ---------------------------------------------------------------------------

class QueryRequest(BaseModel):
    """Request body for a RAG query."""

    query: str = Field(..., min_length=1, max_length=2000, description="User's question.")
    tenant_id: str = Field(..., description="UUID of the querying tenant.")
    session_id: Optional[str] = Field(
        None, description="Optional session UUID for conversation continuity."
    )
    top_k: int = Field(5, ge=1, le=50, description="Maximum number of chunks to retrieve.")
    similarity_threshold: float = Field(
        0.72, ge=0.0, le=1.0, description="Minimum cosine similarity to include a chunk."
    )


class Citation(BaseModel):
    """A single source citation returned alongside an LLM answer."""

    chunk_id: str
    document_id: str
    document_name: str
    page_number: Optional[int] = None
    chunk_index: int
    similarity: float
    raw_text: str = Field(..., description="The verbatim chunk text used as context.")


class QueryStreamEvent(BaseModel):
    """A single server-sent event in the query stream."""

    type: Literal["token", "citation", "done", "error"]
    token: Optional[str] = Field(None, description="Incremental LLM token (type=token).")
    citation: Optional[Citation] = Field(None, description="Source citation (type=citation).")
    total_latency_ms: Optional[int] = Field(
        None, description="End-to-end latency in ms (type=done)."
    )
    cache_hit: Optional[bool] = Field(None, description="Whether the response was cache-served.")
    rate_limited: Optional[bool] = Field(
        None, description="Whether the LLM provider was rate-limited."
    )
    error: Optional[str] = Field(None, description="Error message (type=error).")


# ---------------------------------------------------------------------------
# Chunk schemas
# ---------------------------------------------------------------------------

class ChunkRecord(BaseModel):
    """A document chunk as stored in the vector database."""

    id: str
    document_id: str
    tenant_id: str
    content: str
    chunk_index: int
    token_count: int
    page_number: Optional[int] = None
    similarity: Optional[float] = Field(
        None, description="Cosine similarity to a query (present in search results only)."
    )


class ChunkListResponse(BaseModel):
    """Paginated list of chunks for a document."""

    document_id: str
    total: int
    page: int
    page_size: int
    chunks: list[ChunkRecord]


# ---------------------------------------------------------------------------
# Health schemas
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    """Service health check response."""

    status: Literal["ok", "degraded", "error"]
    database: Literal["connected", "disconnected"]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    version: str = "1.0.0"
