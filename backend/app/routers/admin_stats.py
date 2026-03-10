"""
backend/app/routers/admin_stats.py — Admin statistika
"""
from fastapi import APIRouter, Depends, HTTPException
from core.jwt import get_current_user
from database import get_db

router = APIRouter()


def _require_admin(current: dict = Depends(get_current_user)):
    if not current.get("is_admin"):
        raise HTTPException(403, "Admin huquqi kerak")
    return current


@router.get("")
async def admin_stats(current=Depends(_require_admin)):
    with get_db() as conn:
        total_users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        active_users = conn.execute("SELECT COUNT(*) FROM users WHERE is_active=1").fetchone()[0]
        total_msgs = conn.execute("SELECT COUNT(*) FROM chat_history").fetchone()[0]
        total_imgs = conn.execute("SELECT COUNT(*) FROM image_history").fetchone()[0]
        total_sessions = conn.execute("SELECT COUNT(*) FROM chat_sessions").fetchone()[0]

        plans = conn.execute(
            "SELECT plan, COUNT(*) as count FROM users GROUP BY plan"
        ).fetchall()

        today_users = conn.execute(
            "SELECT COUNT(DISTINCT user_id) FROM usage_stats WHERE date=date('now')"
        ).fetchone()[0]

        new_users_week = conn.execute(
            "SELECT COUNT(*) FROM users WHERE created_at >= datetime('now', '-7 days')"
        ).fetchone()[0]

        feedback_new = conn.execute(
            "SELECT COUNT(*) FROM feedback WHERE status='new'"
        ).fetchone()[0]

    return {
        "total_users":    total_users,
        "active_users":   active_users,
        "today_active":   today_users,
        "new_users_week": new_users_week,
        "total_messages": total_msgs,
        "total_images":   total_imgs,
        "total_sessions": total_sessions,
        "feedback_new":   feedback_new,
        "plans": {r["plan"]: r["count"] for r in plans},
    }


@router.get("/daily")
async def daily_stats(days: int = 7, current=Depends(_require_admin)):
    with get_db() as conn:
        rows = conn.execute("""
            SELECT date, SUM(count) as total
            FROM usage_stats
            WHERE date >= date('now', ?)
            GROUP BY date ORDER BY date
        """, (f"-{days} days",)).fetchall()
    return [dict(r) for r in rows]