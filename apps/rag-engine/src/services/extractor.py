# VectraBase AI — RAG Engine
# Author: Karthik Kathari (github.com/Karthik-Kathari)

from __future__ import annotations

import logging
import re
from typing import List, Tuple

import chardet
import httpx

try:
    import trafilatura
    _HAS_TRAFILATURA = True
except ImportError:  # pragma: no cover
    _HAS_TRAFILATURA = False

from bs4 import BeautifulSoup

logger = logging.getLogger("vectrabase.extractor")

# ---------------------------------------------------------------------------
# PDF extraction
# ---------------------------------------------------------------------------

def extract_pdf(file_path: str) -> List[Tuple[int, str]]:
    """Extract text per page from a PDF using PyMuPDF.

    Returns:
        List of ``(page_number, text)`` tuples (1-indexed page numbers).
    """
    try:
        import fitz  # PyMuPDF

        pages: List[Tuple[int, str]] = []
        with fitz.open(file_path) as doc:
            for page_num, page in enumerate(doc, start=1):
                text = page.get_text("text")  # type: ignore[attr-defined]
                cleaned = _clean_text(text)
                if cleaned.strip():
                    pages.append((page_num, cleaned))

        logger.info("Extracted %d non-empty pages from '%s'.", len(pages), file_path)
        return pages

    except Exception as exc:
        logger.exception("Failed to extract PDF '%s': %s", file_path, exc)
        raise


# ---------------------------------------------------------------------------
# Markdown extraction
# ---------------------------------------------------------------------------

_MD_CODE_FENCE = re.compile(r"```[\s\S]*?```", re.MULTILINE)
_MD_INLINE_CODE = re.compile(r"`[^`\n]+`")
_MD_HEADING = re.compile(r"^#{1,6}\s+", re.MULTILINE)
_MD_BOLD_ITALIC = re.compile(r"(\*{1,3}|_{1,3})(.*?)\1", re.DOTALL)
_MD_LINK = re.compile(r"!?\[([^\]]*)\]\([^)]*\)")
_MD_IMAGE = re.compile(r"!\[[^\]]*\]\([^)]*\)")
_MD_HR = re.compile(r"^\s*[-*_]{3,}\s*$", re.MULTILINE)
_MD_BLOCKQUOTE = re.compile(r"^>\s*", re.MULTILINE)
_MD_TABLE_ROW = re.compile(r"^\|.*\|$", re.MULTILINE)
_MD_TABLE_SEP = re.compile(r"^\|[-| :]+\|$", re.MULTILINE)
_MD_HTML_TAG = re.compile(r"<[^>]+>")


def extract_markdown(content: str) -> str:
    """Strip Markdown syntax and return clean plain text."""
    text = content
    text = _MD_CODE_FENCE.sub(" ", text)
    text = _MD_INLINE_CODE.sub(" ", text)
    text = _MD_IMAGE.sub("", text)
    text = _MD_LINK.sub(r"\1", text)
    text = _MD_BOLD_ITALIC.sub(r"\2", text)
    text = _MD_HEADING.sub("", text)
    text = _MD_HR.sub("", text)
    text = _MD_BLOCKQUOTE.sub("", text)
    text = _MD_TABLE_SEP.sub("", text)
    text = _MD_TABLE_ROW.sub(lambda m: m.group(0).replace("|", " "), text)
    text = _MD_HTML_TAG.sub("", text)
    return _clean_text(text)


# ---------------------------------------------------------------------------
# URL extraction
# ---------------------------------------------------------------------------

_NOISE_TAGS = {
    "nav", "footer", "header", "aside", "script", "style", "noscript",
    "iframe", "form", "button", "input", "select", "textarea", "meta",
    "link", "head", "advertisement", "ads",
}

_CONTENT_TAGS = ["article", "main", "section", "div", "body"]


async def extract_url(url: str) -> str:
    """Fetch a URL and extract main readable content.

    Extraction strategy (in priority order):
    1. ``trafilatura`` — purpose-built boilerplate remover, best accuracy.
    2. ``BeautifulSoup4`` — structured tag-based fallback.

    Both paths strip navigation, footers, scripts, styles and other noise.
    Raises ``ValueError`` when the extracted content is too short to be useful
    (e.g. JS-rendered SPA, login wall, or empty page).
    """
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (compatible; VectraBase-Indexer/1.0; "
            "+https://github.com/Karthik-Kathari/VectraBaseAi)"
        ),
        "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }
    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=httpx.Timeout(30.0),
            headers=headers,
        ) as client:
            response = await client.get(url)
            response.raise_for_status()
            html = response.text

    except httpx.TimeoutException:
        logger.warning("Timeout fetching URL '%s'.", url)
        raise ValueError(f"Timed out fetching {url}")
    except httpx.HTTPStatusError as exc:
        logger.warning("HTTP %s fetching URL '%s'.", exc.response.status_code, url)
        raise ValueError(f"HTTP {exc.response.status_code} fetching {url}")
    except Exception as exc:
        logger.exception("Error fetching URL '%s': %s", url, exc)
        raise ValueError(f"Could not fetch {url}: {exc}")

    # ── Strategy 1: trafilatura (best boilerplate removal) ──────────────────
    text: str | None = None
    if _HAS_TRAFILATURA:
        try:
            extracted = trafilatura.extract(
                html,
                include_comments=False,
                include_tables=True,
                no_fallback=False,
                favor_recall=True,
            )
            if extracted and len(extracted.strip()) >= 100:
                text = extracted
                logger.info("trafilatura extracted %d chars from '%s'.", len(text), url)
        except Exception as exc:  # noqa: BLE001
            logger.warning("trafilatura failed for '%s': %s", url, exc)

    # ── Strategy 2: BeautifulSoup4 fallback ─────────────────────────────────
    if not text:
        soup = BeautifulSoup(html, "lxml")

        # Remove noise elements
        for tag in soup.find_all(_NOISE_TAGS):
            tag.decompose()

        # Remove elements with noise class/id hints
        for element in soup.find_all(True):
            cls = " ".join(element.get("class", []))
            eid = element.get("id", "")
            noise_hints = {
                "nav", "menu", "sidebar", "footer", "header",
                "ad", "banner", "cookie", "popup", "modal",
                "overlay", "social", "share", "comment", "widget",
            }
            if any(hint in cls.lower() or hint in eid.lower() for hint in noise_hints):
                element.decompose()

        # Try to find the primary content container
        main_content = None
        for tag_name in _CONTENT_TAGS:
            candidates = soup.find_all(tag_name)
            if candidates:
                main_content = max(candidates, key=lambda t: len(t.get_text()))
                break

        if main_content is None:
            main_content = soup

        raw = main_content.get_text(separator="\n")
        cleaned = _clean_text(raw)
        if len(cleaned.strip()) >= 100:
            text = cleaned
            logger.info("BeautifulSoup extracted %d chars from '%s'.", len(text), url)

    # ── Guard: refuse to store placeholder-length content ───────────────────
    if not text or len(text.strip()) < 100:
        raise ValueError(
            f"Could not extract meaningful content from {url}. "
            "The page may be JavaScript-rendered, login-gated, or mostly images. "
            "Try a direct link to a documentation or article page."
        )

    return _clean_text(text)


# ---------------------------------------------------------------------------
# Plain text extraction
# ---------------------------------------------------------------------------

def extract_text_file(content: str | bytes) -> str:
    """Return plain text, handling encoding detection for bytes input."""
    if isinstance(content, bytes):
        detected = chardet.detect(content)
        encoding = detected.get("encoding") or "utf-8"
        try:
            text = content.decode(encoding)
        except (UnicodeDecodeError, LookupError):
            text = content.decode("utf-8", errors="replace")
    else:
        text = content
    return _clean_text(text)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _clean_text(text: str) -> str:
    """Normalise whitespace and remove control characters."""
    # Replace multiple blank lines with a single blank line
    text = re.sub(r"\r\n", "\n", text)
    text = re.sub(r"\r", "\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Strip control characters except newline/tab
    text = re.sub(r"[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]", "", text)
    return text.strip()
