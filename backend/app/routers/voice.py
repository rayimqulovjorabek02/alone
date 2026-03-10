"""
backend/app/routers/voice.py — TTS (ovoz) va STT (nutq tanish)
"""
import os
import io
import base64
import tempfile
import asyncio
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from core.jwt import get_current_user
from database import get_usage, increment_usage, get_plan
from config import PLANS

router = APIRouter()

ELEVENLABS_KEY = os.getenv("ELEVENLABS_API_KEY", "")
GROQ_KEY       = os.getenv("GROQ_API_KEY", "")


class TTSRequest(BaseModel):
    text:   str
    voice:  str = "default"   # default | male | female | elevenlabs
    speed:  float = 1.0


class TranslateRequest(BaseModel):
    text:      str
    from_lang: str = "auto"
    to_lang:   str = "uz"


@router.post("/tts")
async def text_to_speech(body: TTSRequest, current: dict = Depends(get_current_user)):
    if not body.text.strip():
        raise HTTPException(400, "Matn kerak")

    plan  = get_plan(current["user_id"])
    limit = PLANS[plan]["limits"]["voice"]
    usage = get_usage(current["user_id"], "voice")
    if usage >= limit:
        raise HTTPException(429, f"Kunlik ovoz limiti ({limit} ta) tugadi")

    # ElevenLabs (premium ovoz)
    if ELEVENLABS_KEY and body.voice == "elevenlabs":
        audio_b64 = await _elevenlabs_tts(body.text)
        if audio_b64:
            increment_usage(current["user_id"], "voice")
            return {"audio_b64": audio_b64, "engine": "elevenlabs"}

    # Edge TTS (bepul, sifatli)
    audio_b64 = await _edge_tts(body.text, body.voice)
    if audio_b64:
        increment_usage(current["user_id"], "voice")
        return {"audio_b64": audio_b64, "engine": "edge-tts"}

    raise HTTPException(500, "TTS ishlamadi")


@router.post("/stt")
async def speech_to_text(
    audio: UploadFile = File(...),
    current: dict = Depends(get_current_user)
):
    if not GROQ_KEY:
        raise HTTPException(500, "STT sozlanmagan")

    content = await audio.read()
    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(400, "Fayl hajmi 25MB dan oshmasin")

    from groq import Groq
    client = Groq(api_key=GROQ_KEY)

    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as f:
            result = client.audio.transcriptions.create(
                model="whisper-large-v3",
                file=f,
                language="uz",
            )
        return {"text": result.text, "engine": "groq-whisper"}
    except Exception as e:
        raise HTTPException(500, f"STT xato: {e}")
    finally:
        os.unlink(tmp_path)


@router.post("/translate")
async def translate(body: TranslateRequest, current: dict = Depends(get_current_user)):
    from groq import Groq
    client = Groq(api_key=GROQ_KEY)

    lang_names = {"uz": "O'zbek", "ru": "Rus", "en": "Ingliz"}
    to_name    = lang_names.get(body.to_lang, body.to_lang)

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": f"Faqat {to_name} tiliga tarjima qil. Hech narsa qo'shma."},
            {"role": "user", "content": body.text}
        ],
        max_tokens=2000,
    )
    return {"translated": response.choices[0].message.content.strip()}


# ── Private funksiyalar ───────────────────────

async def _edge_tts(text: str, voice_type: str = "default") -> str | None:
    try:
        import edge_tts
        voice_map = {
            "default": "uz-UZ-MadinaNeural",
            "female":  "uz-UZ-MadinaNeural",
            "male":    "uz-UZ-SardorNeural",
            "ru":      "ru-RU-SvetlanaNeural",
            "en":      "en-US-JennyNeural",
        }
        voice = voice_map.get(voice_type, "uz-UZ-MadinaNeural")
        communicate = edge_tts.Communicate(text, voice, rate="-10%", pitch="-2Hz")
        buf = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                buf.write(chunk["data"])
        buf.seek(0)
        data = buf.read()
        if data:
            return base64.b64encode(data).decode()
    except Exception as e:
        print(f"Edge TTS xato: {e}")
    return None


async def _elevenlabs_tts(text: str, voice_id: str = "21m00Tcm4TlvDq8ikWAM") -> str | None:
    try:
        import httpx
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post(
                f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
                headers={"xi-api-key": ELEVENLABS_KEY, "Content-Type": "application/json"},
                json={
                    "text": text,
                    "model_id": "eleven_multilingual_v2",
                    "voice_settings": {
                        "stability": 0.35,
                        "similarity_boost": 0.85,
                        "style": 0.3,
                        "use_speaker_boost": True
                    }
                }
            )
            if r.status_code == 200:
                return base64.b64encode(r.content).decode()
    except Exception as e:
        print(f"ElevenLabs xato: {e}")
    return None