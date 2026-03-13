"""
modules/voice.py — Ovoz tizimi (Edge TTS + Groq Whisper)
Streamlit dependency yo'q — FastAPI uchun
"""
import io
import re
import os


# ── TIL XARITASI ─────────────────────────────
VOICES = {
    "uz": {
        "default": "uz-UZ-MadinaNeural",
        "male":    "uz-UZ-SardorNeural",
    },
    "ru": {
        "default": "ru-RU-SvetlanaNeural",
        "male":    "ru-RU-DmitryNeural",
    },
    "en": {
        "default": "en-US-JennyNeural",
        "male":    "en-US-GuyNeural",
    },
}

STT_LANG_MAP = {
    "uz": "uz-UZ",
    "ru": "ru-RU",
    "en": "en-US",
}


# ── MATN TOZALASH ─────────────────────────────
def clean_for_tts(text: str) -> str:
    """TTS uchun matnni tozalaydi."""
    text = re.sub(r'```[\s\S]*?```', ' kod bloki. ', text)
    text = re.sub(r'`[^`]+`', '', text)
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*',     r'\1', text)
    text = re.sub(r'#+\s*',          '',    text)
    text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)
    text = re.sub(r'[_~>|]', '', text)
    # Emoji olib tashlash
    text = re.sub(
        r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF'
        r'\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF'
        r'\U00002702-\U000027B0]+',
        '', text, flags=re.UNICODE,
    )
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


# ══════════════════════════════════════════════
# TTS — MATN → OVOZ
# ══════════════════════════════════════════════

async def text_to_speech_elevenlabs(text: str, lang: str = "uz") -> bytes | None:
    """ElevenLabs TTS — yuqori sifatli ko'p tilli ovoz."""
    import os, httpx
    api_key = os.getenv("ELEVENLABS_API_KEY", "")
    if not api_key:
        return None
    try:
        voice_id = "21m00Tcm4TlvDq8ikWAM"  # Rachel
        clean = clean_for_tts(text)[:2500]
        if not clean:
            return None
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
                headers={"xi-api-key": api_key, "Content-Type": "application/json"},
                json={
                    "text": clean,
                    "model_id": "eleven_multilingual_v2",
                    "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
                },
            )
            if resp.status_code == 200:
                return resp.content
            print(f"[ElevenLabs xato]: {resp.status_code} {resp.text[:100]}")
            return None
    except Exception as e:
        print(f"[ElevenLabs xato]: {e}")
        return None


async def text_to_speech_edge(
    text: str,
    lang:   str = "uz",
    gender: str = "default",
    rate:   str = "+0%",
    pitch:  str = "+0Hz",
) -> bytes | None:
    """Edge TTS (Microsoft Neural) — eng natural ovoz."""
    try:
        import edge_tts
        voice = VOICES.get(lang, VOICES["uz"]).get(gender, VOICES["uz"]["default"])
        clean = clean_for_tts(text)[:3000]
        if not clean:
            return None
        communicate = edge_tts.Communicate(text=clean, voice=voice, rate=rate, pitch=pitch)
        buf = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                buf.write(chunk["data"])
        data = buf.getvalue()
        return data if len(data) > 500 else None
    except Exception as e:
        print(f"[Edge TTS xato]: {e}")
        return None


def text_to_speech_gtts(
    text: str,
    lang: str = "uz",
    slow: bool = False,
) -> bytes | None:
    """gTTS fallback."""
    try:
        from gtts import gTTS
        clean = clean_for_tts(text)[:3000]
        tts   = gTTS(text=clean, lang=lang, slow=slow)
        buf   = io.BytesIO()
        tts.write_to_fp(buf)
        return buf.getvalue()
    except Exception as e:
        print(f"[gTTS xato]: {e}")
        return None


# ══════════════════════════════════════════════
# STT — OVOZ → MATN
# ══════════════════════════════════════════════

async def speech_to_text_whisper(
    audio_bytes: bytes,
    suffix: str = ".webm",
    lang:   str = "uz",
) -> str:
    """
    Groq Whisper Large v3 — eng aniq STT.
    Returns: matn yoki ""
    """
    import tempfile

    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        return ""

    try:
        from groq import Groq
        client = Groq(api_key=api_key)

        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as f:
            f.write(audio_bytes)
            tmp_path = f.name

        try:
            with open(tmp_path, "rb") as f:
                result = client.audio.transcriptions.create(
                    file            = (f"audio{suffix}", f.read()),
                    model           = "whisper-large-v3",
                    language        = lang,
                    response_format = "text",
                    temperature     = 0.0,
                )
            text = str(result).strip()
            return text if len(text) > 1 else ""
        finally:
            try: os.unlink(tmp_path)
            except: pass

    except Exception as e:
        print(f"[Whisper xato]: {e}")
        return ""


def speech_to_text_google(
    audio_path: str,
    lang: str = "uz",
) -> str:
    """Google STT fallback."""
    try:
        import speech_recognition as sr
        r    = sr.Recognizer()
        code = STT_LANG_MAP.get(lang, "uz-UZ")

        with sr.AudioFile(audio_path) as source:
            r.adjust_for_ambient_noise(source, duration=0.3)
            audio = r.record(source)

        return r.recognize_google(audio, language=code).strip()
    except Exception as e:
        print(f"[Google STT xato]: {e}")
        return ""


# ══════════════════════════════════════════════
# QULAY FUNKSIYALAR
# ══════════════════════════════════════════════

async def tts(text: str, lang: str = "uz", gender: str = "default",
              speed: str = "normal") -> bytes | None:
    """
    Asosiy TTS funksiyasi — Edge TTS → gTTS fallback.
    speed: normal | slow | fast
    """
    speed_map = {
        "normal": {"rate": "+0%",  "pitch": "+0Hz"},
        "slow":   {"rate": "-20%", "pitch": "-2Hz"},
        "fast":   {"rate": "+20%", "pitch": "+0Hz"},
    }
    pros = speed_map.get(speed, speed_map["normal"])

    # Edge TTS (asosiy)
    # ElevenLabs (birinchi — eng sifatli)
    data = await text_to_speech_elevenlabs(text, lang)

    # Edge TTS fallback
    if not data:
        data = await text_to_speech_edge(text, lang, gender, pros["rate"], pros["pitch"])
    if data:
        return data

    # gTTS fallback
    return text_to_speech_gtts(text, lang, slow=(speed == "slow"))


async def stt(audio_bytes: bytes, suffix: str = ".webm",
              lang: str = "uz") -> str:
    """
    Asosiy STT funksiyasi — Groq Whisper → Google fallback.
    """
    # Whisper (asosiy)
    text = await speech_to_text_whisper(audio_bytes, suffix, lang)
    if text:
        return text

    # Google fallback
    import tempfile
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as f:
        f.write(audio_bytes)
        tmp = f.name
    try:
        return speech_to_text_google(tmp, lang)
    finally:
        try: os.unlink(tmp)
        except: pass