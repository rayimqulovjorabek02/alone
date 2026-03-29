"""
backend/app/routers/admin.py — Admin panel
"""
from fastapi import APIRouter, Depends, HTTPException
from core.jwt import get_current_user
from database import get_db

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _require_admin(current: dict = Depends(get_current_user)):
    if not current.get("is_admin"):
        raise HTTPException(403, "Admin huquqi kerak")
    return current


@router.get("/users")
async def get_all_users(current=Depends(_require_admin)):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, username, email, avatar, plan, is_admin, is_active, created_at FROM users ORDER BY created_at DESC"
        ).fetchall()
    return [dict(r) for r in rows]


@router.put("/users/{user_id}/plan")
async def set_user_plan(user_id: int, plan: str, current=Depends(_require_admin)):
    if plan not in ("free", "pro", "premium"):
        raise HTTPException(400, "Plan noto'g'ri")
    with get_db() as conn:
        conn.execute("UPDATE users SET plan=? WHERE id=?", (plan, user_id))
    return {"success": True}


@router.put("/users/{user_id}/block")
async def toggle_block(user_id: int, current=Depends(_require_admin)):
    with get_db() as conn:
        user = conn.execute("SELECT is_active FROM users WHERE id=?", (user_id,)).fetchone()
        if not user:
            raise HTTPException(404, "Topilmadi")
        new_status = 0 if user["is_active"] else 1
        conn.execute("UPDATE users SET is_active=? WHERE id=?", (new_status, user_id))
    return {"success": True, "is_active": bool(new_status)}


@router.delete("/users/{user_id}")
async def delete_user(user_id: int, current=Depends(_require_admin)):
    with get_db() as conn:
        # Avval foydalanuvchi borligini tekshir
        user = conn.execute("SELECT id, is_admin FROM users WHERE id=?", (user_id,)).fetchone()
        if not user:
            raise HTTPException(404, "Foydalanuvchi topilmadi")

        # O'z akkauntini o'chirishni taqiqlash
        if user["id"] == current["user_id"]:
            raise HTTPException(400, "O'z akkauntingizni o'chira olmaysiz")

        # Admin akkauntini o'chirishni taqiqlash
        if user["is_admin"]:
            raise HTTPException(400, "Admin akkauntini o'chirib bo'lmaydi")

        # FOREIGN KEY xatosini oldini olish:
        # users ga bog'liq barcha jadvallardan ma'lumot o'chirish
        tables_with_user_id = [
            "chat_sessions",
            "messages",
            "todos",
            "reminders",
            "notifications",
            "feedback",
            "payments",
            "subscriptions",
            "user_settings",
            "profile_data",
            "audit_log",
            "image_generations",
            "file_uploads",
            "voice_history",
            "agent_sessions",
            "export_history",
            "two_factor_auth",
            "password_reset_tokens",
            "refresh_tokens",
            "sessions",
        ]

        for table in tables_with_user_id:
            try:
                conn.execute(f"DELETE FROM {table} WHERE user_id=?", (user_id,))
            except Exception:
                # Jadval mavjud bo'lmasa — o'tkazib yuborish
                pass

        # Endi users dan o'chirish
        conn.execute("DELETE FROM users WHERE id=?", (user_id,))

    return {"success": True, "deleted_user_id": user_id}


@router.post("/notify-all")
async def notify_all(title: str, message: str, current=Depends(_require_admin)):
    with get_db() as conn:
        users = conn.execute("SELECT id FROM users WHERE is_active=1").fetchall()
        for u in users:
            conn.execute(
                "INSERT INTO notifications (user_id, title, message, type) VALUES (?,?,?,'info')",
                (u["id"], title, message)
            )
    return {"success": True, "sent_to": len(users)}