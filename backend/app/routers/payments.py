"""
backend/app/routers/payments.py — Stripe to'lovlar
"""
import os
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from core.jwt import get_current_user
from database import get_db, set_plan

router = APIRouter()

STRIPE_KEY     = os.getenv("STRIPE_SECRET_KEY", "")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

PRICE_IDS = {
    "pro":     os.getenv("STRIPE_PRICE_PRO", ""),
    "premium": os.getenv("STRIPE_PRICE_PREMIUM", ""),
}


class CheckoutRequest(BaseModel):
    plan:        str
    success_url: str = "https://aloneai.uz/premium?success=1"
    cancel_url:  str = "https://aloneai.uz/premium?cancel=1"


@router.post("/checkout")
async def create_checkout(body: CheckoutRequest, current: dict = Depends(get_current_user)):
    if not STRIPE_KEY:
        raise HTTPException(500, "To'lov tizimi sozlanmagan")
    if body.plan not in PRICE_IDS:
        raise HTTPException(400, "Plan noto'g'ri")

    try:
        import stripe
        stripe.api_key = STRIPE_KEY

        with get_db() as conn:
            user = conn.execute("SELECT email FROM users WHERE id=?", (current["user_id"],)).fetchone()

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{"price": PRICE_IDS[body.plan], "quantity": 1}],
            customer_email=user["email"],
            success_url=body.success_url,
            cancel_url=body.cancel_url,
            metadata={"user_id": str(current["user_id"]), "plan": body.plan}
        )
        return {"checkout_url": session.url}
    except Exception as e:
        raise HTTPException(500, f"Checkout xato: {e}")


@router.post("/webhook")
async def stripe_webhook(request: Request):
    import stripe
    stripe.api_key = STRIPE_KEY

    payload   = await request.body()
    sig       = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(payload, sig, WEBHOOK_SECRET)
    except Exception as e:
        raise HTTPException(400, f"Webhook xato: {e}")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = int(session["metadata"]["user_id"])
        plan    = session["metadata"]["plan"]
        set_plan(user_id, plan)
        with get_db() as conn:
            conn.execute(
                "INSERT INTO subscriptions (user_id, plan, stripe_sub_id, status) VALUES (?,?,?,'active')",
                (user_id, plan, session.get("subscription", ""))
            )

    elif event["type"] == "customer.subscription.deleted":
        sub = event["data"]["object"]
        with get_db() as conn:
            conn.execute(
                "UPDATE subscriptions SET status='cancelled' WHERE stripe_sub_id=?",
                (sub["id"],)
            )
            row = conn.execute(
                "SELECT user_id FROM subscriptions WHERE stripe_sub_id=?", (sub["id"],)
            ).fetchone()
            if row:
                set_plan(row["user_id"], "free")

    return {"received": True}


@router.get("/my-subscription")
async def my_subscription(current: dict = Depends(get_current_user)):
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM subscriptions WHERE user_id=? AND status='active' ORDER BY started_at DESC LIMIT 1",
            (current["user_id"],)
        ).fetchone()
    return dict(row) if row else {"plan": "free", "status": "none"}