"""
backend/app/core/ip_blacklist.py — IP bloklash tizimi
"""
import sqlite3
import time
from typing import Optional
from fastapi import Request, HTTPException
from config import DB_PATH


def init_blacklist_table():
    with sqlite3.connect(DB_PATH) as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS ip_blacklist (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                ip         TEXT    UNIQUE NOT NULL,
                reason     TEXT,
                blocked_by INTEGER,
                blocked_at REAL    DEFAULT (unixepoch()),
                expires_at REAL,           -- NULL = doimiy
                is_active  INTEGER DEFAULT 1
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS ip_violations (
                ip          TEXT    PRIMARY KEY,
                count       INTEGER DEFAULT 0,
                last_seen   REAL
            )
        """)
        db.commit()


def is_blocked(ip: str) -> bool:
    now = time.time()
    with sqlite3.connect(DB_PATH) as db:
        row = db.execute("""
            SELECT id FROM ip_blacklist
            WHERE ip = ? AND is_active = 1
              AND (expires_at IS NULL OR expires_at > ?)
        """, (ip, now)).fetchone()
        return row is not None


def block_ip(
    ip:         str,
    reason:     str  = "Avtomatik bloklash",
    blocked_by: Optional[int] = None,
    hours:      Optional[int] = None,    # None = doimiy
):
    expires = time.time() + hours * 3600 if hours else None
    with sqlite3.connect(DB_PATH) as db:
        db.execute("""
            INSERT INTO ip_blacklist (ip, reason, blocked_by, expires_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(ip) DO UPDATE SET
                is_active  = 1,
                reason     = excluded.reason,
                blocked_by = excluded.blocked_by,
                expires_at = excluded.expires_at,
                blocked_at = unixepoch()
        """, (ip, reason, blocked_by, expires))
        db.commit()


def unblock_ip(ip: str):
    with sqlite3.connect(DB_PATH) as db:
        db.execute("UPDATE ip_blacklist SET is_active=0 WHERE ip=?", (ip,))
        db.commit()


def track_violation(ip: str):
    """Qoidabuzarlikni kuzatish — 10 dan oshsa avtomatik bloklash."""
    now = time.time()
    with sqlite3.connect(DB_PATH) as db:
        db.execute("""
            INSERT INTO ip_violations (ip, count, last_seen) VALUES (?, 1, ?)
            ON CONFLICT(ip) DO UPDATE SET
                count = count + 1,
                last_seen = excluded.last_seen
        """, (ip, now))
        db.commit()

        count = db.execute(
            "SELECT count FROM ip_violations WHERE ip=?", (ip,)
        ).fetchone()[0]

        # Avtomatik bloklash
        if count >= 20:
            block_ip(ip, reason=f"Avtomatik: {count} ta qoidabuzarlik", hours=24)
        elif count >= 50:
            block_ip(ip, reason=f"Avtomatik: {count} ta qoidabuzarlik")  # doimiy


def get_blacklist(active_only: bool = True) -> list[dict]:
    with sqlite3.connect(DB_PATH) as db:
        db.row_factory = sqlite3.Row
        q = "SELECT * FROM ip_blacklist"
        if active_only:
            q += " WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > unixepoch())"
        q += " ORDER BY blocked_at DESC"
        return [dict(r) for r in db.execute(q).fetchall()]


def get_violation_stats() -> list[dict]:
    with sqlite3.connect(DB_PATH) as db:
        db.row_factory = sqlite3.Row
        rows = db.execute("""
            SELECT ip, count, last_seen FROM ip_violations
            ORDER BY count DESC LIMIT 50
        """).fetchall()
        return [dict(r) for r in rows]


# FastAPI middleware
async def ip_blacklist_middleware(request: Request, call_next):
    ip = request.client.host or "unknown"
    if is_blocked(ip):
        raise HTTPException(status_code=403, detail="IP bloklangan")
    return await call_next(request)