"""
backend/app/routers/payments.py — To'lov tizimi (Stripe + Payme + Click)
"""
import hmac
import hashlib
import json
import time
import sqlite3
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from pydantic import BaseModel
from typing import Optional
from core.jwt import get_current_user
from config import (
    STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_PRO, STRIPE_PRICE_PREMIUM, DB_PATH,
)

router = APIRouter(prefix="/api/payments", tags=["Payments"])


# ════════════════════════════════════════════════════════════
#   STRIPE
# ════════════════════════════════════════════════════════════

class StripeCheckoutRequest(BaseModel):
    plan: str          # "pro" | "premium"
    success_url: str
    cancel_url:  str


@router.post("/stripe/checkout")
async def stripe_checkout(data: StripeCheckoutRequest, user=Depends(get_current_user)):
    """Stripe to'lov sessiyasi yaratish."""
    if not STRIPE_SECRET_KEY:
        raise HTTPException(400, "Stripe sozlanmagan")

    try:
        import stripe
        stripe.api_key = STRIPE_SECRET_KEY
    except ImportError:
        raise HTTPException(500, "stripe kutubxonasi o'rnatilmagan")

    price_id = STRIPE_PRICE_PRO if data.plan == "pro" else STRIPE_PRICE_PREMIUM
    if not price_id:
        raise HTTPException(400, f"'{data.plan}' uchun narx ID sozlanmagan")

    session = stripe.checkout.Session.create(
        payment_method_types = ["card"],
        mode                 = "subscription",
        line_items           = [{"price": price_id, "quantity": 1}],
        success_url          = data.success_url + "?session_id={CHECKOUT_SESSION_ID}",
        cancel_url           = data.cancel_url,
        metadata             = {"user_id": str(user["user_id"]), "plan": data.plan},
        customer_email       = user.get("email"),
    )
    return {"checkout_url": session.url, "session_id": session.id}


@router.post("/stripe/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
):
    """Stripe webhook — to'lov natijasini qabul qilish."""
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(400, "Webhook secret sozlanmagan")

    body = await request.body()

    try:
        import stripe
        stripe.api_key = STRIPE_SECRET_KEY
        event = stripe.Webhook.construct_event(body, stripe_signature, STRIPE_WEBHOOK_SECRET)
    except Exception as e:
        raise HTTPException(400, f"Webhook xato: {e}")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        uid     = int(session["metadata"].get("user_id", 0))
        plan    = session["metadata"].get("plan", "pro")
        sub_id  = session.get("subscription", "")
        _upgrade_user(uid, plan, sub_id, "stripe")

    elif event["type"] in ("customer.subscription.deleted", "customer.subscription.paused"):
        sub = event["data"]["object"]
        _downgrade_by_subscription(sub["id"])

    return {"received": True}


@router.get("/stripe/status")
async def stripe_status(user=Depends(get_current_user)):
    """Foydalanuvchi obuna holati."""
    with sqlite3.connect(DB_PATH) as db:
        db.row_factory = sqlite3.Row
        row = db.execute(
            "SELECT * FROM subscriptions WHERE user_id=? AND status='active' ORDER BY created_at DESC LIMIT 1",
            (user["user_id"],)
        ).fetchone()
    return dict(row) if row else {"status": "none"}


# ════════════════════════════════════════════════════════════
#   PAYME (O'zbekiston)
# ════════════════════════════════════════════════════════════

PAYME_KEY = "your_payme_key"   # config.py dan olish

PLANS_UZS = {
    "pro":     49000_00,   # tiyin (49,000 so'm)
    "premium": 99000_00,   # tiyin (99,000 so'm)
}


class PaymeRequest(BaseModel):
    method:  str
    params:  dict
    id:      int


def _payme_error(code: int, msg: str, req_id: int):
    return {"jsonrpc": "2.0", "id": req_id, "error": {"code": code, "message": {"ru": msg, "uz": msg, "en": msg}}}


@router.post("/payme/webhook")
async def payme_webhook(request: Request):
    """Payme JSON-RPC webhook."""
    # Payme Authorization tekshirish
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Basic "):
        raise HTTPException(401, "Unauthorized")

    import base64
    try:
        decoded = base64.b64decode(auth[6:]).decode()
        _, key  = decoded.split(":", 1)
        if key != PAYME_KEY:
            raise HTTPException(401, "Noto'g'ri kalit")
    except Exception:
        raise HTTPException(401, "Unauthorized")

    body = await request.json()
    method = body.get("method", "")
    params = body.get("params", {})
    req_id = body.get("id", 0)

    if method == "CheckPerformTransaction":
        amount  = params.get("amount", 0)
        account = params.get("account", {})
        plan    = account.get("plan", "")
        uid     = int(account.get("user_id", 0))

        if plan not in PLANS_UZS:
            return _payme_error(-31050, "Noto'g'ri plan", req_id)
        if amount != PLANS_UZS[plan]:
            return _payme_error(-31001, "Noto'g'ri summa", req_id)
        if not _user_exists(uid):
            return _payme_error(-31050, "Foydalanuvchi topilmadi", req_id)

        return {"jsonrpc": "2.0", "id": req_id, "result": {"allow": True}}

    elif method == "CreateTransaction":
        txn_id  = params.get("id")
        amount  = params.get("amount", 0)
        account = params.get("account", {})
        plan    = account.get("plan", "")
        uid     = int(account.get("user_id", 0))

        _save_payme_txn(txn_id, uid, plan, amount, "created")
        return {
            "jsonrpc": "2.0", "id": req_id,
            "result": {
                "create_time": int(time.time() * 1000),
                "transaction":  txn_id,
                "state":        1,
            }
        }

    elif method == "PerformTransaction":
        txn_id = params.get("id")
        txn    = _get_payme_txn(txn_id)
        if not txn:
            return _payme_error(-31003, "Tranzaksiya topilmadi", req_id)

        _update_payme_txn(txn_id, "performed")
        _upgrade_user(txn["user_id"], txn["plan"], txn_id, "payme")

        return {
            "jsonrpc": "2.0", "id": req_id,
            "result": {
                "perform_time": int(time.time() * 1000),
                "transaction":  txn_id,
                "state":        2,
            }
        }

    elif method == "CancelTransaction":
        txn_id = params.get("id")
        _update_payme_txn(txn_id, "cancelled")
        return {
            "jsonrpc": "2.0", "id": req_id,
            "result": {
                "cancel_time": int(time.time() * 1000),
                "transaction": txn_id,
                "state":      -1,
            }
        }

    elif method == "CheckTransaction":
        txn_id = params.get("id")
        txn    = _get_payme_txn(txn_id)
        if not txn:
            return _payme_error(-31003, "Topilmadi", req_id)

        state_map = {"created": 1, "performed": 2, "cancelled": -1}
        return {
            "jsonrpc": "2.0", "id": req_id,
            "result": {
                "create_time":  int(txn["created_at"] * 1000),
                "perform_time": int(txn["updated_at"] * 1000) if txn["status"] == "performed" else 0,
                "cancel_time":  int(txn["updated_at"] * 1000) if txn["status"] == "cancelled" else 0,
                "transaction":  txn_id,
                "state":        state_map.get(txn["status"], 1),
                "reason":       None,
            }
        }

    return _payme_error(-32601, "Noma'lum metod", req_id)


# ════════════════════════════════════════════════════════════
#   CLICK (O'zbekiston)
# ════════════════════════════════════════════════════════════

CLICK_SECRET    = "your_click_secret"     # config.py dan
CLICK_MERCHANT  = "your_merchant_id"


class ClickPrepareRequest(BaseModel):
    click_trans_id:    int
    service_id:        int
    click_paydoc_id:   int
    merchant_trans_id: str
    amount:            float
    action:            int
    error:             int
    error_note:        str
    sign_time:         str
    sign_string:       str


@router.post("/click/prepare")
async def click_prepare(data: ClickPrepareRequest):
    """Click Prepare — to'lovni tekshirish."""
    # Imzo tekshirish
    sign = hashlib.md5(
        f"{data.click_trans_id}{data.service_id}{CLICK_SECRET}{data.merchant_trans_id}{data.amount}{data.action}{data.sign_time}".encode()
    ).hexdigest()

    if sign != data.sign_string:
        return {"error": -1, "error_note": "Noto'g'ri imzo"}

    # merchant_trans_id = "user_id:plan"
    try:
        uid_str, plan = data.merchant_trans_id.split(":")
        uid = int(uid_str)
    except Exception:
        return {"error": -5, "error_note": "Noto'g'ri ma'lumot"}

    if plan not in PLANS_UZS:
        return {"error": -5, "error_note": "Noto'g'ri plan"}

    expected = PLANS_UZS[plan] / 100  # so'm
    if abs(data.amount - expected) > 1:
        return {"error": -2, "error_note": "Noto'g'ri summa"}

    if not _user_exists(uid):
        return {"error": -5, "error_note": "Foydalanuvchi topilmadi"}

    _save_click_txn(data.click_trans_id, uid, plan, data.amount, "prepared")

    return {
        "click_trans_id":    data.click_trans_id,
        "merchant_trans_id": data.merchant_trans_id,
        "merchant_prepare_id": data.click_trans_id,
        "error":             0,
        "error_note":        "Success",
    }


@router.post("/click/complete")
async def click_complete(data: ClickPrepareRequest):
    """Click Complete — to'lovni yakunlash."""
    sign = hashlib.md5(
        f"{data.click_trans_id}{data.service_id}{CLICK_SECRET}{data.merchant_trans_id}{data.click_paydoc_id}{data.amount}{data.action}{data.sign_time}".encode()
    ).hexdigest()

    if sign != data.sign_string:
        return {"error": -1, "error_note": "Noto'g'ri imzo"}

    if data.error < 0:
        _update_click_txn(data.click_trans_id, "cancelled")
        return {"error": 0, "error_note": "Cancelled"}

    txn = _get_click_txn(data.click_trans_id)
    if not txn:
        return {"error": -6, "error_note": "Tranzaksiya topilmadi"}

    _update_click_txn(data.click_trans_id, "completed")
    _upgrade_user(txn["user_id"], txn["plan"], str(data.click_trans_id), "click")

    return {
        "click_trans_id":    data.click_trans_id,
        "merchant_trans_id": data.merchant_trans_id,
        "error":             0,
        "error_note":        "Success",
    }


# ════════════════════════════════════════════════════════════
#   Umumiy endpointlar
# ════════════════════════════════════════════════════════════

@router.get("/plans")
async def get_plans():
    """Mavjud tariflar."""
    return {
        "plans": [
            {
                "id":          "free",
                "name":        "Bepul",
                "price_uzs":   0,
                "price_usd":   0,
                "messages":    50,
                "images":      3,
                "features":    ["Chat", "Asosiy AI", "To'do & Eslatmalar"],
            },
            {
                "id":          "pro",
                "name":        "Pro",
                "price_uzs":   49000,
                "price_usd":   4,
                "messages":    500,
                "images":      20,
                "features":    ["Hamma bepul imkoniyatlar", "500 xabar/kun", "20 rasm/kun", "Ovozli chat", "Agent", "Fayl tahlili"],
                "popular":     True,
            },
            {
                "id":          "premium",
                "name":        "Premium",
                "price_uzs":   99000,
                "price_usd":   8,
                "messages":    -1,   # cheksiz
                "images":      -1,
                "features":    ["Hamma pro imkoniyatlar", "Cheksiz xabar & rasm", "GPT-4 darajali model", "Ustuvor qo'llab-quvvatlash", "2FA xavfsizlik"],
            },
        ]
    }


@router.post("/cancel")
async def cancel_subscription(user=Depends(get_current_user)):
    """Obunani bekor qilish."""
    uid = user["user_id"]

    with sqlite3.connect(DB_PATH) as db:
        sub = db.execute(
            "SELECT * FROM subscriptions WHERE user_id=? AND status='active' ORDER BY created_at DESC LIMIT 1",
            (uid,)
        ).fetchone()

    if not sub:
        raise HTTPException(400, "Faol obuna topilmadi")

    # Stripe da bekor qilish
    if sub[4] == "stripe" and STRIPE_SECRET_KEY:
        try:
            import stripe
            stripe.api_key = STRIPE_SECRET_KEY
            stripe.Subscription.cancel(sub[3])
        except Exception as e:
            print(f"Stripe cancel xato: {e}")

    _downgrade_user(uid)
    return {"cancelled": True}


# ════════════════════════════════════════════════════════════
#   Yordamchi funksiyalar
# ════════════════════════════════════════════════════════════

def _user_exists(uid: int) -> bool:
    with sqlite3.connect(DB_PATH) as db:
        return bool(db.execute("SELECT id FROM users WHERE id=?", (uid,)).fetchone())


def _upgrade_user(uid: int, plan: str, sub_id: str, provider: str):
    now = time.time()
    with sqlite3.connect(DB_PATH) as db:
        db.execute("UPDATE users SET plan=? WHERE id=?", (plan, uid))
        db.execute("""
            INSERT OR REPLACE INTO subscriptions
              (user_id, plan, subscription_id, provider, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'active', ?, ?)
        """, (uid, plan, sub_id, provider, now, now))
        db.execute(
            "INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
            (uid, "✅ Obuna faollashtirildi!", f"{plan.upper()} rejimi yoqildi.")
        )
        db.commit()


def _downgrade_user(uid: int):
    with sqlite3.connect(DB_PATH) as db:
        db.execute("UPDATE users SET plan='free' WHERE id=?", (uid,))
        db.execute(
            "UPDATE subscriptions SET status='cancelled', updated_at=? WHERE user_id=? AND status='active'",
            (time.time(), uid)
        )
        db.execute(
            "INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
            (uid, "ℹ️ Obuna bekor qilindi", "Bepul rejimga o'tdingiz.")
        )
        db.commit()


def _downgrade_by_subscription(sub_id: str):
    with sqlite3.connect(DB_PATH) as db:
        row = db.execute("SELECT user_id FROM subscriptions WHERE subscription_id=?", (sub_id,)).fetchone()
        if row:
            _downgrade_user(row[0])


# Payme helpers
def _save_payme_txn(txn_id, uid, plan, amount, status):
    now = time.time()
    with sqlite3.connect(DB_PATH) as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS payme_transactions (
                txn_id TEXT PRIMARY KEY, user_id INTEGER, plan TEXT,
                amount REAL, status TEXT, created_at REAL, updated_at REAL
            )
        """)
        db.execute(
            "INSERT OR IGNORE INTO payme_transactions VALUES (?,?,?,?,?,?,?)",
            (txn_id, uid, plan, amount, status, now, now)
        )
        db.commit()

def _get_payme_txn(txn_id):
    with sqlite3.connect(DB_PATH) as db:
        db.row_factory = sqlite3.Row
        r = db.execute("SELECT * FROM payme_transactions WHERE txn_id=?", (txn_id,)).fetchone()
        return dict(r) if r else None

def _update_payme_txn(txn_id, status):
    with sqlite3.connect(DB_PATH) as db:
        db.execute("UPDATE payme_transactions SET status=?, updated_at=? WHERE txn_id=?",
                   (status, time.time(), txn_id))
        db.commit()

# Click helpers
def _save_click_txn(txn_id, uid, plan, amount, status):
    now = time.time()
    with sqlite3.connect(DB_PATH) as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS click_transactions (
                txn_id INTEGER PRIMARY KEY, user_id INTEGER, plan TEXT,
                amount REAL, status TEXT, created_at REAL, updated_at REAL
            )
        """)
        db.execute("INSERT OR IGNORE INTO click_transactions VALUES (?,?,?,?,?,?,?)",
                   (txn_id, uid, plan, amount, status, now, now))
        db.commit()

def _get_click_txn(txn_id):
    with sqlite3.connect(DB_PATH) as db:
        db.row_factory = sqlite3.Row
        r = db.execute("SELECT * FROM click_transactions WHERE txn_id=?", (txn_id,)).fetchone()
        return dict(r) if r else None

def _update_click_txn(txn_id, status):
    with sqlite3.connect(DB_PATH) as db:
        db.execute("UPDATE click_transactions SET status=?, updated_at=? WHERE txn_id=?",
                   (status, time.time(), txn_id))
        db.commit()