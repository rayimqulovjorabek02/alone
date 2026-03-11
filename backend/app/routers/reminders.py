"""
backend/app/routers/reminders.py
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from core.jwt import get_current_user
from database import get_db

router = APIRouter(prefix="/api/reminder", tags=["reminder"])


class ReminderCreate(BaseModel):
    title:     str
    message:   Optional[str] = None
    remind_at: str  # ISO format: 2024-12-01T10:00


@router.get("")
async def get_reminders(current: dict = Depends(get_current_user)):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM reminders WHERE user_id=? ORDER BY remind_at ASC",
            (current["user_id"],)
        ).fetchall()
    return [dict(r) for r in rows]


@router.post("")
async def create_reminder(body: ReminderCreate, current: dict = Depends(get_current_user)):
    if not body.title.strip():
        raise HTTPException(400, "Sarlavha kerak")
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO reminders (user_id, title, message, remind_at) VALUES (?,?,?,?)",
            (current["user_id"], body.title, body.message, body.remind_at)
        )
    return {"id": cur.lastrowid, "success": True}


@router.delete("/{reminder_id}")
async def delete_reminder(reminder_id: int, current: dict = Depends(get_current_user)):
    with get_db() as conn:
        conn.execute("DELETE FROM reminders WHERE id=? AND user_id=?",
                     (reminder_id, current["user_id"]))
    return {"success": True}