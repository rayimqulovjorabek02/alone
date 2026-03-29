"""
backend/app/routers/image_router.py — Rasm generatsiya
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from core.jwt import get_current_user
from core.image_gen import generate_image, STYLE_PROMPTS
from database import get_usage, increment_usage, get_plan, get_db
from config import PLANS

router = APIRouter(prefix="/api/image", tags=["image"])


class ImageRequest(BaseModel):
    prompt: str
    style:  str = "realistic"


def _ensure_image_b64_column():
    """image_history jadvaliga image_b64 ustunini qo'shish (migration)."""
    try:
        with get_db() as conn:
            cols = [r[1] for r in conn.execute("PRAGMA table_info(image_history)").fetchall()]
            if "image_b64" not in cols:
                conn.execute("ALTER TABLE image_history ADD COLUMN image_b64 TEXT")
                print("[Image] image_b64 ustuni qo'shildi")
    except Exception as e:
        print(f"[Image] Migration xato: {e}")

# Server ishga tushganda migration
_ensure_image_b64_column()


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

    image_b64 = result.get("image_b64", "")
    engine    = result.get("engine", "")

    # To'liq base64 ni saqlash
    with get_db() as conn:
        conn.execute(
            "INSERT INTO image_history (user_id, prompt, url, model, image_b64) VALUES (?,?,?,?,?)",
            (uid, body.prompt, body.style, engine, image_b64)
        )

    return {
        "image_b64": image_b64,
        "engine":    engine,
        "prompt":    body.prompt,
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
            """SELECT id, prompt, url as style, model, image_b64, created_at
               FROM image_history
               WHERE user_id = ?
               ORDER BY created_at DESC
               LIMIT 20""",
            (current["user_id"],)
        ).fetchall()
    return [dict(r) for r in rows]


@router.delete("/history/{image_id}")
async def delete_image(image_id: int, current: dict = Depends(get_current_user)):
    with get_db() as conn:
        conn.execute(
            "DELETE FROM image_history WHERE id = ? AND user_id = ?",
            (image_id, current["user_id"])
        )
    return {"ok": True}