"""
backend/app/routers/profile_security.py — Profil, avatar, xotira
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional
import base64
from core.jwt import get_current_user
from core.memory_engine import get_all_memory, save_smart_memory, delete_memory_key, clear_all_memory
from database import get_db

router = APIRouter(prefix="/api/profile", tags=["profile"])


class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    avatar:   Optional[str] = None


class MemorySave(BaseModel):
    key:   str
    value: str


@router.get("")
async def get_profile(current: dict = Depends(get_current_user)):
    with get_db() as conn:
        user = conn.execute(
            "SELECT id, username, email, avatar, plan, created_at FROM users WHERE id=?",
            (current["user_id"],)
        ).fetchone()
    if not user:
        raise HTTPException(404, "Topilmadi")
    return dict(user)


@router.put("")
async def update_profile(body: ProfileUpdate, current: dict = Depends(get_current_user)):
    updates = {}
    if body.username and len(body.username) >= 2:
        updates["username"] = body.username
    if body.avatar:
        updates["avatar"] = body.avatar
    if not updates:
        raise HTTPException(400, "O'zgartirish uchun ma'lumot kerak")
    with get_db() as conn:
        sets = ", ".join(f"{k}=?" for k in updates)
        conn.execute(f"UPDATE users SET {sets} WHERE id=?", (*updates.values(), current["user_id"]))
    return {"success": True}


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current: dict = Depends(get_current_user)
):
    """Foydalanuvchi rasmini base64 sifatida saqlash."""
    # Faqat rasm fayllari
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "Faqat rasm fayllari qabul qilinadi")

    # Max 2MB
    content = await file.read()
    if len(content) > 2 * 1024 * 1024:
        raise HTTPException(400, "Rasm hajmi 2MB dan oshmasin")

    # Base64 ga o'girish
    b64 = base64.b64encode(content).decode()
    avatar_data = f"data:{file.content_type};base64,{b64}"

    # DB ga saqlash
    with get_db() as conn:
        conn.execute(
            "UPDATE users SET avatar=? WHERE id=?",
            (avatar_data, current["user_id"])
        )

    return {"success": True, "avatar": avatar_data}


@router.get("/memory")
async def get_memory_data(current: dict = Depends(get_current_user)):
    return get_all_memory(current["user_id"])


@router.post("/memory")
async def save_memory(body: MemorySave, current: dict = Depends(get_current_user)):
    return save_smart_memory(current["user_id"], body.key, body.value)


@router.delete("/memory/{key}")
async def delete_memory(key: str, current: dict = Depends(get_current_user)):
    delete_memory_key(current["user_id"], key)
    return {"success": True}


@router.delete("/memory")
async def clear_memory_all(current: dict = Depends(get_current_user)):
    clear_all_memory(current["user_id"])
    return {"success": True}