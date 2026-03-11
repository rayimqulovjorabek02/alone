"""
backend/app/routers/image.py — Rasm generatsiya
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from core.jwt import get_current_user
from core.image_gen import generate_image, sanitize_prompt, STYLE_PROMPTS
from database import get_usage, increment_usage, get_plan, get_db
from config import PLANS

router = APIRouter(prefix="/api/image", tags=["image"])


class ImageRequest(BaseModel):
    prompt: str
    style:  str = "realistic"

    @field_validator("prompt")
    @classmethod
    def validate_prompt(cls, v):
        if not v or not v.strip():
            raise ValueError("Prompt kerak")
        if len(v) > 500:
            raise ValueError("Prompt 500 belgidan oshmasin")
        return v.strip()

    @field_validator("style")
    @classmethod
    def validate_style(cls, v):
        allowed = list(STYLE_PROMPTS.keys())
        return v if v in allowed else "realistic"


@router.post("/generate")
async def gen_image(body: ImageRequest, current: dict = Depends(get_current_user)):
    # Sanitize
    clean_prompt, is_blocked = sanitize_prompt(body.prompt)
    if is_blocked:
        raise HTTPException(400, "Bu turdagi rasm yaratish mumkin emas")

    # Plan limiti
    plan  = get_plan(current["user_id"])
    limit = PLANS[plan]["limits"]["images"]
    usage = get_usage(current["user_id"], "images")
    if usage >= limit:
        raise HTTPException(429, f"Kunlik rasm limiti ({limit} ta) tugadi")

    result = await generate_image(clean_prompt, body.style)
    if "error" in result:
        raise HTTPException(500, result["error"])

    increment_usage(current["user_id"], "images")

    # Tarixga saqlash
    try:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO image_history (user_id, prompt, url, model) VALUES (?,?,?,?)",
                (current["user_id"], body.prompt,
                 result.get("image_b64", "")[:500000], result.get("engine", ""))
            )
            conn.commit()
    except Exception as e:
        print(f"[Image] Tarix saqlashda xato: {e}")

    return {
        "image_b64": result.get("image_b64"),
        "engine":    result.get("engine"),
        "prompt":    result.get("prompt"),
        "usage":     usage + 1,
        "limit":     limit,
    }


@router.get("/styles")
async def get_styles():
    return [{"id": k, "name": k.capitalize()} for k in STYLE_PROMPTS.keys()]


@router.get("/history")
async def image_history(current: dict = Depends(get_current_user)):
    try:
        with get_db() as conn:
            rows = conn.execute(
                "SELECT id, prompt, model, created_at FROM image_history WHERE user_id=? ORDER BY created_at DESC LIMIT 20",
                (current["user_id"],)
            ).fetchall()
        return [dict(r) for r in rows]
    except Exception:
        return []