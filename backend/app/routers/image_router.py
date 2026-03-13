"""
backend/app/routers/image_router.py — Rasm generatsiya
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from core.jwt import get_current_user
from core.image_gen import generate_image, STYLE_PROMPTS
from database import get_usage, increment_usage, get_plan, get_db
from config import PLANS

router = APIRouter(prefix="/api/image", tags=["image"])


class ImageRequest(BaseModel):
    prompt: str
    style:  str = "realistic"


@router.post("/generate")
async def generate(body: ImageRequest, current: dict = Depends(get_current_user)):
    if not body.prompt.strip():
        raise HTTPException(400, "Prompt kerak")

    uid   = current["user_id"]
    plan  = get_plan(uid)
    limit = PLANS[plan]["limits"]["images"]
    usage = get_usage(uid, "images")

    if usage >= limit:
        raise HTTPException(429, f"Kunlik rasm limiti ({limit} ta) tugadi")

    result = await generate_image(body.prompt, body.style)

    if "error" in result:
        raise HTTPException(500, result["error"])

    increment_usage(uid, "images")

    with get_db() as conn:
        conn.execute(
            "INSERT INTO image_history (user_id, prompt, url, model) VALUES (?,?,?,?)",
            (uid, body.prompt, result.get("image_b64", "")[:100], result.get("engine", ""))
        )

    return {
        "image_b64": result.get("image_b64"),
        "engine":    result.get("engine"),
        "prompt":    result.get("prompt"),
        "usage":     usage + 1,
        "limit":     limit,
    }


@router.get("/styles")
async def get_styles():
    return {"styles": list(STYLE_PROMPTS.keys())}


@router.get("/history")
async def image_history(current: dict = Depends(get_current_user)):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, prompt, model, created_at FROM image_history WHERE user_id=? ORDER BY created_at DESC LIMIT 20",
            (current["user_id"],)
        ).fetchall()
    return [dict(r) for r in rows]