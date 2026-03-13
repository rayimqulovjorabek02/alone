"""
backend/app/core/vector_store.py — Vector memory (SQLite)
"""
import sqlite3
import json
from config import DB_PATH


def _get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_vector_db():
    with _get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS vector_memory (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id   TEXT    NOT NULL,
                message   TEXT    NOT NULL,
                embedding TEXT    NOT NULL
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_vm_user ON vector_memory(user_id)")
        conn.commit()


def add_memory(user_id: str, message: str, embedding: list):
    if embedding is None:
        return
    try:
        init_vector_db()
        with _get_conn() as conn:
            conn.execute(
                "INSERT INTO vector_memory (user_id, message, embedding) VALUES (?,?,?)",
                (str(user_id), message, json.dumps(embedding))
            )
            conn.commit()
    except Exception as e:
        print(f"[VectorStore] add_memory xato: {e}")


def cosine_similarity(a, b) -> float:
    dot    = sum(x * y for x, y in zip(a, b))
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(x * x for x in b) ** 0.5
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def search_memory(user_id: str, embedding: list, limit: int = 5) -> list[str]:
    if embedding is None:
        return []
    try:
        init_vector_db()
        with _get_conn() as conn:
            rows = conn.execute(
                "SELECT message, embedding FROM vector_memory WHERE user_id=?",
                (str(user_id),)
            ).fetchall()

        scored = []
        for row in rows:
            try:
                emb   = json.loads(row["embedding"])
                score = cosine_similarity(embedding, emb)
                scored.append((score, row["message"]))
            except Exception:
                pass

        scored.sort(reverse=True)
        return [msg for _, msg in scored[:limit]]
    except Exception as e:
        print(f"[VectorStore] search_memory xato: {e}")
        return []