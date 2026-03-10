"""
backend/app/core/vector_store.py — Sodda in-memory vektor saqlash
"""
from typing import List
from core.embeddings import cosine_similarity


class VectorStore:
    """
    Sodda in-memory vektor saqlash.
    Ishlab chiqarish uchun ChromaDB yoki Pinecone ishlatiladi.
    """

    def __init__(self):
        self._items: List[dict] = []

    def add(self, text: str, metadata: dict, embedding: list[float]):
        self._items.append({
            "text":      text,
            "metadata":  metadata,
            "embedding": embedding,
        })

    def search(self, query_embedding: list[float], top_k: int = 5) -> List[dict]:
        if not self._items:
            return []

        scored = []
        for item in self._items:
            score = cosine_similarity(query_embedding, item["embedding"])
            scored.append({**item, "score": score})

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

    def clear(self):
        self._items.clear()

    def __len__(self):
        return len(self._items)


# Global store
_store = VectorStore()

def get_store() -> VectorStore:
    return _store