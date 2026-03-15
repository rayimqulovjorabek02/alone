"""
backend/app/routers/feedback.py — Taklif va shikoyatlar
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from core.jwt import get_current_user
from database import get_db

router = APIRouter(prefix="/api/feedback", tags=["feedback"])


class FeedbackCreate(BaseModel):
    type:    str
    rating:  Optional[int] = None
    message: str


class AdminReply(BaseModel):
    reply:  str
    status: str = "answered"


# ── FOYDALANUVCHI ─────────────────────────────────────────────

@router.post("")
async def create_feedback(body: FeedbackCreate, current: dict = Depends(get_current_user)):
    # Frontend suggestion/complaint -> taklif/shikoyat
    type_map = {
        "suggestion": "taklif",
        "complaint":  "shikoyat",
        "taklif":     "taklif",
        "shikoyat":   "shikoyat",
    }
    print(f"[Feedback] type={body.type!r}, message={body.message!r}, rating={body.rating}")
    if body.type not in type_map:
        raise HTTPException(400, f"type noto'g'ri: {body.type!r}. taklif yoki shikoyat bo'lishi kerak")
    feedback_type = type_map[body.type]

    if not body.message.strip():
        raise HTTPException(400, "Xabar bo'sh bo'lmasligi kerak")
    if body.rating and not (1 <= body.rating <= 5):
        raise HTTPException(400, "Reyting 1-5 orasida bo'lishi kerak")

    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO feedback (user_id, type, rating, message) VALUES (?,?,?,?)",
            (current["user_id"], feedback_type, body.rating, body.message.strip())
        )
        conn.commit()
    return {"id": cur.lastrowid, "success": True}


@router.get("/my")
async def my_feedback(current: dict = Depends(get_current_user)):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM feedback WHERE user_id=? ORDER BY created_at DESC",
            (current["user_id"],)
        ).fetchall()
    return [dict(r) for r in rows]


# ── ADMIN ─────────────────────────────────────────────────────

@router.get("/admin/all")
async def admin_all(current: dict = Depends(get_current_user)):
    if not current.get("is_admin"):
        raise HTTPException(403, "Admin huquqi kerak")
    with get_db() as conn:
        rows = conn.execute("""
            SELECT f.*, u.username
            FROM feedback f
            LEFT JOIN users u ON f.user_id = u.id
            ORDER BY f.created_at DESC
        """).fetchall()
    return [dict(r) for r in rows]


@router.put("/admin/{feedback_id}")
async def admin_reply(feedback_id: int, body: AdminReply, current: dict = Depends(get_current_user)):
    if not current.get("is_admin"):
        raise HTTPException(403, "Admin huquqi kerak")
    with get_db() as conn:
        conn.execute(
            "UPDATE feedback SET admin_reply=?, status=? WHERE id=?",
            (body.reply, body.status, feedback_id)
        )
        conn.commit()
    return {"success": True}


@router.get("/stats")
async def feedback_stats():
    with get_db() as conn:
        total       = conn.execute("SELECT COUNT(*) FROM feedback").fetchone()[0]
        takliflar   = conn.execute("SELECT COUNT(*) FROM feedback WHERE type='taklif'").fetchone()[0]
        shikoyatlar = conn.execute("SELECT COUNT(*) FROM feedback WHERE type='shikoyat'").fetchone()[0]
        avg_rating  = conn.execute("SELECT AVG(rating) FROM feedback WHERE rating IS NOT NULL").fetchone()[0]
    return {
        "total":       total,
        "takliflar":   takliflar,
        "shikoyatlar": shikoyatlar,
        "avg_rating":  round(avg_rating, 1) if avg_rating else 0,
    }