"""
backend/app/routers/payments.py — Obuna tizimi (Admin orqali)
"""
import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from core.jwt import get_current_user
from database import get_db, get_plan
from config import PLANS

router = APIRouter(prefix="/api/payments", tags=["payments"])


class SubscribeRequest(BaseModel):
    plan:    str
    note:    Optional[str] = None  # Foydalanuvchi izohi


class AdminPlanUpdate(BaseModel):
    user_id: int
    plan:    str
    note:    Optional[str] = None


@router.get("/plans")
async def get_plans():
    return {"plans": PLANS}


@router.get("/my-plan")
async def my_plan(current: dict = Depends(get_current_user)):
    plan = get_plan(current["user_id"])
    with get_db() as conn:
        req = conn.execute(
            "SELECT * FROM subscription_requests WHERE user_id=? ORDER BY created_at DESC LIMIT 1",
            (current["user_id"],)
        ).fetchone()
    return {
        "plan":    plan,
        "info":    PLANS.get(plan, PLANS["free"]),
        "pending": dict(req) if req and req["status"] == "pending" else None,
    }


@router.post("/subscribe")
async def request_subscription(body: SubscribeRequest, current: dict = Depends(get_current_user)):
    """Foydalanuvchi obuna so'rovi yuboradi."""
    if body.plan not in ("pro", "premium"):
        raise HTTPException(400, "Noto'g'ri plan")

    current_plan = get_plan(current["user_id"])
    if current_plan == body.plan:
        raise HTTPException(400, "Siz allaqachon bu planda siz")

    with get_db() as conn:
        # Oldingi kutayotgan so'rovni bekor qilish
        conn.execute(
            "UPDATE subscription_requests SET status='cancelled' WHERE user_id=? AND status='pending'",
            (current["user_id"],)
        )
        # Yangi so'rov yaratish
        conn.execute(
            """INSERT INTO subscription_requests
               (user_id, plan, note, status, created_at)
               VALUES (?, ?, ?, 'pending', unixepoch())""",
            (current["user_id"], body.plan, body.note or "")
        )
        conn.commit()

        # Foydalanuvchi ma'lumotlari
        user = conn.execute(
            "SELECT username, email FROM users WHERE id=?",
            (current["user_id"],)
        ).fetchone()

    # Admin ga email xabarnoma
    try:
        from core.email_service import send_email
        admin_email = os.getenv("ADMIN_EMAIL", "")
        if admin_email:
            plan_names = {"pro": "Pro (49,000 so'm/oy)", "premium": "Premium (99,000 so'm/oy)"}
            await send_email(
                to=admin_email,
                subject=f"Alone AI — Yangi obuna so'rovi: {user['username']}",
                body_html=f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#09090d;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="500" cellpadding="0" cellspacing="0"
             style="background:#111118;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:28px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:20px;font-weight:800;">👑 Yangi Obuna So'rovi</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <table width="100%" cellpadding="8" cellspacing="0">
              <tr><td style="color:#9898aa;font-size:13px;">Foydalanuvchi:</td>
                  <td style="color:#ededf0;font-size:13px;font-weight:600;">{user['username']}</td></tr>
              <tr><td style="color:#9898aa;font-size:13px;">Email:</td>
                  <td style="color:#ededf0;font-size:13px;">{user['email']}</td></tr>
              <tr><td style="color:#9898aa;font-size:13px;">Tanlagan plan:</td>
                  <td style="color:#a78bfa;font-size:13px;font-weight:700;">{plan_names.get(body.plan, body.plan)}</td></tr>
              <tr><td style="color:#9898aa;font-size:13px;">Izoh:</td>
                  <td style="color:#ededf0;font-size:13px;">{body.note or '—'}</td></tr>
            </table>
            <div style="margin-top:20px;padding:14px;background:#1a1a24;border-radius:12px;">
              <p style="color:#9898aa;font-size:12px;margin:0;">
                Admin panelidan foydalanuvchi planini o'zgartiring:
                <strong style="color:#ededf0;">Admin Panel → Foydalanuvchilar → Plan o'zgartirish</strong>
              </p>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
"""
            )
    except Exception as e:
        print(f"[Payment] Email xato: {e}")

    return {
        "success": True,
        "message": "So'rovingiz qabul qilindi. Admin 24 soat ichida planini yangilaydi.",
    }


@router.get("/requests")
async def get_requests(current: dict = Depends(get_current_user)):
    """Admin: barcha obuna so'rovlari."""
    if not current.get("is_admin"):
        raise HTTPException(403, "Admin huquqi kerak")
    with get_db() as conn:
        rows = conn.execute("""
            SELECT sr.*, u.username, u.email
            FROM subscription_requests sr
            JOIN users u ON sr.user_id = u.id
            ORDER BY sr.created_at DESC
        """).fetchall()
    return [dict(r) for r in rows]


@router.put("/requests/{request_id}/approve")
async def approve_request(request_id: int, current: dict = Depends(get_current_user)):
    """Admin: so'rovni tasdiqlash va plan yangilash."""
    if not current.get("is_admin"):
        raise HTTPException(403, "Admin huquqi kerak")

    with get_db() as conn:
        req = conn.execute(
            "SELECT * FROM subscription_requests WHERE id=?", (request_id,)
        ).fetchone()
        if not req:
            raise HTTPException(404, "So'rov topilmadi")

        # Plan yangilash
        conn.execute(
            "UPDATE users SET plan=? WHERE id=?",
            (req["plan"], req["user_id"])
        )
        # So'rov tasdiqlash
        conn.execute(
            "UPDATE subscription_requests SET status='approved', updated_at=unixepoch() WHERE id=?",
            (request_id,)
        )
        # Bildirishnoma
        conn.execute(
            "INSERT INTO notifications (user_id, title, message, type) VALUES (?,?,?,?)",
            (
                req["user_id"],
                f"👑 {req['plan'].capitalize()} plan faollashtirildi!",
                f"Tabriklaymiz! Sizning {req['plan'].capitalize()} obunangiz faollashtirildi.",
                "success"
            )
        )
        conn.commit()

        # Foydalanuvchiga email
        try:
            user = conn.execute(
                "SELECT email, username FROM users WHERE id=?", (req["user_id"],)
            ).fetchone()
            from core.email_service import send_email
            await send_email(
                to=user["email"],
                subject=f"Alone AI — {req['plan'].capitalize()} plan faollashtirildi!",
                body_html=f"""
<body style="margin:0;padding:20px;background:#09090d;font-family:Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#111118;border-radius:16px;padding:28px;border:1px solid rgba(255,255,255,0.08);">
    <h2 style="color:#a78bfa;margin:0 0 16px;">👑 Tabriklaymiz, {user['username']}!</h2>
    <p style="color:#9898aa;font-size:14px;">Sizning <strong style="color:#ededf0;">{req['plan'].capitalize()}</strong> obunangiz faollashtirildi.</p>
    <a href="https://aloneai.uz/dashboard" style="display:inline-block;margin-top:16px;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:white;padding:10px 24px;border-radius:10px;text-decoration:none;font-weight:700;">Boshlash →</a>
  </div>
</body>
"""
            )
        except Exception as e:
            print(f"[Payment] Approve email xato: {e}")

    return {"success": True, "message": "Plan yangilandi"}


@router.put("/requests/{request_id}/reject")
async def reject_request(request_id: int, current: dict = Depends(get_current_user)):
    """Admin: so'rovni rad etish."""
    if not current.get("is_admin"):
        raise HTTPException(403, "Admin huquqi kerak")

    with get_db() as conn:
        req = conn.execute(
            "SELECT * FROM subscription_requests WHERE id=?", (request_id,)
        ).fetchone()
        if not req:
            raise HTTPException(404, "So'rov topilmadi")

        conn.execute(
            "UPDATE subscription_requests SET status='rejected', updated_at=unixepoch() WHERE id=?",
            (request_id,)
        )
        conn.execute(
            "INSERT INTO notifications (user_id, title, message, type) VALUES (?,?,?,?)",
            (
                req["user_id"],
                "Obuna so'rovi rad etildi",
                "Afsuski, obuna so'rovingiz rad etildi. Batafsil ma'lumot uchun admin bilan bog'laning.",
                "warning"
            )
        )
        conn.commit()

    return {"success": True}


@router.get("/history")
async def payment_history(current: dict = Depends(get_current_user)):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM subscription_requests WHERE user_id=? ORDER BY created_at DESC",
            (current["user_id"],)
        ).fetchall()
    return [dict(r) for r in rows]