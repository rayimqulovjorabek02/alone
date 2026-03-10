"""
backend/app/routers/notifications.py
"""
from fastapi import APIRouter, Depends
from core.jwt import get_current_user
from database import get_db

router = APIRouter()


@router.get("")
async def get_notifications(current: dict = Depends(get_current_user)):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50",
            (current["user_id"],)
        ).fetchall()
    return [dict(r) for r in rows]


@router.put("/{notif_id}/read")
async def mark_read(notif_id: int, current: dict = Depends(get_current_user)):
    with get_db() as conn:
        conn.execute("UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?",
                     (notif_id, current["user_id"]))
    return {"success": True}


@router.put("/read-all")
async def mark_all_read(current: dict = Depends(get_current_user)):
    with get_db() as conn:
        conn.execute("UPDATE notifications SET is_read=1 WHERE user_id=?", (current["user_id"],))
    return {"success": True}


@router.delete("/{notif_id}")
async def delete_notification(notif_id: int, current: dict = Depends(get_current_user)):
    with get_db() as conn:
        conn.execute("DELETE FROM notifications WHERE id=? AND user_id=?",
                     (notif_id, current["user_id"]))
    return {"success": True}


@router.get("/unread-count")
async def unread_count(current: dict = Depends(get_current_user)):
    with get_db() as conn:
        count = conn.execute(
            "SELECT COUNT(*) FROM notifications WHERE user_id=? AND is_read=0",
            (current["user_id"],)
        ).fetchone()[0]
    return {"count": count}