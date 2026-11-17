# VectraBase AI — LLM Streaming & Grounded Citation Service
# Author: Karthik Kathari (github.com/Karthik-Kathari)

from __future__ import annotations

import asyncio
import logging
import os
from typing import AsyncGenerator, Any

logger = logging.getLogger("vectrabase.llm")

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

GUARDRAIL_BLOCKED_MESSAGE = (
    "I cannot find sufficient grounded information in the indexed documents "
    "to answer your question reliably. In accordance with VectraBase AI enterprise "
    "governance rules, unverified claims and out-of-scope prompts are refused."
)


def extract_key_sentences(text: str, query: str, max_sentences: int = 3) -> str:
    """Extract most relevant sentences using keyword intersection for local fallback synthesis."""
    sentences = [s.strip() for s in text.replace("\n", " ").split(".") if len(s.strip()) > 15]
    if not sentences:
        return text[:300]

    query_words = set(query.lower().split())
    scored = []
    for s in sentences:
        s_words = set(s.lower().split())
        score = len(query_words.intersection(s_words))
        scored.append((score, s))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = [s for _, s in scored[:max_sentences]]
    return ". ".join(top) + "."


async def stream_rag_response(
    query: str,
    chunks: list[dict[str, Any]],
    model: str = "llama-3.3-70b-versatile",
) -> AsyncGenerator[str, None]:
    """Stream grounded answer token-by-token with multi-tier fallback (Groq -> Gemini -> Local)."""
    # Guardrail Check: if no chunks passed the threshold
    if not chunks:
        yield GUARDRAIL_BLOCKED_MESSAGE
        return

    # Check for adversarial prompt injection attempts
    lower_q = query.lower()
    blocked_patterns = [
        "ignore previous instructions",
        "system prompt",
        "bypass guardrail",
        "dan mode",
        "reveal api key",
    ]
    if any(p in lower_q for p in blocked_patterns):
        yield "[Guardrail Security Violation] Query contains prohibited instructional override patterns. Execution terminated."
        return

    # Deduplicate chunks by content fingerprint to prevent the LLM receiving
    # the same paragraph twice (happens when the same URL is indexed as both
    # http:// and https:// variants, or when chunk boundaries split the same text).
    seen_content: set[str] = set()
    deduped_chunks: list[dict[str, Any]] = []
    for c in chunks:
        # Use first 120 chars as a dedup key — catches exact duplicates and
        # near-duplicates caused by minor chunk-boundary overlap
        fingerprint = c.get("raw_text", "")[:120].strip().lower()
        if fingerprint and fingerprint not in seen_content:
            seen_content.add(fingerprint)
            deduped_chunks.append(c)
    chunks = deduped_chunks

    if not chunks:
        yield GUARDRAIL_BLOCKED_MESSAGE
        return

    # Prepare context string from retrieved chunks
    context_blocks = []
    for i, c in enumerate(chunks, 1):
        doc_name = c.get("document_name", "Document")
        context_blocks.append(f"[Passage {i}]\n{c.get('raw_text', '')}")
    context_text = "\n\n".join(context_blocks)

    system_prompt = (
        "You are VectraBase AI, a knowledgeable and conversational AI assistant.\n"
        "You are given context passages from the user's indexed knowledge base.\n"
        "Your job is to synthesize these passages into one clear, fluent, complete answer.\n\n"
        "STRICT RULES:\n"
        "1. NEVER copy passage labels like '[Passage 1]' into your response.\n"
        "2. NEVER truncate with '...' or leave sentences unfinished.\n"
        "3. NEVER dump raw text verbatim — rephrase everything into natural prose.\n"
        "4. For lists of services/features/products use bullet points with **bold** item names.\n"
        "5. Write conversationally — imagine explaining to a curious colleague.\n"
        "6. Only use information from the provided passages. Do not hallucinate.\n"
        "7. If passages do not contain the answer, say so briefly and honestly."
    )

    user_prompt = f"Context:\n{context_text}\n\nQuestion: {query}\n\nGrounded Answer:"

    # Tier 1: Groq API — strict 9s timeout to prevent UI hangs
    if GROQ_API_KEY:
        try:
            from groq import AsyncGroq
            client = AsyncGroq(api_key=GROQ_API_KEY)

            async def _groq_stream() -> AsyncGenerator[str, None]:
                stream = await client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=0.2,
                    max_tokens=1024,
                    stream=True,
                )
                async for chunk in stream:
                    content = chunk.choices[0].delta.content or ""
                    if content:
                        yield content

            # Collect with a hard 9-second wall-clock timeout
            tokens: list[str] = []
            async def _collect_groq() -> None:
                async for t in _groq_stream():
                    tokens.append(t)

            await asyncio.wait_for(_collect_groq(), timeout=9.0)
            for t in tokens:
                yield t
            return
        except asyncio.TimeoutError:
            logger.warning("Groq timed out after 9s; attempting Gemini fallback.")
        except Exception as e:
            logger.warning("Groq streaming failed (%s); attempting Gemini fallback.", e)

    # Tier 2: Gemini API — strict 9s timeout
    if GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=GEMINI_API_KEY)
            gemini_model = genai.GenerativeModel("gemini-1.5-flash")

            async def _collect_gemini() -> list[str]:
                parts: list[str] = []
                response = await gemini_model.generate_content_async(
                    f"{system_prompt}\n\n{user_prompt}",
                    stream=True,
                )
                async for chunk in response:
                    if chunk.text:
                        parts.append(chunk.text)
                return parts

            gemini_parts = await asyncio.wait_for(_collect_gemini(), timeout=9.0)
            for part in gemini_parts:
                yield part
            return
        except asyncio.TimeoutError:
            logger.warning("Gemini timed out after 9s; using deterministic local fallback.")
        except Exception as e:
            logger.warning("Gemini streaming failed (%s); using deterministic local fallback.", e)

    # Tier 3: Always-On Deterministic Local Extractive Synthesis
    # Guaranteed 100% uptime — fires when both Groq and Gemini are unavailable.
    # Synthesises a clean, natural-language answer from all retrieved chunks
    # without any raw "[Passage X]" labels or ellipsis truncation.
    doc_name = chunks[0].get("document_name", "the knowledge base")

    all_sentences: list[str] = []
    seen_sentences: set[str] = set()
    for c in chunks:
        raw = c.get("raw_text", "")
        best = extract_key_sentences(raw, query, max_sentences=2)
        for s in best.split(". "):
            cleaned_s = s.strip().rstrip(".")
            if len(cleaned_s) > 20 and cleaned_s.lower() not in seen_sentences:
                seen_sentences.add(cleaned_s.lower())
                all_sentences.append(cleaned_s + ".")

    combined = " ".join(all_sentences).strip()
    if not combined:
        combined = chunks[0].get("raw_text", "")[:400].strip()

    synthesis = (
        f"Based on the indexed knowledge base for **{doc_name}**, here is what I found:\n\n"
        f"{combined}"
    )

    # Stream word-by-word with a natural cadence
    words = synthesis.split(" ")
    for word in words:
        yield word + " "
        await asyncio.sleep(0.015)

