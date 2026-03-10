"""
backend/app/routers/dashboard.py — Bosh sahifa statistika
"""
from fastapi import APIRouter, Depends
from core.jwt import get_current_user
from database import get_db, get_usage, get_plan
from config import PLANS

router = APIRouter()


@router.get("/stats")
async def dashboard_stats(current: dict = Depends(get_current_user)):
    uid  = current["user_id"]
    plan = get_plan(uid)

    with get_db() as conn:
        msg_total = conn.execute(
            "SELECT COUNT(*) FROM chat_history WHERE user_id=?", (uid,)
        ).fetchone()[0]

        session_count = conn.execute(
            "SELECT COUNT(*) FROM chat_sessions WHERE user_id=?", (uid,)
        ).fetchone()[0]

        img_total = conn.execute(
            "SELECT COUNT(*) FROM image_history WHERE user_id=?", (uid,)
        ).fetchone()[0]

        todo_done = conn.execute(
            "SELECT COUNT(*) FROM todos WHERE user_id=? AND done=1", (uid,)
        ).fetchone()[0]

        todo_pending = conn.execute(
            "SELECT COUNT(*) FROM todos WHERE user_id=? AND done=0", (uid,)
        ).fetchone()[0]

    limits = PLANS[plan]["limits"]
    return {
        "plan":           plan,
        "messages_today": get_usage(uid, "messages"),
        "messages_limit": limits["messages"],
        "images_today":   get_usage(uid, "images"),
        "images_limit":   limits["images"],
        "total_messages": msg_total,
        "total_sessions": session_count,
        "total_images":   img_total,
        "todos_done":     todo_done,
        "todos_pending":  todo_pending,
    }


@router.get("/activity")
async def recent_activity(current: dict = Depends(get_current_user)):
    with get_db() as conn:
        sessions = conn.execute(
            "SELECT id, title, updated_at, msg_count FROM chat_sessions WHERE user_id=? ORDER BY updated_at DESC LIMIT 5",
            (current["user_id"],)
        ).fetchall()
    return [dict(r) for r in sessions]