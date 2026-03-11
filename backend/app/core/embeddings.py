"""
backend/app/core/embeddings.py — Matn vektorlari (RAG uchun)
"""
import os
import httpx

HF_KEY      = os.getenv("HUGGINGFACE_API_KEY", "")
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


# ── Sync aliaslar — smart_ai.py uchun moslik ─────────────────

def create_embedding(text: str) -> list[float] | None:
    """
    Bitta matn uchun embedding olish (sync).
    smart_ai.py da ishlatiladi.
    """
    import asyncio
    try:
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop and loop.is_running():
            return None  # async context da ishlamaydi

        result = asyncio.run(get_embeddings([text]))
        if result and isinstance(result, list) and len(result) > 0:
            return result[0]
    except Exception as e:
        print(f"create_embedding xato: {e}")
    return None


# ── Vector store aliaslar — smart_ai.py uchun moslik ─────────
# Haqiqiy vector store yo'q bo'lsa, bu stub funksiyalar ishlatiladi

_memory_store: dict = {}  # { user_id: [(embedding, text)] }


def add_memory(user_id: str, text: str, embedding: list[float] | None):
    """Xotirani saqlash."""
    if embedding is None:
        return
    if user_id not in _memory_store:
        _memory_store[user_id] = []
    _memory_store[user_id].append((embedding, text))
    # Maksimal 100 ta xotira
    if len(_memory_store[user_id]) > 100:
        _memory_store[user_id] = _memory_store[user_id][-100:]


def search_memory(user_id: str, embedding: list[float] | None, top_k: int = 3) -> list[str]:
    """Eng o'xshash xotiralarni topish."""
    if embedding is None or user_id not in _memory_store:
        return []
    memories = _memory_store.get(user_id, [])
    if not memories:
        return []
    scored = []
    for emb, text in memories:
        score = cosine_similarity(embedding, emb)
        scored.append((score, text))
    scored.sort(reverse=True)
    return [text for _, text in scored[:top_k]]