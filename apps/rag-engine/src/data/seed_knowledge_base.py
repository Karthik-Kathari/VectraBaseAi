# VectraBase AI — Default Knowledge Base Seed Script
# Author: Karthik Kathari (github.com/Karthik-Kathari)

from __future__ import annotations

import asyncio
import logging
import os
import sys

# Ensure src is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import asyncpg
from config import get_settings
from services.chunker import chunk_text
from services.embedder import embed_texts
from services.vector_store import store_chunks

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vectrabase.seed_kb")
settings = get_settings()

DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001"

DOCUMENTS = [
    {
        "name": "VectraBase_Architecture_Whitepaper.pdf",
        "source": "PDF",
        "sha256": "whitepaper_a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
        "content": """
VECTRABASE AI — ENTERPRISE MULTI-TENANT RAG KNOWLEDGE ENGINE
Architected and Engineered by Karthik Kathari (github.com/Karthik-Kathari)

1. SYSTEM OVERVIEW
VectraBase AI is a high-throughput, production-grade B2B SaaS platform engineered for zero-hallucination Retrieval-Augmented Generation.
It solves enterprise problems of latency, runaway LLM API costs, and fragile authentication sessions.

2. ARCHITECTURAL LAYERS
- Web Dashboard: Next.js 15 App Router with React 19, Tailwind CSS Obsidian dark theme, TanStack Query v5, and @tanstack/react-virtual for rendering 1,000,000 telemetry records at 60fps with strictly fewer than 60 DOM rows.
- Embeddable Client Widget: Vue.js 3 Composition API with Pinia, Vite, and GSAP 3 animation engine. Features clickable source citation cards with page number and chunk score preview.
- API Gateway: Node.js 20 Express TypeScript service with short-lived JWT access tokens (15m), HTTP-only rotating refresh tokens, and Redis sliding-window rate limiting.
- RAG Microservice: Python 3.11+ FastAPI service with asyncpg, PostgreSQL 16 pgvector, HNSW indexing (m=16, ef_construction=200), and hybrid search.

3. PERFORMANCE BENCHMARKS
- Redis Semantic Cache: Sub-2ms response latency for repeated queries, providing 100% LLM token cost savings.
- Vector Keyset Pagination: Sub-15ms deep pagination on 1,000,000 indexed records using composite B-Tree index (createdAt DESC, id DESC) with zero OFFSET degradation.
- Zero-Data-Loss Interceptor: Axios request queue automatically pauses on 401 Unauthorized, executes POST /api/auth/refresh silently in the background, attaches the new token, and replays all 50 fields of the governance wizard.
""",
    },
    {
        "name": "Karthik_Kathari_Engineering_Profile.pdf",
        "source": "PDF",
        "sha256": "karthik_profile_e5f67890123456789abcdef0123456789abcdef0123456789abcdef01234",
        "content": """
KARTHIK KATHARI — PRINCIPAL AI SYSTEMS ARCHITECT & FULL-STACK ENGINEER
GitHub: github.com/Karthik-Kathari | LinkedIn: linkedin.com/in/karthikkathari
Contact: karthikmk.workspace@gmail.com

PROFESSIONAL SUMMARY:
Karthik Kathari is a Principal Staff Full-Stack AI Engineer specializing in distributed RAG knowledge engines, high-scale PostgreSQL pgvector optimization, Redis caching architectures, and resilient developer tooling.

CORE TECHNICAL SKILLS:
- Frontend: Next.js 15 (App Router, Server Actions, React 19), Vue.js 3 (Composition API, Pinia), Tailwind CSS, GSAP 3 Animation Platform, DOM Virtualization (@tanstack/react-virtual).
- Backend & Microservices: Node.js 20+, Express.js, TypeScript 5, Python 3.11+, FastAPI, Uvicorn, asyncpg, Pydantic v2.
- Data & Vector Storage: PostgreSQL 16, pgvector, HNSW indexing, tsvector full-text search, Redis 7 (Lua scripting, semantic caching, sliding-window rate limiting).
- DevOps & CI/CD: Docker, Turborepo monorepo management, GitHub Actions, Vercel, Render, Neon Serverless Postgres, Upstash Redis.

KEY ACHIEVEMENTS:
- Architected and shipped VectraBase AI end-to-end, featuring a 1M-record virtualized telemetry explorer and live EXPLAIN ANALYZE proof.
- Designed dual-layer form resilience preserving complex 50-field governance configurations across silent JWT rotation.
""",
    },
]


async def seed():
    logger.info("Connecting to PostgreSQL at %s ...", settings.database_url)
    pool = await asyncpg.create_pool(dsn=settings.database_url, min_size=1, max_size=5)

    async with pool.acquire() as conn:
        # Ensure extensions
        await conn.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        await conn.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")

        # Ensure Demo Tenant
        await conn.execute(
            """
            INSERT INTO "Tenant" (id, name, slug, plan, "updatedAt")
            VALUES ($1::uuid, 'VectraBase Demo & Architecture Sandbox', 'vectrabase-demo', 'ENTERPRISE', NOW())
            ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, "updatedAt" = NOW();
            """,
            DEMO_TENANT_ID,
        )

        for doc_info in DOCUMENTS:
            logger.info("Processing document: %s", doc_info["name"])

            # Insert or get document
            doc_row = await conn.fetchrow(
                """
                INSERT INTO "Document" (
                    id, "tenantId", name, "originalFilename", "mimeType",
                    "sha256Hash", status, source, "fileSizeBytes", "updatedAt"
                )
                VALUES (
                    gen_random_uuid(), $1::uuid, $2, $2, 'application/pdf',
                    $3, 'PROCESSING', 'PDF', $4, NOW()
                )
                ON CONFLICT ("sha256Hash") DO UPDATE SET "updatedAt" = NOW()
                RETURNING id;
                """,
                DEMO_TENANT_ID,
                doc_info["name"],
                doc_info["sha256"],
                len(doc_info["content"].encode("utf-8")),
            )
            doc_id = str(doc_row["id"])

            # Delete any existing chunks for idempotency
            await conn.execute('DELETE FROM "DocumentChunk" WHERE "documentId" = $1::uuid;', doc_id)

            # Chunk document
            chunks = chunk_text(doc_info["content"], chunk_size=settings.chunk_size, overlap=settings.chunk_overlap)
            logger.info("Created %d chunks. Generating embeddings...", len(chunks))

            texts = [c["content"] for c in chunks]
            embeddings = await embed_texts(texts)

            # Store in pgvector
            await store_chunks(pool, doc_id, DEMO_TENANT_ID, chunks, embeddings)

            # Update document to INDEXED
            total_tokens = sum(c.get("token_count", 0) for c in chunks)
            await conn.execute(
                """
                UPDATE "Document"
                SET status = 'INDEXED', "totalChunks" = $1, "totalTokens" = $2, "updatedAt" = NOW()
                WHERE id = $3::uuid;
                """,
                len(chunks),
                total_tokens,
                doc_id,
            )
            logger.info("✓ Document %s INDEXED with %d chunks.", doc_info["name"], len(chunks))

    await pool.close()
    logger.info("🎉 Knowledge base pre-seeding completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
