"""
backend/app/core/image_gen.py — Rasm generatsiya
"""
import os
import httpx
import base64

HUGGINGFACE_KEY = os.getenv("HUGGINGFACE_API_KEY", "")

STYLE_PROMPTS = {
    "realistic":   "photorealistic, 8k, detailed, professional photography",
    "anime":       "anime style, manga, vibrant colors, Studio Ghibli",
    "art":         "digital art, concept art, artistic, detailed illustration",
    "cartoon":     "cartoon style, colorful, fun, animated",
    "sketch":      "pencil sketch, black and white, hand drawn",
    "cinematic":   "cinematic, movie still, dramatic lighting, film grain",
    "3d":          "3D render, octane render, blender, highly detailed",
    "watercolor":  "watercolor painting, soft colors, artistic",
    "oil":         "oil painting, classical art, canvas texture",
    "pixel":       "pixel art, 8-bit, retro game style",
}


async def generate_image(prompt: str, style: str = "realistic") -> dict:
    style_suffix = STYLE_PROMPTS.get(style, "")
    full_prompt  = f"{prompt}, {style_suffix}" if style_suffix else prompt

    # 1. HuggingFace
    if HUGGINGFACE_KEY:
        result = await _huggingface(full_prompt)
        if result:
            return {"image_b64": result, "engine": "huggingface", "prompt": full_prompt}

    # 2. Pollinations (bepul, fallback)
    result = await _pollinations(full_prompt)
    if result:
        return {"image_b64": result, "engine": "pollinations", "prompt": full_prompt}

    return {"error": "Rasm generatsiya ishlamadi"}


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
                if r.status_code == 200:
                    return base64.b64encode(r.content).decode()
        except Exception as e:
            print(f"HuggingFace {model} xato: {e}")
    return None


async def _pollinations(prompt: str) -> str | None:
    try:
        encoded = httpx.URL("").copy_with(params={"prompt": prompt})
        url = f"https://image.pollinations.ai/prompt/{httpx.URL(prompt).raw_path}?width=1024&height=1024&nologo=true"
        url = f"https://image.pollinations.ai/prompt/{prompt.replace(' ', '%20')}?width=1024&height=1024&nologo=true"
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.get(url)
            if r.status_code == 200 and len(r.content) > 1000:
                return base64.b64encode(r.content).decode()
    except Exception as e:
        print(f"Pollinations xato: {e}")
    return None