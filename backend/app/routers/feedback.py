"""
routers/feedback.py — Taklif va shikoyatlar
"""
import os
import sqlite3
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from core.jwt import get_current_user

router = APIRouter(prefix="/api/feedback", tags=["feedback"])

DB_NAME = "alone.db"

def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_feedback_table():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('taklif','shikoyat')),
            rating INTEGER CHECK(rating BETWEEN 1 AND 5),
            message TEXT NOT NULL,
            status TEXT DEFAULT 'new' CHECK(status IN ('new','read','answered')),
            admin_reply TEXT,
            created_at TIMESTAMP DEFAULT (datetime('now')),
            updated_at TIMESTAMP DEFAULT (datetime('now'))
        )
    """)
    conn.commit()
    conn.close()

init_feedback_table()


class FeedbackCreate(BaseModel):
    type: str          # taklif | shikoyat
    rating: Optional[int] = None
    message: str


class AdminReply(BaseModel):
    reply: str
    status: str = 'answered'


# ── FOYDALANUVCHI ─────────────────────────────

@router.post("")
async def create_feedback(body: FeedbackCreate, current: dict = Depends(get_current_user)):
    if body.type not in ('taklif', 'shikoyat'):
        raise HTTPException(400, "type: taklif yoki shikoyat bo'lishi kerak")
    if not body.message.strip():
        raise HTTPException(400, "Xabar bo'sh bo'lmasligi kerak")
    if body.rating and not (1 <= body.rating <= 5):
        raise HTTPException(400, "Reyting 1-5 orasida bo'lishi kerak")

    conn = get_db()
    try:
        cur = conn.execute(
            "INSERT INTO feedback (user_id, type, rating, message) VALUES (?,?,?,?)",
            (current["user_id"], body.type, body.rating, body.message.strip())
        )
        conn.commit()
        return {"id": cur.lastrowid, "success": True}
    finally:
        conn.close()


@router.get("/my")
async def my_feedback(current: dict = Depends(get_current_user)):
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT * FROM feedback WHERE user_id=? ORDER BY created_at DESC",
            (current["user_id"],)
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


# ── ADMIN ─────────────────────────────────────

@router.get("/admin/all")
async def admin_all(current: dict = Depends(get_current_user)):
    if not current.get("is_admin"):
        raise HTTPException(403, "Admin huquqi kerak")
    conn = get_db()
    try:
        rows = conn.execute("""
            SELECT f.*, u.username
            FROM feedback f
            LEFT JOIN users u ON f.user_id = u.id
            ORDER BY f.created_at DESC
        """).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@router.put("/admin/{feedback_id}")
async def admin_reply(feedback_id: int, body: AdminReply, current: dict = Depends(get_current_user)):
    if not current.get("is_admin"):
        raise HTTPException(403, "Admin huquqi kerak")
    conn = get_db()
    try:
        conn.execute(
            "UPDATE feedback SET admin_reply=?, status=?, updated_at=datetime('now') WHERE id=?",
            (body.reply, body.status, feedback_id)
        )
        conn.commit()
        return {"success": True}
    finally:
        conn.close()


@router.get("/stats")
async def feedback_stats():
    conn = get_db()
    try:
        total = conn.execute("SELECT COUNT(*) FROM feedback").fetchone()[0]
        takliflar = conn.execute("SELECT COUNT(*) FROM feedback WHERE type='taklif'").fetchone()[0]
        shikoyatlar = conn.execute("SELECT COUNT(*) FROM feedback WHERE type='shikoyat'").fetchone()[0]
        avg_rating = conn.execute("SELECT AVG(rating) FROM feedback WHERE rating IS NOT NULL").fetchone()[0]
        return {
            "total": total,
            "takliflar": takliflar,
            "shikoyatlar": shikoyatlar,
            "avg_rating": round(avg_rating, 1) if avg_rating else 0
        }
    finally:
        conn.close()