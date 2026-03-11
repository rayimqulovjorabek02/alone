"""
backend/app/core/rate_limiter.py — IP + User rate limiting
"""
import time
from collections import defaultdict
from typing import Optional
from fastapi import Request, HTTPException


class RateLimiter:
    """
    In-memory sliding window rate limiter.
    Kelajakda Redis ga ko'chirish oson.
    """

    def __init__(self):
        # { key: [timestamp1, timestamp2, ...] }
        self._windows: dict[str, list[float]] = defaultdict(list)
        self._blocked: dict[str, float] = {}        # key → unblock_time
        self._violations: dict[str, int] = defaultdict(int)

    # ── Asosiy tekshiruv ──────────────────────────────────────
    def check(
        self,
        key:        str,
        limit:      int,
        window_sec: int,
        block_sec:  int = 0,
    ) -> tuple[bool, int]:
        """
        Returns: (allowed, remaining)
        """
        now = time.time()

        # Bloklangan?
        if key in self._blocked:
            if now < self._blocked[key]:
                wait = int(self._blocked[key] - now)
                raise HTTPException(
                    status_code=429,
                    detail=f"Juda ko'p urinish. {wait} soniyadan keyin qayta urinib ko'ring.",
                    headers={"Retry-After": str(wait)},
                )
            else:
                del self._blocked[key]

        # Sliding window tozalash
        self._windows[key] = [
            t for t in self._windows[key]
            if now - t < window_sec
        ]

        count = len(self._windows[key])

        if count >= limit:
            self._violations[key] += 1
            # Ko'p buzilish → uzoqroq bloklash
            if block_sec > 0:
                multiplier = min(self._violations[key], 10)
                self._blocked[key] = now + block_sec * multiplier
            raise HTTPException(
                status_code=429,
                detail="So'rovlar juda ko'p. Bir oz kuting.",
                headers={"Retry-After": str(window_sec)},
            )

        self._windows[key].append(now)
        remaining = limit - count - 1
        return True, remaining

    def reset(self, key: str):
        """Limitni tozalash (muvaffaqiyatli login dan keyin)."""
        self._windows.pop(key, None)
        self._blocked.pop(key, None)
        self._violations.pop(key, None)

    def get_stats(self) -> dict:
        return {
            "tracked_keys": len(self._windows),
            "blocked_keys": len(self._blocked),
            "total_violations": sum(self._violations.values()),
        }

    def get_blocked_list(self) -> list[dict]:
        now = time.time()
        return [
            {"key": k, "unblock_in": int(v - now)}
            for k, v in self._blocked.items()
            if v > now
        ]

    def unblock(self, key: str):
        self._blocked.pop(key, None)
        self._violations.pop(key, None)


# ── Global limiterlar ──────────────────────────────────────────
_limiter = RateLimiter()

# Preset limitlar
LIMITS = {
    "login":        {"limit": 5,   "window": 300,  "block": 300},   # 5/5min → 5min blok
    "register":     {"limit": 3,   "window": 3600, "block": 3600},  # 3/soat
    "forgot_pwd":   {"limit": 3,   "window": 3600, "block": 1800},  # 3/soat
    "chat":         {"limit": 60,  "window": 60,   "block": 60},    # 60/min
    "image":        {"limit": 10,  "window": 60,   "block": 120},   # 10/min
    "api_global":   {"limit": 300, "window": 60,   "block": 0},     # 300/min
    "tts":          {"limit": 20,  "window": 60,   "block": 30},
    "stt":          {"limit": 10,  "window": 60,   "block": 30},
    "file_upload":  {"limit": 5,   "window": 60,   "block": 120},
    "agent":        {"limit": 20,  "window": 60,   "block": 60},
}


def rate_limit(preset: str, key_suffix: str = ""):
    """
    FastAPI dependency sifatida ishlatish:

        @router.post("/login")
        async def login(request: Request, _=Depends(rate_limit("login"))):
    """
    cfg = LIMITS.get(preset, LIMITS["api_global"])

    async def _check(request: Request):
        ip   = request.client.host or "unknown"
        key  = f"{preset}:{ip}"
        if key_suffix:
            key += f":{key_suffix}"
        _limiter.check(key, cfg["limit"], cfg["window"], cfg["block"])

    return _check


def rate_limit_user(preset: str):
    """User ID bo'yicha rate limiting."""
    cfg = LIMITS.get(preset, LIMITS["api_global"])

    async def _check(request: Request):
        # Token dan user_id olish
        auth  = request.headers.get("authorization", "")
        token = auth.replace("Bearer ", "").strip()
        key   = f"{preset}:user:{token[:20] if token else 'anon'}"
        _limiter.check(key, cfg["limit"], cfg["window"], cfg["block"])

    return _check


def get_limiter() -> RateLimiter:
    return _limiter