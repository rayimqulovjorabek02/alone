"""
backend/app/core/cache.py — Cache yordamchi funksiyalar
"""
from database import get_settings, get_memory

_settings_cache = {}
_memory_cache   = {}


def cached_get_settings(user_id: int) -> dict:
    if user_id not in _settings_cache:
        _settings_cache[user_id] = get_settings(user_id) or {}
    return _settings_cache[user_id]


def cached_get_memory(user_id: int) -> dict:
    if user_id not in _memory_cache:
        _memory_cache[user_id] = get_memory(user_id) or {}
    return _memory_cache[user_id]


def invalidate_settings(user_id: int):
    _settings_cache.pop(user_id, None)


def invalidate_memory(user_id: int):
    _memory_cache.pop(user_id, None)