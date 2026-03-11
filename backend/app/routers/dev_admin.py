"""
backend/app/routers/dev_admin.py
Dasturchi-admin uchun maxsus endpoint — faqat is_admin=True foydalanuvchilar
"""
import os
import time
import sqlite3
import psutil
from fastapi import APIRouter, Depends, HTTPException, Query
from core.jwt import get_current_user
from core.audit_log import get_logs, get_audit_summary
from core.ip_blacklist import (
    get_blacklist, block_ip, unblock_ip,
    get_violation_stats,
)
from core.rate_limiter import get_limiter
from core.monitoring import APIStats
from config import DB_PATH

router = APIRouter(prefix="/api/dev", tags=["developer"])

START_TIME = time.time()


def require_admin(user=Depends(get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(403, "Faqat adminlar uchun")
    return user


# ── TIZIM HOLATI ─────────────────────────────────────────────

@router.get("/system")
async def system_info(user=Depends(require_admin)):
    """Server resurs holati."""
    try:
        mem  = psutil.virtual_memory()
        cpu  = psutil.cpu_percent(interval=0.5)
        disk = psutil.disk_usage('/')
    except Exception:
        mem = cpu = disk = None

    db_size = os.path.getsize(DB_PATH) if os.path.exists(DB_PATH) else 0

    return {
        "uptime_s":   int(time.time() - START_TIME),
        "uptime_human": _fmt_uptime(int(time.time() - START_TIME)),
        "version":    "2.0.0",
        "python":     _python_version(),
        "cpu_percent": cpu,
        "memory": {
            "total_mb":  round(mem.total   / 1e6) if mem else None,
            "used_mb":   round(mem.used    / 1e6) if mem else None,
            "free_mb":   round(mem.available / 1e6) if mem else None,
            "percent":   mem.percent              if mem else None,
        } if mem else {},
        "disk": {
            "total_gb":  round(disk.total / 1e9, 1) if disk else None,
            "used_gb":   round(disk.used  / 1e9, 1) if disk else None,
            "free_gb":   round(disk.free  / 1e9, 1) if disk else None,
            "percent":   disk.percent               if disk else None,
        } if disk else {},
        "db_size_mb": round(db_size / 1e6, 2),
    }


# ── DB STATISTIKA ─────────────────────────────────────────────

@router.get("/db/stats")
async def db_stats(user=Depends(require_admin)):
    """Ma'lumotlar bazasi statistikasi."""
    with sqlite3.connect(DB_PATH) as db:
        tables = [r[0] for r in db.execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        ).fetchall()]

        result = {}
        for t in tables:
            try:
                count = db.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
                result[t] = count
            except Exception:
                result[t] = -1

        # DB hajmi
        page_count = db.execute("PRAGMA page_count").fetchone()[0]
        page_size  = db.execute("PRAGMA page_size").fetchone()[0]
        db_size_kb = page_count * page_size // 1024

    return {
        "tables":    result,
        "size_kb":   db_size_kb,
        "path":      DB_PATH,
    }


@router.post("/db/vacuum")
async def vacuum_db(user=Depends(require_admin)):
    """DB ni tozalash va optimallashtirish."""
    before = os.path.getsize(DB_PATH)
    with sqlite3.connect(DB_PATH) as db:
        db.execute("VACUUM")
    after = os.path.getsize(DB_PATH)
    saved = before - after
    return {
        "before_mb": round(before / 1e6, 2),
        "after_mb":  round(after  / 1e6, 2),
        "saved_mb":  round(saved  / 1e6, 2),
    }


@router.get("/db/slow-queries")
async def slow_queries(user=Depends(require_admin)):
    """Sekin so'rovlarni ko'rish (simulate)."""
    with sqlite3.connect(DB_PATH) as db:
        db.row_factory = sqlite3.Row
        # Eng ko'p xabarli sessiyalar
        rows = db.execute("""
            SELECT s.id, s.title, COUNT(h.id) as msg_count, s.updated_at
            FROM chat_sessions s
            LEFT JOIN chat_history h ON h.session_id = s.id
            GROUP BY s.id ORDER BY msg_count DESC LIMIT 10
        """).fetchall()
    return {"heavy_sessions": [dict(r) for r in rows]}


# ── AUDIT LOG ─────────────────────────────────────────────────

@router.get("/audit")
async def audit_logs(
    user_id: int   = Query(None),
    action:  str   = Query(None),
    status:  str   = Query(None),
    days:    int   = Query(7),
    limit:   int   = Query(100),
    offset:  int   = Query(0),
    admin=Depends(require_admin),
):
    logs = get_logs(
        user_id=user_id, action=action, status=status,
        limit=limit, offset=offset, days=days,
    )
    return {"logs": logs, "count": len(logs)}


@router.get("/audit/summary")
async def audit_summary(days: int = 7, admin=Depends(require_admin)):
    return get_audit_summary(days)


# ── IP BLACKLIST ──────────────────────────────────────────────

@router.get("/blacklist")
async def get_ip_blacklist(admin=Depends(require_admin)):
    return {
        "blacklist":   get_blacklist(),
        "violations":  get_violation_stats(),
    }


@router.post("/blacklist/{ip}")
async def add_to_blacklist(
    ip:     str,
    reason: str = Query("Manual bloklash"),
    hours:  int = Query(None),
    admin=Depends(require_admin),
):
    block_ip(ip, reason=reason, blocked_by=admin["user_id"], hours=hours)
    return {"blocked": ip, "hours": hours}


@router.delete("/blacklist/{ip}")
async def remove_from_blacklist(ip: str, admin=Depends(require_admin)):
    unblock_ip(ip)
    return {"unblocked": ip}


# ── RATE LIMITER STATISTIKA ───────────────────────────────────

@router.get("/rate-limiter")
async def rate_limiter_stats(admin=Depends(require_admin)):
    limiter = get_limiter()
    return {
        "stats":        limiter.get_stats(),
        "blocked_keys": limiter.get_blocked_list(),
    }


@router.delete("/rate-limiter/{key}")
async def clear_rate_limit(key: str, admin=Depends(require_admin)):
    get_limiter().reset(key)
    return {"cleared": key}


# ── API STATISTIKA ────────────────────────────────────────────

@router.get("/api-stats")
async def api_stats(admin=Depends(require_admin)):
    return APIStats.get_stats()


# ── FOYDALANUVCHILAR (kengaytirilgan) ────────────────────────

@router.get("/users/detail")
async def users_detail(
    search: str = Query(""),
    plan:   str = Query(""),
    admin=Depends(require_admin),
):
    with sqlite3.connect(DB_PATH) as db:
        db.row_factory = sqlite3.Row
        q = """
            SELECT u.*,
                COUNT(DISTINCT s.id)  AS session_count,
                COUNT(DISTINCT h.id)  AS msg_count,
                MAX(h.created_at)     AS last_message_at
            FROM users u
            LEFT JOIN chat_sessions s ON s.user_id = u.id
            LEFT JOIN chat_history  h ON h.user_id = u.id
        """
        params = []
        where  = []
        if search:
            where.append("(u.username LIKE ? OR u.email LIKE ?)")
            params += [f"%{search}%", f"%{search}%"]
        if plan:
            where.append("u.plan = ?")
            params.append(plan)

        if where:
            q += " WHERE " + " AND ".join(where)
        q += " GROUP BY u.id ORDER BY u.created_at DESC LIMIT 200"

        rows = db.execute(q, params).fetchall()
        users = []
        for r in rows:
            u = dict(r)
            u.pop("password", None)
            users.append(u)

    return {"users": users, "count": len(users)}


@router.post("/users/{user_id}/reset-password")
async def force_reset_password(
    user_id:      int,
    new_password: str = Query(...),
    admin=Depends(require_admin),
):
    from core.security import hash_password
    with sqlite3.connect(DB_PATH) as db:
        db.execute(
            "UPDATE users SET password=? WHERE id=?",
            (hash_password(new_password), user_id)
        )
        db.commit()
    return {"reset": True, "user_id": user_id}


@router.delete("/users/{user_id}/sessions")
async def clear_user_sessions(user_id: int, admin=Depends(require_admin)):
    with sqlite3.connect(DB_PATH) as db:
        db.execute("DELETE FROM chat_sessions WHERE user_id=?", (user_id,))
        db.commit()
    return {"cleared": True}


# ── XABARLAR ─────────────────────────────────────────────────

@router.post("/broadcast")
async def broadcast_notification(
    title:   str = Query(...),
    message: str = Query(...),
    plan:    str = Query(""),     # bo'sh = hamma
    admin=Depends(require_admin),
):
    """Barcha yoki muayyan foydalanuvchilarga bildirishnoma yuborish."""
    with sqlite3.connect(DB_PATH) as db:
        if plan:
            users = db.execute(
                "SELECT id FROM users WHERE plan=? AND is_active=1", (plan,)
            ).fetchall()
        else:
            users = db.execute("SELECT id FROM users WHERE is_active=1").fetchall()

        for (uid,) in users:
            db.execute(
                "INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
                (uid, title, message)
            )
        db.commit()

    return {"sent_to": len(users), "title": title}


# ── YORDAMCHI ─────────────────────────────────────────────────

def _fmt_uptime(seconds: int) -> str:
    d, r = divmod(seconds, 86400)
    h, r = divmod(r, 3600)
    m, s = divmod(r, 60)
    parts = []
    if d: parts.append(f"{d}k")
    if h: parts.append(f"{h}s")
    if m: parts.append(f"{m}d")
    parts.append(f"{s}s")
    return " ".join(parts)

def _python_version() -> str:
    import sys
    return f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"


# ── AI PROVAYDER BOSHQARUVI ───────────────────────────────────

@router.get("/providers")
async def get_providers(admin=Depends(require_admin)):
    """Barcha AI provayderlari holati."""
    from core.model_router import get_router_status as get_provider_status
    return {
        "providers":      get_provider_status(),
        "active":         None,
    }


@router.post("/providers/{name}/force")
async def force_provider_endpoint(name: str, admin=Depends(require_admin)):
    """Majburiy provayder tanlash."""
    from core.model_router import force_model as force_provider
    success = force_provider(name)
    if not success:
        raise HTTPException(400, f"'{name}' provayderi topilmadi yoki yoqilmagan")
    return {"forced": name}


@router.post("/providers/reset")
async def reset_providers_endpoint(admin=Depends(require_admin)):
    """Barcha provayderlarni qayta tiklash."""
    from core.model_router import reset_router as reset_providers
    reset_providers()
    return {"reset": True}