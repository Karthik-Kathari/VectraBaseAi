# VectraBase AI — RAG Engine
# Author: Karthik Kathari (github.com/Karthik-Kathari)

from __future__ import annotations

import logging
import re
from typing import List, Optional

logger = logging.getLogger("vectrabase.chunker")

# Lazy-import tiktoken so the module can be imported even if tiktoken isn't
# installed (the embedder falls back to local TF-IDF anyway).
_tiktoken_enc = None


def _get_encoder():
    global _tiktoken_enc
    if _tiktoken_enc is None:
        import tiktoken
        _tiktoken_enc = tiktoken.get_encoding("cl100k_base")
    return _tiktoken_enc


def _count_tokens(text: str) -> int:
    """Return the number of tokens in *text* using cl100k_base."""
    try:
        enc = _get_encoder()
        return len(enc.encode(text))
    except Exception:
        # Rough fallback: 1 token ≈ 4 chars
        return max(1, len(text) // 4)


# ---------------------------------------------------------------------------
# Sentence / paragraph splitters
# ---------------------------------------------------------------------------

_SENTENCE_END = re.compile(
    r"(?<=[.!?…])\s+(?=[A-Z\"\'(])"  # sentence boundary heuristic
)

_PARAGRAPH_SEP = re.compile(r"\n{2,}")


def _split_into_sentences(text: str) -> List[str]:
    """Split *text* into individual sentences respecting abbreviations."""
    sentences = _SENTENCE_END.split(text)
    result: List[str] = []
    for s in sentences:
        s = s.strip()
        if s:
            result.append(s)
    return result or [text]


def _split_into_paragraphs(text: str) -> List[str]:
    """Split *text* into paragraphs (double-newline separated)."""
    paras = _PARAGRAPH_SEP.split(text)
    return [p.strip() for p in paras if p.strip()]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def chunk_text(
    text: str,
    chunk_size: int = 512,
    overlap: int = 64,
    page_number: Optional[int] = None,
) -> List[dict]:
    """Chunk *text* into token-bounded segments with overlap.

    Strategy:
    1. Split into paragraphs.
    2. Within each paragraph, split into sentences.
    3. Accumulate sentences into chunks up to *chunk_size* tokens.
    4. When a chunk is closed, back-track *overlap* tokens from the boundary
       and seed the next chunk with those tokens (sliding window).

    Returns:
        List of dicts with keys:
        - ``content``      : chunk text
        - ``chunk_index``  : 0-based index
        - ``token_count``  : number of tokens
        - ``page_number``  : forwarded from the caller (may be None)
    """
    if not text or not text.strip():
        return []

    # Collect all sentence units across paragraphs
    units: List[str] = []
    for para in _split_into_paragraphs(text):
        sentences = _split_into_sentences(para)
        units.extend(sentences)
        units.append("")  # paragraph boundary marker

    chunks: List[dict] = []
    current_units: List[str] = []
    current_tokens: int = 0
    chunk_index: int = 0

    def _flush(carry_units: List[str]) -> List[str]:
        """Emit the current chunk and return carry-over units for overlap."""
        nonlocal chunk_index

        content = " ".join(u for u in current_units if u)
        if not content.strip():
            return carry_units

        tc = _count_tokens(content)
        chunks.append(
            {
                "content": content,
                "chunk_index": chunk_index,
                "token_count": tc,
                "page_number": page_number,
            }
        )
        chunk_index += 1

        # Build overlap carry-over: take trailing units totalling ≤ overlap tokens
        overlap_units: List[str] = []
        overlap_tokens = 0
        for unit in reversed(current_units):
            if not unit:
                continue
            t = _count_tokens(unit)
            if overlap_tokens + t <= overlap:
                overlap_units.insert(0, unit)
                overlap_tokens += t
            else:
                break
        return overlap_units

    carry: List[str] = []

    for unit in units:
        if unit == "":
            # Paragraph boundary — flush if we have enough content
            if current_tokens >= chunk_size // 2:
                carry = _flush(carry)
                current_units = list(carry)
                current_tokens = _count_tokens(" ".join(current_units))
            continue

        unit_tokens = _count_tokens(unit)

        if unit_tokens > chunk_size:
            # Single sentence exceeds chunk_size — split by words
            words = unit.split()
            word_buffer: List[str] = []
            word_tokens = 0
            for word in words:
                wt = _count_tokens(word)
                if word_tokens + wt > chunk_size and word_buffer:
                    # Flush word buffer as a chunk
                    sub_content = " ".join(word_buffer)
                    chunks.append(
                        {
                            "content": sub_content,
                            "chunk_index": chunk_index,
                            "token_count": _count_tokens(sub_content),
                            "page_number": page_number,
                        }
                    )
                    chunk_index += 1
                    # Overlap: keep last few words
                    keep = max(0, len(word_buffer) - max(1, overlap // 4))
                    word_buffer = word_buffer[keep:]
                    word_tokens = _count_tokens(" ".join(word_buffer))
                word_buffer.append(word)
                word_tokens += wt
            if word_buffer:
                current_units.extend(word_buffer)
                current_tokens += word_tokens
            continue

        if current_tokens + unit_tokens > chunk_size and current_units:
            carry = _flush(carry)
            current_units = list(carry)
            current_tokens = _count_tokens(" ".join(cu for cu in current_units if cu))

        current_units.append(unit)
        current_tokens += unit_tokens

    # Flush any remaining content
    if any(u for u in current_units if u):
        _flush(carry)

    return chunks


def chunk_pages(
    pages: List[tuple],  # list of (page_number, text)
    chunk_size: int = 512,
    overlap: int = 64,
) -> List[dict]:
    """Chunk a multi-page document, preserving page number provenance.

    Args:
        pages: List of ``(page_number, text)`` tuples as returned by
               ``extractor.extract_pdf``.
        chunk_size: Target token count per chunk.
        overlap: Token overlap between adjacent chunks.

    Returns:
        Flat list of chunk dicts with ``page_number`` set.
    """
    all_chunks: List[dict] = []
    running_index = 0

    for page_number, text in pages:
        page_chunks = chunk_text(
            text, chunk_size=chunk_size, overlap=overlap, page_number=page_number
        )
        for c in page_chunks:
            c["chunk_index"] = running_index
            running_index += 1
        all_chunks.extend(page_chunks)

    return all_chunks
