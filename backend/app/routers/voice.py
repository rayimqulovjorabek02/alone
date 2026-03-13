"""
backend/app/routers/voice.py — TTS (ovoz) va STT (nutq tanish)
"""
import os
import io
import base64
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from core.jwt import get_current_user
from database import get_usage, increment_usage, get_plan
from config import PLANS

router = APIRouter()


# Keylarni har safar o'qiymiz (dotenv startup da yuklanadi)
def _elevenlabs_key(): return os.getenv("ELEVENLABS_API_KEY", "")
def _groq_key():       return os.getenv("GROQ_API_KEY", "")


# ── TIL XARITASI ─────────────────────────────────────────────
VOICES = {
    "uz": {"default": "uz-UZ-MadinaNeural", "male": "uz-UZ-SardorNeural"},
    "ru": {"default": "ru-RU-SvetlanaNeural", "male": "ru-RU-DmitryNeural"},
    "en": {"default": "en-US-JennyNeural", "male": "en-US-GuyNeural"},
}

STT_LANG_MAP = {"uz": "uz-UZ", "ru": "ru-RU", "en": "en-US"}


# ── MATN TOZALASH ─────────────────────────────────────────────
import re as _re

def clean_for_tts(text: str) -> str:
    text = _re.sub(r'```[\s\S]*?```', ' kod bloki. ', text)
    text = _re.sub(r'`[^`]+`', '', text)
    text = _re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = _re.sub(r'\*(.+?)\*', r'\1', text)
    text = _re.sub(r'#+\s*', '', text)
    text = _re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)
    text = _re.sub(r'[_~>|]', '', text)
    text = _re.sub(
        r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF'
        r'\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF'
        r'\U00002702-\U000027B0]+',
        '', text, flags=_re.UNICODE,
    )
    text = _re.sub(r'\s+', ' ', text)
    return text.strip()


# ── MODELLAR ──────────────────────────────────────────────────
class TTSRequest(BaseModel):
    text:   str
    voice:  str   = "default"
    lang:   str   = "uz"
    speed:  str   = "normal"   # normal | slow | fast
    gender: str   = "default"


class TranslateRequest(BaseModel):
    text:      str
    from_lang: str = "auto"
    to_lang:   str = "uz"


# ── ENDPOINTLAR ───────────────────────────────────────────────

@router.post("/tts")
async def text_to_speech(body: TTSRequest, current: dict = Depends(get_current_user)):
    if not body.text.strip():
        raise HTTPException(400, "Matn kerak")

    plan  = get_plan(current["user_id"])
    limit = PLANS[plan]["limits"]["voice"]
    usage = get_usage(current["user_id"], "voice")
    if usage >= limit:
        raise HTTPException(429, f"Kunlik ovoz limiti ({limit} ta) tugadi")

    text = clean_for_tts(body.text)[:3000]

    # 1. OpenAI TTS (eng ishonchli)
    audio_b64 = await _openai_tts(text)
    if audio_b64:
        increment_usage(current["user_id"], "voice")
        return {"audio_b64": audio_b64, "engine": "openai-tts"}

    # 2. ElevenLabs
    eleven_key = _elevenlabs_key()
    if eleven_key:
        audio_b64 = await _elevenlabs_tts(text, api_key=eleven_key)
        if audio_b64:
            increment_usage(current["user_id"], "voice")
            return {"audio_b64": audio_b64, "engine": "elevenlabs"}

    # 3. Edge TTS
    audio_b64 = await _edge_tts(text, lang=body.lang, gender=body.gender, speed=body.speed)
    if audio_b64:
        increment_usage(current["user_id"], "voice")
        return {"audio_b64": audio_b64, "engine": "edge-tts"}

    # 4. gTTS (ru/en fallback)
    audio_b64 = _gtts(text, lang=body.lang, slow=(body.speed == "slow"))
    if audio_b64:
        increment_usage(current["user_id"], "voice")
        return {"audio_b64": audio_b64, "engine": "gtts"}

    # 5. gTTS ru (oxirgi fallback)
    if body.lang != "ru":
        audio_b64 = _gtts(text, lang="ru", slow=False)
        if audio_b64:
            increment_usage(current["user_id"], "voice")
            return {"audio_b64": audio_b64, "engine": "gtts-ru"}

    raise HTTPException(500, "TTS ishlamadi")


@router.post("/stt")
async def speech_to_text(
    audio: UploadFile = File(...),
    lang: str = "uz",
    current: dict = Depends(get_current_user),
):
    groq_key = _groq_key()
    if not groq_key:
        raise HTTPException(500, "STT sozlanmagan (GROQ_API_KEY yo'q)")

    content = await audio.read()
    if not content:
        raise HTTPException(400, "Audio fayl bo'sh")
    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(400, "Fayl hajmi 25MB dan oshmasin")

    suffix = ".webm"
    if audio.filename:
        ext = os.path.splitext(audio.filename)[-1]
        if ext:
            suffix = ext

    # 1. Groq Whisper (asosiy)
    text = await _whisper_stt(content, suffix=suffix, lang=lang, api_key=groq_key)
    if text:
        return {"text": text, "engine": "groq-whisper"}

    # 2. Google fallback
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name
    try:
        text = _google_stt(tmp_path, lang=lang)
        if text:
            return {"text": text, "engine": "google"}
    finally:
        try: os.unlink(tmp_path)
        except: pass

    raise HTTPException(422, "Ovozdan matn ajratib bo'lmadi")


@router.post("/translate")
async def translate(body: TranslateRequest, current: dict = Depends(get_current_user)):
    from groq import Groq
    client = Groq(api_key=_groq_key())
    lang_names = {"uz": "O'zbek", "ru": "Rus", "en": "Ingliz"}
    to_name = lang_names.get(body.to_lang, body.to_lang)
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": f"Faqat {to_name} tiliga tarjima qil. Hech narsa qo'shma."},
            {"role": "user", "content": body.text},
        ],
        max_tokens=2000,
    )
    return {"translated": response.choices[0].message.content.strip()}


@router.get("/voices")
async def get_voices(current: dict = Depends(get_current_user)):
    return {
        "uz": {"default": "Madina (ayol)", "male": "Sardor (erkak)"},
        "ru": {"default": "Svetlana (ayol)", "male": "Dmitry (erkak)"},
        "en": {"default": "Jenny (ayol)", "male": "Guy (erkak)"},
    }


@router.get("/status")
async def voice_status(current: dict = Depends(get_current_user)):
    eleven = bool(_elevenlabs_key())
    groq   = bool(_groq_key())
    return {
        "tts": {
            "elevenlabs": eleven,
            "edge_tts":   True,
            "gtts":       True,
            "active":     "elevenlabs" if eleven else "edge_tts",
        },
        "stt": {
            "whisper": groq,
            "google":  True,
            "active":  "whisper" if groq else "google",
        },
    }


# ── TTS FUNKSIYALAR ───────────────────────────────────────────

async def _elevenlabs_tts(
    text: str,
    voice_id: str = "21m00Tcm4TlvDq8ikWAM",
    api_key: str = "",
) -> str | None:
    try:
        import httpx
        key = api_key or _elevenlabs_key()
        if not key:
            return None
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post(
                f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
                headers={"xi-api-key": key, "Content-Type": "application/json"},
                json={
                    "text": text,
                    "model_id": "eleven_multilingual_v2",
                    "voice_settings": {
                        "stability": 0.35,
                        "similarity_boost": 0.85,
                        "style": 0.3,
                        "use_speaker_boost": True,
                    },
                },
            )
            if r.status_code == 200:
                return base64.b64encode(r.content).decode()
            print(f"ElevenLabs xato: {r.status_code} {r.text[:100]}")
    except Exception as e:
        print(f"ElevenLabs xato: {e}")
    return None


async def _edge_tts(
    text: str,
    lang:   str = "uz",
    gender: str = "default",
    speed:  str = "normal",
) -> str | None:
    try:
        import edge_tts
        speed_map = {
            "normal": {"rate": "+0%",  "pitch": "+0Hz"},
            "slow":   {"rate": "-20%", "pitch": "-2Hz"},
            "fast":   {"rate": "+20%", "pitch": "+0Hz"},
        }
        pros  = speed_map.get(speed, speed_map["normal"])
        voice = VOICES.get(lang, VOICES["uz"]).get(gender, VOICES["uz"]["default"])
        communicate = edge_tts.Communicate(
            text=text, voice=voice,
            rate=pros["rate"], pitch=pros["pitch"],
        )
        buf = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                buf.write(chunk["data"])
        data = buf.getvalue()
        if len(data) > 500:
            return base64.b64encode(data).decode()
    except Exception as e:
        print(f"Edge TTS xato: {e}")
    return None


def _gtts(text: str, lang: str = "uz", slow: bool = False) -> str | None:
    # gTTS uz tilini qo'llab-quvvatlamaydi — ru yoki en ishlatamiz
    gtts_lang = lang if lang in ("ru", "en") else "ru"
    try:
        from gtts import gTTS
        tts = gTTS(text=text[:3000], lang=gtts_lang, slow=slow)
        buf = io.BytesIO()
        tts.write_to_fp(buf)
        data = buf.getvalue()
        if data:
            return base64.b64encode(data).decode()
    except Exception as e:
        print(f"gTTS xato: {e}")
    return None


async def _groq_tts(text: str) -> str | None:
    """Groq TTS — OpenAI whisper-compatible (hozircha mavjud emas, skip)."""
    return None


async def _openai_tts(text: str, api_key: str = "") -> str | None:
    """OpenAI TTS — agar OPENAI_API_KEY bo'lsa."""
    try:
        import httpx, os
        key = api_key or os.getenv("OPENAI_API_KEY", "")
        if not key:
            print("[OpenAI TTS] OPENAI_API_KEY yo'q")
            return None
        print(f"[OpenAI TTS] Urinmoqda: {key[:8]}...")
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post(
                "https://api.openai.com/v1/audio/speech",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                json={"model": "tts-1", "input": text[:4096], "voice": "alloy"},
            )
            if r.status_code == 200:
                return base64.b64encode(r.content).decode()
            print(f"OpenAI TTS xato: {r.status_code}")
    except Exception as e:
        print(f"OpenAI TTS xato: {e}")
    return None


# ── STT FUNKSIYALAR ───────────────────────────────────────────

async def _whisper_stt(
    audio_bytes: bytes,
    suffix: str = ".webm",
    lang: str = "uz",
    api_key: str = "",
) -> str:
    try:
        from groq import Groq
        key = api_key or _groq_key()
        if not key:
            return ""
        client = Groq(api_key=key)
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as f:
            f.write(audio_bytes)
            tmp_path = f.name
        try:
            with open(tmp_path, "rb") as f:
                result = client.audio.transcriptions.create(
                    file=(f"audio{suffix}", f.read()),
                    model="whisper-large-v3",
                    language=lang,
                    response_format="text",
                    temperature=0.0,
                )
            text = str(result).strip()
            return text if len(text) > 1 else ""
        finally:
            try: os.unlink(tmp_path)
            except: pass
    except Exception as e:
        print(f"Whisper xato: {e}")
    return ""


def _google_stt(audio_path: str, lang: str = "uz") -> str:
    try:
        import speech_recognition as sr
        r = sr.Recognizer()
        code = STT_LANG_MAP.get(lang, "uz-UZ")
        with sr.AudioFile(audio_path) as source:
            r.adjust_for_ambient_noise(source, duration=0.3)
            audio = r.record(source)
        return r.recognize_google(audio, language=code).strip()
    except Exception as e:
        print(f"Google STT xato: {e}")
    return ""