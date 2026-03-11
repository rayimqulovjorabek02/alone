"""
backend/app/routers/two_factor_router.py — 2FA endpoint lari
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from core.jwt import get_current_user
from core.two_factor import (
    generate_secret, get_qr_code, verify_totp,
    enable_2fa, disable_2fa, is_2fa_enabled,
)

router = APIRouter(prefix="/api/profile/2fa", tags=["2FA"])


class CodeRequest(BaseModel):
    code: str


@router.get("/status")
async def get_2fa_status(user=Depends(get_current_user)):
    """2FA holati."""
    return {"enabled": is_2fa_enabled(user["user_id"])}


@router.post("/setup")
async def setup_2fa(user=Depends(get_current_user)):
    """
    2FA sozlashni boshlash.
    Secret yaratib QR kod qaytaradi.
    """
    uid    = user["user_id"]
    email  = user.get("email", "user@aloneai.uz")
    secret = generate_secret(uid)
    qr     = get_qr_code(uid, email)
    return {
        "secret":  secret,
        "qr_code": qr,         # base64 PNG
    }


@router.post("/enable")
async def enable_2fa_endpoint(data: CodeRequest, user=Depends(get_current_user)):
    """2FA ni faollashtirish (kod to'g'ri bo'lsa)."""
    success = enable_2fa(user["user_id"], data.code)
    if not success:
        raise HTTPException(400, "Kod noto'g'ri yoki muddati o'tgan")
    return {"enabled": True}


@router.post("/verify")
async def verify_2fa_endpoint(data: CodeRequest, user=Depends(get_current_user)):
    """Login vaqtida TOTP kodni tekshirish."""
    valid = verify_totp(user["user_id"], data.code)
    if not valid:
        raise HTTPException(400, "Kod noto'g'ri")
    return {"valid": True}


@router.post("/disable")
async def disable_2fa_endpoint(user=Depends(get_current_user)):
    """2FA ni o'chirish."""
    disable_2fa(user["user_id"])
    return {"enabled": False}