# VectraBase AI — RAG Engine
# Author: Karthik Kathari (github.com/Karthik-Kathari)

from __future__ import annotations

import asyncio
import hashlib
import logging
import math
from typing import List, Optional

import numpy as np

from config import get_settings

logger = logging.getLogger("vectrabase.embedder")

settings = get_settings()

EMBED_DIM = 1536  # target dimension for all embedding strategies

# ---------------------------------------------------------------------------
# Local TF-IDF + SVD fallback (always available, no API key required)
# ---------------------------------------------------------------------------

_local_tfidf = None
_local_svd = None
_local_lock = asyncio.Lock()

_COMMON_ENGLISH_CORPUS = [
    "the quick brown fox jumps over the lazy dog",
    "artificial intelligence machine learning deep learning neural network",
    "data science analytics python programming software engineering",
    "natural language processing text retrieval information extraction",
    "vector database embedding similarity search cosine distance",
    "knowledge base documentation technical writing engineering",
    "retrieval augmented generation context grounding hallucination",
    "fastapi uvicorn pydantic asyncpg postgresql pgvector redis",
    "next.js react typescript javascript frontend backend fullstack",
    "cloud computing distributed systems microservices api gateway",
    "security authentication authorization jwt oauth rbac",
    "performance optimization caching latency throughput scalability",
    "user experience design interface responsive mobile desktop",
    "open source community contribution github version control",
    "testing quality assurance debugging monitoring observability",
]


async def _ensure_local_model(texts: List[str]) -> None:
    """Fit TF-IDF + TruncatedSVD on first call, reuse thereafter."""
    global _local_tfidf, _local_svd

    async with _local_lock:
        if _local_tfidf is not None:
            return

        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.decomposition import TruncatedSVD

        logger.info("Fitting local TF-IDF + SVD embedding model …")
        corpus = _COMMON_ENGLISH_CORPUS + texts
        tfidf = TfidfVectorizer(
            max_features=min(50_000, max(10_000, len(corpus) * 10)),
            sublinear_tf=True,
            ngram_range=(1, 2),
            min_df=1,
            strip_accents="unicode",
        )
        tfidf.fit(corpus)

        # TruncatedSVD cannot exceed n_features
        n_components = min(EMBED_DIM, len(tfidf.vocabulary_) - 1)
        svd = TruncatedSVD(n_components=n_components, random_state=42, n_iter=5)
        svd.fit(tfidf.transform(corpus))

        _local_tfidf = tfidf
        _local_svd = svd
        logger.info(
            "Local embedding model ready (TF-IDF vocab=%d, SVD dims=%d).",
            len(tfidf.vocabulary_),
            n_components,
        )


def _local_embed(texts: List[str]) -> List[List[float]]:
    """Generate deterministic local embeddings using fitted TF-IDF + SVD."""
    assert _local_tfidf is not None and _local_svd is not None

    tfidf_matrix = _local_tfidf.transform(texts)
    reduced = _local_svd.transform(tfidf_matrix)  # shape: (n, n_components)

    # Pad or truncate to exactly EMBED_DIM dimensions
    n_rows, n_cols = reduced.shape
    if n_cols < EMBED_DIM:
        pad = np.zeros((n_rows, EMBED_DIM - n_cols), dtype=np.float32)
        reduced = np.hstack([reduced, pad])
    else:
        reduced = reduced[:, :EMBED_DIM]

    # L2-normalise each vector
    norms = np.linalg.norm(reduced, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1.0, norms)
    reduced = reduced / norms

    return reduced.tolist()


# ---------------------------------------------------------------------------
# Groq embedding
# ---------------------------------------------------------------------------

async def _embed_groq(texts: List[str]) -> Optional[List[List[float]]]:
    """Call the Groq embedding endpoint. Returns None on failure."""
    if not settings.groq_api_key or settings.groq_api_key.startswith("your_"):
        return None

    import httpx

    url = "https://api.groq.com/openai/v1/embeddings"
    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.embed_model,
        "input": texts,
        "encoding_format": "float",
    }

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(60.0)) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()

        embeddings = [item["embedding"] for item in data["data"]]
        # Pad/truncate to EMBED_DIM
        result = []
        for emb in embeddings:
            if len(emb) < EMBED_DIM:
                emb = emb + [0.0] * (EMBED_DIM - len(emb))
            elif len(emb) > EMBED_DIM:
                emb = emb[:EMBED_DIM]
            result.append(emb)
        logger.info("Groq embedded %d texts.", len(texts))
        return result

    except Exception as exc:
        logger.warning("Groq embedding failed: %s — will try next provider.", exc)
        return None


# ---------------------------------------------------------------------------
# Gemini embedding
# ---------------------------------------------------------------------------

async def _embed_gemini(texts: List[str]) -> Optional[List[List[float]]]:
    """Call the Google Gemini embedding API. Returns None on failure."""
    if not settings.gemini_api_key or settings.gemini_api_key.startswith("your_"):
        return None

    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.gemini_api_key)

        embeddings: List[List[float]] = []
        for text in texts:
            result = await asyncio.to_thread(
                genai.embed_content,
                model="models/text-embedding-004",
                content=text,
                task_type="retrieval_document",
            )
            emb = result["embedding"]
            # Pad/truncate to EMBED_DIM
            if len(emb) < EMBED_DIM:
                emb = emb + [0.0] * (EMBED_DIM - len(emb))
            elif len(emb) > EMBED_DIM:
                emb = emb[:EMBED_DIM]
            embeddings.append(emb)

        logger.info("Gemini embedded %d texts.", len(texts))
        return embeddings

    except Exception as exc:
        logger.warning("Gemini embedding failed: %s — will use local fallback.", exc)
        return None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def embed_texts(texts: List[str]) -> List[List[float]]:
    """Embed a list of texts using a layered fallback strategy.

    Priority:
    1. Groq API  (if ``GROQ_API_KEY`` is set and valid)
    2. Gemini API (if ``GEMINI_API_KEY`` is set and valid)
    3. Local TF-IDF + TruncatedSVD (always works, deterministic)

    All paths return exactly ``EMBED_DIM``-dimensional float vectors.
    """
    if not texts:
        return []

    # Strategy 1: Groq
    result = await _embed_groq(texts)
    if result is not None:
        return result

    # Strategy 2: Gemini
    result = await _embed_gemini(texts)
    if result is not None:
        return result

    # Strategy 3: Local
    logger.info("Using local TF-IDF + SVD embeddings for %d texts.", len(texts))
    await _ensure_local_model(texts)
    return await asyncio.to_thread(_local_embed, texts)


async def embed_query(query: str) -> List[float]:
    """Embed a single query string.

    Uses the same layered fallback as :func:`embed_texts` but handles the
    single-item case efficiently.
    """
    results = await embed_texts([query])
    return results[0]
