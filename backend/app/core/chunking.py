"""
backend/app/core/chunking.py — Matnni bo'laklarga bo'lish (RAG uchun)
"""
from typing import List


def chunk_text(
    text:        str,
    chunk_size:  int = 1000,
    overlap:     int = 100,
) -> List[str]:
    """Matnni bir-biriga o'xshash bo'laklarga bo'lish."""
    if not text.strip():
        return []

    words   = text.split()
    chunks  = []
    start   = 0

    while start < len(words):
        end   = start + chunk_size
        chunk = ' '.join(words[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap

    return [c for c in chunks if c.strip()]


def split_by_sentences(text: str, max_sentences: int = 10) -> List[str]:
    """Gaplar bo'yicha bo'lish."""
    import re
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks    = []
    current   = []

    for sent in sentences:
        current.append(sent)
        if len(current) >= max_sentences:
            chunks.append(' '.join(current))
            current = []

    if current:
        chunks.append(' '.join(current))

    return chunks


def truncate_context(messages: list, max_tokens: int = 6000) -> list:
    """
    Chat tarixini token limitga mos qisqartirish.
    Taxminiy: 1 token ≈ 4 belgi.
    """
    total   = 0
    result  = []

    for msg in reversed(messages):
        length = len(msg.get('content', '')) // 4
        if total + length > max_tokens:
            break
        result.insert(0, msg)
        total += length

    return result