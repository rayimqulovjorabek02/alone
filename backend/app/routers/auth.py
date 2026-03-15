"""
backend/app/routers/auth.py
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, EmailStr, field_validator
from passlib.context import CryptContext
from database import get_user_by_email, create_user, get_db
from core.jwt import create_access_token, create_refresh_token, decode_token, get_current_user
from core.rate_limiter import rate_limit

router = APIRouter(prefix="/api/auth", tags=["auth"])
pwd    = CryptContext(schemes=["bcrypt"])


class RegisterRequest(BaseModel):
    username: str
    email:    EmailStr
    password: str
    avatar:   str = "bot"

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Username kamida 2 ta harf")
        if len(v) > 30:
            raise ValueError("Username 30 ta belgidan oshmasin")
        return v

    @field_validator("password")
    @classmethod
    def password_strong(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Parol kamida 8 ta belgi bo'lishi kerak")
        if not any(c.isdigit() for c in v):
            raise ValueError("Parolda kamida 1 ta raqam bo'lishi kerak")
        if not any(c.isalpha() for c in v):
            raise ValueError("Parolda kamida 1 ta harf bo'lishi kerak")
        return v


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


# ── Endpointlar ───────────────────────────────────────────────

@router.post("/register")
async def register(
    body: RegisterRequest,
    _=Depends(rate_limit("register")),   # 3 urinish/soat
):
    if get_user_by_email(body.email):
        raise HTTPException(400, "Bu email allaqachon ro'yxatdan o'tgan")
    uid = create_user(
        body.username,
        body.email,
        pwd.hash(body.password),
        body.avatar,
    )
    return {"success": True, "message": "Ro'yxatdan o'tildi", "user_id": uid}


@router.post("/login")
async def login(
    body: LoginRequest,
    _=Depends(rate_limit("login")),      # 5 urinish/5 daqiqa
):
    user = get_user_by_email(body.email)
    # Constant-time compare — timing attack dan himoya
    if not user:
        pwd.hash("dummy")               # timing side-channel oldini olish
        raise HTTPException(401, "Email yoki parol noto'g'ri")
    if not pwd.verify(body.password, user["password"]):
        raise HTTPException(401, "Email yoki parol noto'g'ri")
    if not user["is_active"]:
        raise HTTPException(403, "Hisob bloklangan")

    # Oxirgi kirish vaqtini yangilash
    with get_db() as conn:
        import time
        conn.execute(
            "UPDATE users SET last_login=? WHERE id=?",
            (time.time(), user["id"])
        )
        conn.commit()

    return {
        "access_token":  create_access_token(user["id"], user["username"], bool(user["is_admin"])),
        "refresh_token": create_refresh_token(user["id"]),
        "token_type":    "bearer",
        "user": {
            "id":       user["id"],
            "username": user["username"],
            "email":    user["email"],
            "avatar":   user["avatar"],
            "plan":     user["plan"],
            "is_admin": bool(user["is_admin"]),
        },
    }


@router.post("/refresh")
async def refresh(body: RefreshRequest):
    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(401, "Refresh token kerak")
    with get_db() as conn:
        user = conn.execute(
            "SELECT * FROM users WHERE id=? AND is_active=1",
            (payload["user_id"],)
        ).fetchone()
    if not user:
        raise HTTPException(401, "Foydalanuvchi topilmadi yoki bloklangan")
    return {
        "access_token": create_access_token(user["id"], user["username"], bool(user["is_admin"])),
        "token_type":   "bearer",
    }


@router.get("/me")
async def get_me(current: dict = Depends(get_current_user)):
    with get_db() as conn:
        user = conn.execute(
            "SELECT id, username, email, avatar, plan, is_admin, created_at FROM users WHERE id=?",
            (current["user_id"],)
        ).fetchone()
    if not user:
        raise HTTPException(404, "Topilmadi")
    return {
        "id":         user["id"],
        "username":   user["username"],
        "email":      user["email"],
        "avatar":     user["avatar"],
        "plan":       user["plan"],
        "is_admin":   bool(user["is_admin"]),
        "created_at": user["created_at"],
    }