"""
backend/app/routers/auth.py
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from database import get_user_by_email, create_user, get_db
from core.jwt import create_access_token, create_refresh_token, decode_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])
pwd    = CryptContext(schemes=["bcrypt"])


class RegisterRequest(BaseModel):
    username: str
    email:    EmailStr
    password: str
    avatar:   str = "bot"

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/register")
async def register(body: RegisterRequest):
    if len(body.username) < 2:
        raise HTTPException(400, "Username kamida 2 ta harf")
    if len(body.password) < 6:
        raise HTTPException(400, "Parol kamida 6 ta belgi")
    if get_user_by_email(body.email):
        raise HTTPException(400, "Bu email allaqachon royxatdan otgan")
    uid = create_user(body.username, body.email, pwd.hash(body.password), body.avatar)
    return {"success": True, "message": "Royxatdan otildi", "user_id": uid}


@router.post("/login")
async def login(body: LoginRequest):
    user = get_user_by_email(body.email)
    if not user or not pwd.verify(body.password, user["password"]):
        raise HTTPException(401, "Email yoki parol notogri")
    if not user["is_active"]:
        raise HTTPException(403, "Hisob bloklangan")
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
        user = conn.execute("SELECT * FROM users WHERE id=?", (payload["user_id"],)).fetchone()
    if not user:
        raise HTTPException(401, "Foydalanuvchi topilmadi")
    return {
        "access_token": create_access_token(user["id"], user["username"], bool(user["is_admin"])),
        "token_type":   "bearer",
    }


@router.get("/me")
async def get_me(current: dict = Depends(get_current_user)):
    with get_db() as conn:
        user = conn.execute("SELECT * FROM users WHERE id=?", (current["user_id"],)).fetchone()
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