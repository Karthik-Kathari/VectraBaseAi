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

    # Prepare context string from retrieved chunks
    context_blocks = []
    for i, c in enumerate(chunks, 1):
        doc_name = c.get("document_name", "Document")
        page = c.get("page_number", 1)
        score = c.get("similarity", 0.0)
        context_blocks.append(
            f"--- [Source {i}: {doc_name} (Page {page}, Confidence: {score:.2f})] ---\n{c.get('raw_text', '')}"
        )
    context_text = "\n\n".join(context_blocks)

    system_prompt = (
        "You are VectraBase AI, a knowledgeable and conversational AI assistant. "
        "You will be given several context passages retrieved from the user's knowledge base. "
        "Your job is to read ALL of the passages and synthesize a single, fluent, well-structured answer. "
        "\n\n"
        "STRICT RULES — you must follow every one of these:\n"
        "1. NEVER output raw passage labels like '[Passage 1]', '[Source 1]', '[Chunk X]', or any similar label.\n"
        "2. NEVER truncate sentences with '...' or cut off mid-thought.\n"
        "3. NEVER dump raw database text verbatim — always rephrase into natural prose.\n"
        "4. If listing multiple services, features, or items, use bullet points with **bold** names.\n"
        "5. Write in a helpful, conversational tone — as if explaining to a smart colleague.\n"
        "6. Ground every claim in the provided context. Do not hallucinate or add information not in the passages.\n"
        "7. If the context does not contain enough information to answer, say so honestly and briefly."
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

    # Collect the most relevant sentences from every chunk
    all_sentences: list[str] = []
    for c in chunks:
        raw = c.get("raw_text", "")
        best = extract_key_sentences(raw, query, max_sentences=2)
        if best.strip():
            all_sentences.append(best.strip())

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

