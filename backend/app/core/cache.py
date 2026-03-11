"""
backend/app/core/cache.py
Cache tizimi

Hozir: in-memory (tez, oddiy)
Keyinroq: Redis ga o'tish uchun faqat shu faylni o'zgartirish kifoya

Ikki xil cache:
  1. AI javoblar cache — xuddi shu savol qayta berilsa tez javob
  2. DB cache — settings va memory uchun
"""
import os
import time
import hashlib
from database import get_settings as db_get_settings
from database import get_memory   as db_get_memory

# Redis mavjud bo'lsa ishlatish (ixtiyoriy)
_redis = None
if os.getenv("REDIS_URL"):
    try:
        import redis
        _redis = redis.from_url(os.getenv("REDIS_URL"))
        _redis.ping()
        print("[Cache] Redis ulandi")
    except Exception:
        _redis = None
        print("[Cache] Redis yo'q — in-memory ishlatiladi")

# ── AI Javoblar Cache ─────────────────────────────────────────

_ai_cache: dict = {}
AI_CACHE_TTL = int(os.getenv("AI_CACHE_TTL", "3600"))  # 1 soat
AI_CACHE_MAX = int(os.getenv("AI_CACHE_MAX", "500"))    # Max yozuvlar


def _hash(text: str) -> str:
    return hashlib.md5(text.strip().lower().encode()).hexdigest()


def get_cache(message: str) -> str | None:
    """Cache dan javob olish."""
    key = _hash(message)

    # Redis
    if _redis:
        try:
            val = _redis.get(f"ai:{key}")
            return val.decode() if val else None
        except Exception:
            pass

    # In-memory
    item = _ai_cache.get(key)
    if item is None:
        return None
    if time.time() > item["expires"]:
        del _ai_cache[key]
        return None
    return item["answer"]


def save_cache(message: str, answer: str):
    """Javobni cache ga saqlash."""
    if not message or not answer:
        return
    key = _hash(message)

    # Redis
    if _redis:
        try:
            _redis.setex(f"ai:{key}", AI_CACHE_TTL, answer)
            return
        except Exception:
            pass

    # In-memory — to'lib ketsa eskisini o'chirish
    if len(_ai_cache) >= AI_CACHE_MAX:
        sorted_keys = sorted(_ai_cache, key=lambda k: _ai_cache[k]["expires"])
        for k in sorted_keys[:100]:
            del _ai_cache[k]

    _ai_cache[key] = {
        "answer":  answer,
        "expires": time.time() + AI_CACHE_TTL,
    }


def clear_ai_cache():
    """Barcha AI cache ni tozalash."""
    if _redis:
        try:
            for k in _redis.scan_iter("ai:*"):
                _redis.delete(k)
            return
        except Exception:
            pass
    _ai_cache.clear()


def get_ai_cache_stats() -> dict:
    """Cache statistikasi."""
    if _redis:
        try:
            keys = list(_redis.scan_iter("ai:*"))
            return {"backend": "redis", "total": len(keys)}
        except Exception:
            pass
    now    = time.time()
    active = sum(1 for v in _ai_cache.values() if v["expires"] > now)
    return {
        "backend": "memory",
        "total":   len(_ai_cache),
        "active":  active,
        "expired": len(_ai_cache) - active,
    }


# ── DB Cache ──────────────────────────────────────────────────

_settings_cache: dict = {}
_memory_cache:   dict = {}
DB_CACHE_TTL = int(os.getenv("DB_CACHE_TTL", "300"))  # 5 daqiqa


def cached_get_settings(user_id: int) -> dict:
    item = _settings_cache.get(user_id)
    if item and time.time() < item["expires"]:
        return item["data"]
    data = db_get_settings(user_id) or {}
    _settings_cache[user_id] = {"data": data, "expires": time.time() + DB_CACHE_TTL}
    return data


def cached_get_memory(user_id: int) -> dict:
    item = _memory_cache.get(user_id)
    if item and time.time() < item["expires"]:
        return item["data"]
    data = db_get_memory(user_id) or {}
    _memory_cache[user_id] = {"data": data, "expires": time.time() + DB_CACHE_TTL}
    return data


def invalidate_settings(user_id: int):
    _settings_cache.pop(user_id, None)
    if _redis:
        try:
            _redis.delete(f"settings:{user_id}")
        except Exception:
            pass


def invalidate_memory(user_id: int):
    _memory_cache.pop(user_id, None)
    if _redis:
        try:
            _redis.delete(f"memory:{user_id}")
        except Exception:
            pass