"""
backend/app/core/memory_engine.py — Foydalanuvchi xotirasi
"""
import re
from database import save_memory, get_memory as db_get_memory, delete_memory, clear_memory


# ── Asosiy funksiyalar ────────────────────────────────────────

def get_memory(user_id: int) -> dict:
    """Foydalanuvchi xotirasini olish (alias)."""
    return db_get_memory(user_id) or {}


def get_all_memory(user_id: int) -> dict:
    """Barcha xotirani olish."""
    return db_get_memory(user_id) or {}


def get_relevant_memory(user_id: int, query: str = "") -> dict:
    """So'rovga tegishli xotirani olish."""
    memory = db_get_memory(user_id) or {}
    if not query or len(memory) <= 5:
        return memory
    query_lower = query.lower()
    relevant = {}
    for k, v in memory.items():
        if k.lower() in query_lower or any(w in query_lower for w in k.lower().split()):
            relevant[k] = v
    return relevant if relevant else dict(list(memory.items())[:5])


def save_smart_memory(user_id: int, key: str, value: str) -> dict:
    save_memory(user_id, key.strip(), value.strip())
    return {"key": key, "value": value, "saved": True}


def delete_memory_key(user_id: int, key: str):
    delete_memory(user_id, key)


def clear_all_memory(user_id: int):
    clear_memory(user_id)


def auto_extract_from_conversation(user_id: int, user_msg: str, ai_msg: str):
    """Suhbatdan avtomatik ma'lumot ajratib olish."""
    patterns = [
        (r"mening ismim (\w+)",        "ism"),
        (r"men (\d+) yoshdaman",        "yosh"),
        (r"men (\w+)da yashayman",      "shahar"),
        (r"men (\w+) mutaxassisiman",   "kasb"),
        (r"men (\w+)chi bo'laman",      "kasb"),
        (r"sevimli rangim (\w+)",       "sevimli_rang"),
        (r"sevimli (\w+) ovqatim",      "sevimli_taom"),
        (r"my name is (\w+)",           "ism"),
        (r"i am (\d+) years old",       "yosh"),
        (r"i live in (\w+)",            "shahar"),
        (r"i work as (\w+)",            "kasb"),
    ]
    text = user_msg.lower()
    for pattern, key in patterns:
        m = re.search(pattern, text)
        if m:
            save_memory(user_id, key, m.group(1))