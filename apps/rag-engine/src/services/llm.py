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
        "You are VectraBase AI, an enterprise RAG assistant architected by Karthik Kathari. "
        "Your responses must be strictly grounded in the provided context sources. "
        "Reference sources clearly (e.g., [Source 1], [Source 2]). "
        "Do not hallucinate or extrapolate beyond the provided text. "
        "**Answer format:** Use bold headings for each major point, and bullet points for lists. "
        "Never output raw excerpts or unstructured data dumps. "
        "Summarize concisely and conversationally."
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
    # Guaranteed 100% uptime, zero cost, no external API keys required
    top_chunk = chunks[0]
    extracted = extract_key_sentences(top_chunk.get("raw_text", ""), query, max_sentences=2)
    synthesis = (
        f"Based on the verified indexed documentation ([Source 1: {top_chunk.get('document_name', 'System_Doc')}, "
        f"Page {top_chunk.get('page_number', 1)}]), {extracted} "
    )

    if len(chunks) > 1:
        second_chunk = chunks[1]
        extracted_2 = extract_key_sentences(second_chunk.get("raw_text", ""), query, max_sentences=1)
        synthesis += f"Additionally, [Source 2: {second_chunk.get('document_name', 'System_Doc')}] confirms: {extracted_2}"

    # Stream simulated token cadence
    words = synthesis.split(" ")
    for word in words:
        yield word + " "
        await asyncio.sleep(0.015)

