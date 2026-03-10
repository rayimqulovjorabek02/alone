"""
routers/subscription.py — Premium tizimi
To'lovsiz aktivlashtirish MUMKIN EMAS
Faqat: Admin panel yoki to'lov orqali
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from core.jwt import get_current_user
import sqlite3, os
from datetime import datetime, timedelta

router  = APIRouter()
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'alone.db')

def _db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

PLANS = {
    "free":    {"name": "Bepul",   "price": 0,     "messages": 50,    "images": 3,   "days": 0},
    "pro":     {"name": "Pro",     "price": 9.99,  "messages": 500,   "images": 20,  "days": 30},
    "premium": {"name": "Premium", "price": 19.99, "messages": 99999, "images": 999, "days": 30},
}


@router.get("/")
async def get_subscription(current: dict = Depends(get_current_user)):
    uid  = current["user_id"]
    conn = _db()
    try:
        row = conn.execute(
            "SELECT * FROM subscriptions WHERE user_id=? ORDER BY id DESC LIMIT 1", (uid,)
        ).fetchone()

        if not row:
            return {"plan": "free", "expires_at": None, "active": True, **PLANS["free"]}

        plan       = row["plan"]
        expires_at = row["expires_at"]
        info       = PLANS.get(plan, PLANS["free"])

        # Muddati tugaganmi
        active = True
        if expires_at and plan != "free":
            try:
                exp = datetime.fromisoformat(expires_at)
                if exp < datetime.now():
                    active = False
                    plan   = "free"
                    info   = PLANS["free"]
                    # DB ni yangilash
                    conn.execute("UPDATE subscriptions SET plan='free' WHERE user_id=?", (uid,))
                    conn.commit()
            except Exception:
                pass

        return {
            "plan":       plan,
            "expires_at": expires_at,
            "active":     active,
            **info,
        }
    finally:
        conn.close()


@router.get("/plans")
async def get_plans():
    """Barcha rejalar va narxlari"""
    return {
        "plans": [
            {
                "id":       "free",
                "name":     "Bepul",
                "price":    0,
                "currency": "USD",
                "features": ["50 xabar/kun", "3 rasm/kun", "Asosiy AI modeli"],
                "limits":   PLANS["free"],
            },
            {
                "id":       "pro",
                "name":     "Pro",
                "price":    9.99,
                "currency": "USD",
                "features": ["500 xabar/kun", "20 rasm/kun", "Barcha modellar", "Agent"],
                "limits":   PLANS["pro"],
                "payment_required": True,
            },
            {
                "id":       "premium",
                "name":     "Premium",
                "price":    19.99,
                "currency": "USD",
                "features": ["Cheksiz xabarlar", "Cheksiz rasmlar", "Ustuvor qo'llab-quvvatlash"],
                "limits":   PLANS["premium"],
                "payment_required": True,
            },
        ]
    }


@router.post("/cancel")
async def cancel_subscription(current: dict = Depends(get_current_user)):
    """Obunani bekor qilish"""
    uid  = current["user_id"]
    conn = _db()
    try:
        conn.execute(
            "UPDATE subscriptions SET plan='free', expires_at=NULL WHERE user_id=?", (uid,)
        )
        conn.commit()
        return {"success": True, "message": "Obuna bekor qilindi"}
    finally:
        conn.close()


# To'lovsiz aktivlashtirish MUMKIN EMAS — bu endpoint o'chirildi
# Faqat admin /api/admin/activate-plan orqali berishi mumkin
# Yoki Stripe/Click webhook orqali avtomatik
@router.post("/activate")
async def activate_blocked(_: dict = Depends(get_current_user)):
    raise HTTPException(
        status_code=403,
        detail="To'lovsiz premium olish mumkin emas. Admin bilan bog'laning yoki to'lov qiling."
    )