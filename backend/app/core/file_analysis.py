"""
backend/app/core/file_analysis.py — Fayl tahlili va RAG uchun qayta ishlash
"""
from core.file_reader import read_file  # read_pdf emas, read_file
from core.chunking import chunk_text
from core.embeddings import create_embedding, add_memory


def process_pdf(user_id: str, path: str) -> int:
    """
    PDF/fayl ni o'qib, bo'laklab, vector memory ga saqlash.
    Qaytaradi: saqlangan chunk soni
    """
    text = read_file(path)
    if not text or text.startswith("["):
        return 0

    chunks = chunk_text(text)
    saved = 0

    for chunk in chunks:
        embedding = create_embedding(chunk)
        if embedding:
            add_memory(str(user_id), chunk, embedding)
            saved += 1

    return saved


def process_file(user_id: str, path: str) -> dict:
    """
    Har qanday fayl turini qayta ishlash.
    Qaytaradi: {"chunks": N, "text_preview": "..."}
    """
    text = read_file(path)
    if not text or text.startswith("["):
        return {"chunks": 0, "text_preview": "", "error": text}

    chunks = chunk_text(text)
    saved = 0

    for chunk in chunks:
        embedding = create_embedding(chunk)
        if embedding:
            add_memory(str(user_id), chunk, embedding)
            saved += 1

    return {
        "chunks": saved,
        "text_preview": text[:300] + "..." if len(text) > 300 else text,
    }