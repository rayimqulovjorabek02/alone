"""
backend/app/core/image_gen.py
Rasm generatsiya — sanitize va xavfli prompt tekshiruvi bilan
"""
import os
import re
import httpx
import base64

HUGGINGFACE_KEY = os.getenv("HUGGINGFACE_API_KEY", "")

STYLE_PROMPTS = {
    "realistic":  "photorealistic, 8k, detailed, professional photography",
    "anime":      "anime style, manga, vibrant colors, Studio Ghibli",
    "art":        "digital art, concept art, artistic, detailed illustration",
    "cartoon":    "cartoon style, colorful, fun, animated",
    "sketch":     "pencil sketch, black and white, hand drawn",
    "cinematic":  "cinematic, movie still, dramatic lighting, film grain",
    "3d":         "3D render, octane render, blender, highly detailed",
    "watercolor": "watercolor painting, soft colors, artistic",
    "oil":        "oil painting, classical art, canvas texture",
    "pixel":      "pixel art, 8-bit, retro game style",
}

# Taqiqlangan so'zlar
BLOCKED_WORDS = [
    "nude", "naked", "nsfw", "porn", "sex", "explicit",
    "violence", "gore", "blood", "kill", "terrorist",
    "yalang'och", "zo'rlash", "qon",
]


def sanitize_prompt(prompt: str) -> tuple[str, bool]:
    """
    Promptni tozalash va xavfliligini tekshirish.
    Qaytaradi: (tozalangan_prompt, xavflimi)
    """
    if not prompt:
        return "", True

    # Uzunlikni cheklash
    prompt = prompt[:500].strip()

    # Maxsus belgilarni tozalash
    prompt = re.sub(r"[<>{}\[\]|]", "", prompt)

    # Taqiqlangan so'zlar
    p_lower = prompt.lower()
    for word in BLOCKED_WORDS:
        if word in p_lower:
            return prompt, True

    return prompt, False


async def generate_image(prompt: str, style: str = "realistic") -> dict:
    # Sanitize
    clean_prompt, is_blocked = sanitize_prompt(prompt)
    if is_blocked:
        return {"error": "Bu turdagi rasm yaratish mumkin emas"}

    # Style validatsiya
    if style not in STYLE_PROMPTS:
        style = "realistic"

    style_suffix = STYLE_PROMPTS[style]
    full_prompt  = f"{clean_prompt}, {style_suffix}"

    # 1. HuggingFace
    if HUGGINGFACE_KEY:
        result = await _huggingface(full_prompt)
        if result:
            return {"image_b64": result, "engine": "huggingface", "prompt": full_prompt}

    # 2. Pollinations (bepul fallback)
    result = await _pollinations(full_prompt)
    if result:
        return {"image_b64": result, "engine": "pollinations", "prompt": full_prompt}

    return {"error": "Rasm generatsiya ishlamadi, keyinroq urinib ko'ring"}


async def _huggingface(prompt: str) -> str | None:
    models = [
        "stabilityai/stable-diffusion-xl-base-1.0",
        "runwayml/stable-diffusion-v1-5",
    ]
    for model in models:
        try:
            async with httpx.AsyncClient(timeout=60) as c:
                r = await c.post(
                    f"https://router.huggingface.co/hf-inference/models/{model}",
                    headers={"Authorization": f"Bearer {HUGGINGFACE_KEY}"},
                    json={"inputs": prompt},
                )
                if r.status_code == 200 and len(r.content) > 1000:
                    return base64.b64encode(r.content).decode()
        except Exception as e:
            print(f"[Image] HuggingFace {model} xato: {e}")
    return None


async def _pollinations(prompt: str) -> str | None:
    try:
        safe = prompt.replace(" ", "%20")[:300]
        url  = f"https://image.pollinations.ai/prompt/{safe}?width=1024&height=1024&nologo=true"
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.get(url)
            if r.status_code == 200 and len(r.content) > 1000:
                return base64.b64encode(r.content).decode()
    except Exception as e:
        print(f"[Image] Pollinations xato: {e}")
    return None