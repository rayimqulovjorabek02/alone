"""
backend/app/routers/auth_security.py — Parol reset, email tasdiqlash
"""
import random
import string
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from database import get_db, get_user_by_email
from core.email_sender import send_verification_code
from core.jwt import get_current_user

router = APIRouter()
pwd    = CryptContext(schemes=["bcrypt"])

# Vaqtinchalik kodlar xotirasi
_codes: dict = {}  # email -> {code, expires}


def _gen_code(length=6) -> str:
    return "".join(random.choices(string.digits, k=length))


class ForgotRequest(BaseModel):
    email: EmailStr

class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code:  str

class NewPasswordRequest(BaseModel):
    email:    EmailStr
    code:     str
    password: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


@router.post("/forgot-password")
async def forgot_password(body: ForgotRequest):
    user = get_user_by_email(body.email)
    if not user:
        # Xavfsizlik uchun xato qaytarmaymiz
        return {"message": "Agar email mavjud bo'lsa, kod yuborildi"}
    code    = _gen_code()
    expires = datetime.utcnow() + timedelta(minutes=10)
    _codes[body.email] = {"code": code, "expires": expires}
    send_verification_code(body.email, code, user["username"])
    return {"message": "Tasdiqlash kodi emailga yuborildi"}


@router.post("/verify-code")
async def verify_code(body: VerifyCodeRequest):
    entry = _codes.get(body.email)
    if not entry:
        raise HTTPException(400, "Kod topilmadi. Qaytadan so'rang")
    if datetime.utcnow() > entry["expires"]:
        _codes.pop(body.email, None)
        raise HTTPException(400, "Kod muddati tugagan")
    if entry["code"] != body.code:
        raise HTTPException(400, "Noto'g'ri kod")
    return {"success": True, "message": "Kod tasdiqlandi"}


@router.post("/reset-password")
async def reset_password(body: NewPasswordRequest):
    entry = _codes.get(body.email)
    if not entry or entry["code"] != body.code:
        raise HTTPException(400, "Kod noto'g'ri yoki muddati tugagan")
    if datetime.utcnow() > entry["expires"]:
        raise HTTPException(400, "Kod muddati tugagan")
    if len(body.password) < 6:
        raise HTTPException(400, "Parol kamida 6 ta belgi")
    with get_db() as conn:
        conn.execute(
            "UPDATE users SET password=? WHERE email=?",
            (pwd.hash(body.password), body.email)
        )
    _codes.pop(body.email, None)
    return {"success": True, "message": "Parol muvaffaqiyatli o'zgartirildi"}


@router.post("/change-password")
async def change_password(body: ChangePasswordRequest, current: dict = Depends(get_current_user)):
    with get_db() as conn:
        user = conn.execute("SELECT * FROM users WHERE id=?", (current["user_id"],)).fetchone()
    if not user or not pwd.verify(body.old_password, user["password"]):
        raise HTTPException(400, "Joriy parol noto'g'ri")
    if len(body.new_password) < 6:
        raise HTTPException(400, "Yangi parol kamida 6 ta belgi")
    with get_db() as conn:
        conn.execute("UPDATE users SET password=? WHERE id=?", (pwd.hash(body.new_password), current["user_id"]))
    return {"success": True, "message": "Parol o'zgartirildi"}