"""
backend/app/routers/payments.py — To'lov tizimi
"""
import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from core.jwt import get_current_user
from database import get_db, get_plan
from config import PLANS

router = APIRouter(prefix="/api/payments", tags=["payments"])


class CheckoutRequest(BaseModel):
    plan:        str
    success_url: str = "https://aloneai.uz/premium?success=1"
    cancel_url:  str = "https://aloneai.uz/premium?cancel=1"


@router.get("/plans")
async def get_plans():
    return {"plans": PLANS}


@router.get("/my-plan")
async def my_plan(current: dict = Depends(get_current_user)):
    plan = get_plan(current["user_id"])
    return {
        "plan": plan,
        "info": PLANS.get(plan, PLANS["free"]),
    }


@router.post("/checkout")
async def create_checkout(body: CheckoutRequest, current: dict = Depends(get_current_user)):
    stripe_key = os.getenv("STRIPE_SECRET_KEY", "")
    if not stripe_key:
        raise HTTPException(500, "To'lov tizimi sozlanmagan")

    if body.plan not in ("pro", "premium"):
        raise HTTPException(400, f"Noto'g'ri plan: {body.plan}")

    price_ids = {
        "pro":     os.getenv("STRIPE_PRICE_PRO", ""),
        "premium": os.getenv("STRIPE_PRICE_PREMIUM", ""),
    }
    price_id = price_ids.get(body.plan)
    if not price_id:
        raise HTTPException(400, f"Plan narxi sozlanmagan: {body.plan}")

    try:
        import stripe
        stripe.api_key = stripe_key

        with get_db() as conn:
            user = conn.execute(
                "SELECT email FROM users WHERE id=?", (current["user_id"],)
            ).fetchone()

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            customer_email=user["email"] if user else None,
            success_url=body.success_url,
            cancel_url=body.cancel_url,
            metadata={
                "user_id": str(current["user_id"]),
                "plan":    body.plan,
            },
        )
        return {"checkout_url": session.url}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Checkout xato: {e}")


@router.get("/history")
async def payment_history(current: dict = Depends(get_current_user)):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM subscriptions WHERE user_id=? ORDER BY started_at DESC",
            (current["user_id"],)
        ).fetchall()
    return [dict(r) for r in rows]