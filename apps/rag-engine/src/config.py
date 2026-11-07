# VectraBase AI — RAG Engine
# Author: Karthik Kathari (github.com/Karthik-Kathari)

from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ------------------------------------------------------------------ DB
    database_url: str = Field(
        default="postgresql://vectrabase:vectrabase_secret@localhost:5432/vectrabase_db",
        description="asyncpg-compatible PostgreSQL connection string.",
    )

    # ------------------------------------------------------------------ LLM / Embed
    groq_api_key: str = Field(default="", description="Groq API key (optional).")
    gemini_api_key: str = Field(default="", description="Google Gemini API key (optional).")
    embed_model: str = Field(default="nomic-embed-text", description="Embedding model name.")
    llm_model: str = Field(
        default="llama-3.3-70b-versatile", description="Primary LLM model (Groq)."
    )

    # ------------------------------------------------------------------ RAG tuning
    similarity_threshold: float = Field(
        default=0.72, ge=0.0, le=1.0, description="Minimum cosine similarity to include a chunk."
    )
    top_k_results: int = Field(
        default=5, ge=1, le=50, description="Maximum chunks returned per query."
    )
    chunk_size: int = Field(
        default=512, ge=64, le=4096, description="Target token count per chunk."
    )
    chunk_overlap: int = Field(
        default=64, ge=0, le=512, description="Token overlap between adjacent chunks."
    )

    # ------------------------------------------------------------------ Server
    port: int = Field(default=8000, description="Port the Uvicorn server listens on.")
    cors_origins: str = Field(
        default="*",
        description="Comma-separated list of allowed CORS origins, or '*' for all.",
    )

    # ------------------------------------------------------------------ Storage
    uploads_dir: str = Field(
        default="./uploads", description="Directory where uploaded files are stored."
    )

    # ------------------------------------------------------------------ Embedding dims
    embedding_dim: int = Field(
        default=1536, description="Vector dimension output by the embedding service."
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached settings singleton."""
    return Settings()
