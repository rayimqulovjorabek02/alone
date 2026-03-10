"""
backend/app/services/stability_service.py — Stability AI rasm xizmati
"""
import os
import httpx
import base64

STABILITY_KEY  = os.getenv("STABILITY_API_KEY", "")
BASE_URL       = "https://api.stability.ai/v1"

ENGINES = {
    "xl":       "stable-diffusion-xl-1024-v1-0",
    "core":     "stable-diffusion-v1-6",
    "turbo":    "sd-turbo",
}


class StabilityService:

    @staticmethod
    async def generate_image(
        prompt:      str,
        negative:    str   = "blurry, ugly, bad quality, watermark",
        engine:      str   = "xl",
        width:       int   = 1024,
        height:      int   = 1024,
        steps:       int   = 30,
        cfg_scale:   float = 7.0,
    ) -> str | None:
        """Stability AI orqali rasm generatsiya → base64."""
        if not STABILITY_KEY:
            return None

        engine_id = ENGINES.get(engine, ENGINES["xl"])

        try:
            async with httpx.AsyncClient(timeout=60) as client:
                r = await client.post(
                    f"{BASE_URL}/generation/{engine_id}/text-to-image",
                    headers={
                        "Authorization": f"Bearer {STABILITY_KEY}",
                        "Content-Type":  "application/json",
                        "Accept":        "application/json",
                    },
                    json={
                        "text_prompts": [
                            {"text": prompt,   "weight": 1.0},
                            {"text": negative, "weight": -1.0},
                        ],
                        "cfg_scale":   cfg_scale,
                        "width":       width,
                        "height":      height,
                        "steps":       steps,
                        "samples":     1,
                    },
                )
                if r.status_code == 200:
                    data = r.json()
                    artifacts = data.get("artifacts", [])
                    if artifacts:
                        return artifacts[0]["base64"]
                print(f"Stability xato: {r.status_code} — {r.text[:200]}")
        except Exception as e:
            print(f"Stability xizmati xato: {e}")
        return None

    @staticmethod
    async def upscale_image(image_b64: str, scale: int = 2) -> str | None:
        """Rasmni kattallashtirish."""
        if not STABILITY_KEY:
            return None
        try:
            image_bytes = base64.b64decode(image_b64)
            async with httpx.AsyncClient(timeout=60) as client:
                r = await client.post(
                    f"{BASE_URL}/generation/esrgan-v1-x2plus/image-to-image/upscale",
                    headers={"Authorization": f"Bearer {STABILITY_KEY}"},
                    files={"image": ("image.png", image_bytes, "image/png")},
                    data={"width": 2048},
                )
                if r.status_code == 200:
                    return r.json().get("artifacts", [{}])[0].get("base64")
        except Exception as e:
            print(f"Stability upscale xato: {e}")
        return None