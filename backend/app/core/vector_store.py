"""
core/vector_store.py
AI vector memory storage
"""

import sqlite3
import json
from pathlib import Path

DB_PATH = Path("data/vector_memory.db")


# =========================
# DB INIT
# =========================

def init_vector_db():

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        message TEXT,
        embedding TEXT
    )
    """)

    conn.commit()
    conn.close()


# =========================
# ADD MEMORY
# =========================

def add_memory(user_id: str, message: str, embedding: list):

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO memory (user_id, message, embedding) VALUES (?, ?, ?)",
        (user_id, message, json.dumps(embedding))
    )

    conn.commit()
    conn.close()


# =========================
# COSINE SIMILARITY
# =========================

def cosine_similarity(a, b):

    dot = sum(x*y for x, y in zip(a, b))
    norm_a = sum(x*x for x in a) ** 0.5
    norm_b = sum(x*x for x in b) ** 0.5

    if norm_a == 0 or norm_b == 0:
        return 0

    return dot / (norm_a * norm_b)


# =========================
# SEARCH MEMORY
# =========================

def search_memory(user_id: str, embedding: list, limit: int = 5):

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute(
        "SELECT message, embedding FROM memory WHERE user_id=?",
        (user_id,)
    )

    rows = cur.fetchall()
    conn.close()

    scored = []

    for message, emb in rows:

        emb = json.loads(emb)

        score = cosine_similarity(embedding, emb)

        scored.append((score, message))

    scored.sort(reverse=True)

    results = [msg for _, msg in scored[:limit]]

    return results