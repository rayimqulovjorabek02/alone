"""
backend/app/core/cache.py
In-memory cache tizimi

Ikki xil cache:
  1. AI javoblar cache (get_cache / save_cache) — xuddi shu savol qayta berilsa tez javob
  2. DB cache (settings, memory) — DB ga har safar murojaat qilmaslik
"""

import time
import hashlib
from database import get_settings as db_get_settings
from database import get_memory as db_get_memory


# ── AI Javoblar Cache ─────────────────────────────────────────

# { hash: {"answer": str, "expires": float} }
_ai_cache: dict = {}

AI_CACHE_TTL = 3600  # 1 soat (sekundda)
AI_CACHE_MAX = 500   # Maksimal yozuvlar soni


def _hash(text: str) -> str:
    return hashlib.md5(text.strip().lower().encode()).hexdigest()


def get_cache(message: str) -> str | None:
    """
    Xuddi shu savol avval berilganmi?
    Ha bo'lsa — saqlangan javobni qaytaradi.
    Yo'q bo'lsa — None qaytaradi.
    """
    key  = _hash(message)
    item = _ai_cache.get(key)

    if item is None:
        return None

    # Muddati o'tganmi?
    if time.time() > item["expires"]:
        del _ai_cache[key]
        return None

    return item["answer"]


def save_cache(message: str, answer: str):
    """AI javobini cache ga saqlash."""
    if not message or not answer:
        return

    # Cache to'lib ketsa — eng eskilarini o'chirish
    if len(_ai_cache) >= AI_CACHE_MAX:
        # Eng eski 100 ta yozuvni o'chirish
        sorted_keys = sorted(
            _ai_cache.keys(),
            key=lambda k: _ai_cache[k]["expires"]
        )
        for k in sorted_keys[:100]:
            del _ai_cache[k]

    key = _hash(message)
    _ai_cache[key] = {
        "answer":  answer,
        "expires": time.time() + AI_CACHE_TTL,
    }


def clear_ai_cache():
    """Barcha AI cache ni tozalash."""
    _ai_cache.clear()


def get_ai_cache_stats() -> dict:
    """Cache statistikasi."""
    now    = time.time()
    active = sum(1 for v in _ai_cache.values() if v["expires"] > now)
    return {
        "total":   len(_ai_cache),
        "active":  active,
        "expired": len(_ai_cache) - active,
    }


# ── DB Cache (settings va memory) ────────────────────────────

_settings_cache: dict = {}
_memory_cache:   dict = {}

DB_CACHE_TTL = 300  # 5 daqiqa


def cached_get_settings(user_id: int) -> dict:
    """Foydalanuvchi sozlamalarini cache dan olish."""
    item = _settings_cache.get(user_id)
    if item and time.time() < item["expires"]:
        return item["data"]

    data = db_get_settings(user_id) or {}
    _settings_cache[user_id] = {
        "data":    data,
        "expires": time.time() + DB_CACHE_TTL,
    }
    return data


def cached_get_memory(user_id: int) -> dict:
    """Foydalanuvchi xotirasini cache dan olish."""
    item = _memory_cache.get(user_id)
    if item and time.time() < item["expires"]:
        return item["data"]

    data = db_get_memory(user_id) or {}
    _memory_cache[user_id] = {
        "data":    data,
        "expires": time.time() + DB_CACHE_TTL,
    }
    return data


def invalidate_settings(user_id: int):
    """Settings cache ni tozalash (yangilanganida chaqiriladi)."""
    _settings_cache.pop(user_id, None)


def invalidate_memory(user_id: int):
    """Memory cache ni tozalash."""
    _memory_cache.pop(user_id, None)