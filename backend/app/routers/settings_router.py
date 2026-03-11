"""
backend/app/routers/settings_router.py — Foydalanuvchi sozlamalari
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from core.jwt import get_current_user
from database import get_settings, update_settings
from core.cache import invalidate_settings

router = APIRouter(prefix="/api/settings", tags=["settings"])


class SettingsUpdate(BaseModel):
    name:        Optional[str]   = None
    language:    Optional[str]   = None
    ai_style:    Optional[str]   = None
    theme:       Optional[str]   = None
    temperature: Optional[float] = None
    tts_voice:   Optional[str]   = None


@router.get("")
async def get_user_settings(current: dict = Depends(get_current_user)):
    s = get_settings(current["user_id"]) or {}
    return {
        "name":        s.get("name", ""),
        "language":    s.get("language", "uz"),
        "ai_style":    s.get("ai_style", "friendly"),
        "theme":       s.get("theme", "dark"),
        "temperature": s.get("temperature", 0.7),
        "tts_voice":   s.get("tts_voice", "default"),
    }


@router.put("")
async def save_settings(body: SettingsUpdate, current: dict = Depends(get_current_user)):
    data = body.dict(exclude_none=True)
    if data:
        update_settings(current["user_id"], data)
        invalidate_settings(current["user_id"])
    return {"success": True, "saved": data}