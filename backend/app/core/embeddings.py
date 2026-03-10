"""
backend/app/core/embeddings.py — Matn vektorlari (RAG uchun)
"""
import os
import httpx

HF_KEY = os.getenv("HUGGINGFACE_API_KEY", "")
EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


async def get_embeddings(texts: list[str]) -> list[list[float]] | None:
    """HuggingFace orqali matn embeddinglarini olish."""
    if not HF_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(
                f"https://router.huggingface.co/hf-inference/models/{EMBED_MODEL}",
                headers={"Authorization": f"Bearer {HF_KEY}"},
                json={"inputs": texts},
            )
            if r.status_code == 200:
                return r.json()
    except Exception as e:
        print(f"Embedding xato: {e}")
    return None


def cosine_similarity(v1: list[float], v2: list[float]) -> float:
    """Ikki vektorning o'xshashligini hisoblash."""
    dot   = sum(a * b for a, b in zip(v1, v2))
    norm1 = sum(a ** 2 for a in v1) ** 0.5
    norm2 = sum(b ** 2 for b in v2) ** 0.5
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)