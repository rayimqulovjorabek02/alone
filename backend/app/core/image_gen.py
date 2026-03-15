"""
backend/app/core/image_gen.py
Rasm generatsiya — sanitize va xavfli prompt tekshiruvi bilan
"""
import os
import re
import httpx
import base64

def _hf_key(): return os.getenv("HUGGINGFACE_API_KEY", "")

STYLE_PROMPTS = {
    "realistic":  "photorealistic, ultra 8k resolution, RAW photo, DSLR, sharp focus, detailed skin texture, professional photography, HDR, high dynamic range",
    "anime":      "anime style, manga, vibrant colors, Studio Ghibli, 4k, ultra detailed, sharp lines",
    "art":        "digital art, concept art, ultra detailed illustration, 4k, trending on ArtStation, masterpiece",
    "cartoon":    "cartoon style, colorful, fun, animated, sharp, vibrant, high quality",
    "sketch":     "pencil sketch, black and white, hand drawn, ultra detailed, fine lines, 4k",
    "cinematic":  "cinematic, movie still, dramatic lighting, film grain, 8k, anamorphic lens, ultra realistic",
    "3d":         "3D render, octane render, blender, ultra detailed, 8k, subsurface scattering, ray tracing",
    "watercolor": "watercolor painting, soft colors, artistic, 4k, ultra detailed, professional",
    "oil":        "oil painting, classical art, canvas texture, masterpiece, ultra detailed, 4k",
    "pixel":      "pixel art, 8-bit, retro game style, crisp, sharp pixels",
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
    if _hf_key():
        result = await _huggingface(full_prompt)
        if result:
            return {"image_b64": result, "engine": "huggingface", "prompt": full_prompt}

    # 2. Pollinations (bepul fallback)
    result = await _pollinations(full_prompt)
    if result:
        return {"image_b64": result, "engine": "pollinations", "prompt": full_prompt}

    return {"error": "Rasm generatsiya ishlamadi, keyinroq urinib ko'ring"}


async def _huggingface(prompt: str) -> str | None:
    key = _hf_key()
    if not key:
        return None
    models = [
        "black-forest-labs/FLUX.1-dev",
        "stabilityai/stable-diffusion-xl-base-1.0",
        "runwayml/stable-diffusion-v1-5",
    ]
    negative = "blurry, low quality, deformed, ugly, bad anatomy, watermark, text, logo, low resolution, pixelated, grainy, noisy, overexposed, underexposed, bad proportions, mutated hands, extra fingers, disfigured"
    for model in models:
        try:
            async with httpx.AsyncClient(timeout=90) as c:
                r = await c.post(
                    f"https://router.huggingface.co/hf-inference/models/{model}",
                    headers={"Authorization": f"Bearer {key}"},
                    json={
                        "inputs": prompt,
                        "parameters": {
                            "negative_prompt": negative,
                            "num_inference_steps": 30,
                            "guidance_scale": 7.5,
                            "width": 1024,
                            "height": 1024,
                        }
                    },
                )
                if r.status_code == 200 and len(r.content) > 1000:
                    print(f"[Image] HuggingFace {model} ishladi")
                    return base64.b64encode(r.content).decode()
                print(f"[Image] HuggingFace {model}: {r.status_code}")
        except Exception as e:
            print(f"[Image] HuggingFace {model} xato: {e}")
    return None


async def _pollinations(prompt: str) -> str | None:
    try:
        import urllib.parse
        safe = urllib.parse.quote(prompt[:400])
        url  = (
            f"https://image.pollinations.ai/prompt/{safe}"
            f"?width=1024&height=1024&model=flux-pro&nologo=true&enhance=true&safe=false&seed=-1"
        )
        async with httpx.AsyncClient(timeout=60) as c:
            r = await c.get(url)
            if r.status_code == 200 and len(r.content) > 1000:
                print("[Image] Pollinations ishladi")
                return base64.b64encode(r.content).decode()
        print(f"[Image] Pollinations: {r.status_code}")
    except Exception as e:
        print(f"[Image] Pollinations xato: {e}")
    return None