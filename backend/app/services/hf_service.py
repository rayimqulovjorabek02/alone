"""
backend/app/services/hf_service.py — HuggingFace AI xizmati
"""
import os
import httpx
import base64

HF_KEY   = os.getenv("HUGGINGFACE_API_KEY", "")
HF_BASE  = "https://router.huggingface.co/hf-inference/models"

IMAGE_MODELS = [
    "stabilityai/stable-diffusion-xl-base-1.0",
    "runwayml/stable-diffusion-v1-5",
    "black-forest-labs/FLUX.1-dev",
]

TEXT_MODEL = "mistralai/Mistral-7B-Instruct-v0.3"


class HuggingFaceService:

    @staticmethod
    async def generate_image(prompt: str, model: str = None) -> str | None:
        """Rasm generatsiya → base64."""
        if not HF_KEY:
            return None

        models = [model] if model else IMAGE_MODELS

        for m in models:
            try:
                async with httpx.AsyncClient(timeout=60) as client:
                    r = await client.post(
                        f"{HF_BASE}/{m}",
                        headers={"Authorization": f"Bearer {HF_KEY}"},
                        json={"inputs": prompt},
                    )
                    if r.status_code == 200 and len(r.content) > 1000:
                        return base64.b64encode(r.content).decode()
                    print(f"HF {m}: {r.status_code}")
            except Exception as e:
                print(f"HF rasm xato ({m}): {e}")
        return None

    @staticmethod
    async def text_generation(prompt: str, max_tokens: int = 500) -> str | None:
        """Matn generatsiya."""
        if not HF_KEY:
            return None
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                r = await client.post(
                    f"{HF_BASE}/{TEXT_MODEL}",
                    headers={"Authorization": f"Bearer {HF_KEY}"},
                    json={
                        "inputs": prompt,
                        "parameters": {"max_new_tokens": max_tokens, "temperature": 0.7},
                    },
                )
                if r.status_code == 200:
                    data = r.json()
                    if isinstance(data, list) and data:
                        return data[0].get("generated_text", "").replace(prompt, "").strip()
        except Exception as e:
            print(f"HF text xato: {e}")
        return None

    @staticmethod
    async def classify_text(text: str) -> dict:
        """Matn klassifikatsiyasi (sentiment)."""
        model = "cardiffnlp/twitter-roberta-base-sentiment-latest"
        if not HF_KEY:
            return {}
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                r = await client.post(
                    f"{HF_BASE}/{model}",
                    headers={"Authorization": f"Bearer {HF_KEY}"},
                    json={"inputs": text[:512]},
                )
                if r.status_code == 200:
                    results = r.json()
                    if results and isinstance(results[0], list):
                        top = max(results[0], key=lambda x: x["score"])
                        return {"label": top["label"], "score": round(top["score"], 3)}
        except Exception as e:
            print(f"HF classify xato: {e}")
        return {}