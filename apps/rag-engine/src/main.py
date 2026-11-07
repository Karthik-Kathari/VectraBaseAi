# VectraBase AI — RAG Engine
# Author: Karthik Kathari (github.com/Karthik-Kathari)

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from database import init_db, close_db
from routers import health, ingest, query, chunks

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("vectrabase.rag-engine")

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle — startup and shutdown."""
    logger.info("VectraBase AI RAG Engine starting up …")

    # Initialise asyncpg connection pool
    await init_db(settings.database_url)
    logger.info("Database connection pool initialised.")

    # Ensure uploads directory exists
    os.makedirs(settings.uploads_dir, exist_ok=True)

    logger.info(
        "VectraBase AI RAG Engine started — listening on port %s", settings.port
    )
    yield

    # Teardown
    logger.info("VectraBase AI RAG Engine shutting down …")
    await close_db()
    logger.info("Database connection pool closed.")


app = FastAPI(
    title="VectraBase AI RAG Engine",
    version="1.0.0",
    description=(
        "Production-grade Retrieval-Augmented Generation microservice "
        "powering VectraBase AI — vector storage, hybrid search, streaming LLM."
    ),
    contact={
        "name": "Karthik Kathari",
        "url": "https://github.com/Karthik-Kathari",
        "email": "karthikmk.workspace@gmail.com",
    },
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS — allow all origins in development; tighten via env in production
# ---------------------------------------------------------------------------
cors_origins: list[str] = (
    settings.cors_origins.split(",")
    if settings.cors_origins != "*"
    else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(health.router, prefix="/health", tags=["Health"])
app.include_router(ingest.router, prefix="/ingest", tags=["Ingestion"])
app.include_router(query.router, prefix="/query", tags=["Query"])
app.include_router(chunks.router, prefix="/chunks", tags=["Chunks"])


@app.get("/", include_in_schema=False)
async def root():
    return {
        "service": "VectraBase AI RAG Engine",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }
