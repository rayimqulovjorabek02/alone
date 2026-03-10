"""
backend/app/services/elevenlabs_service.py — ElevenLabs TTS xizmati
"""
import os
import httpx
import base64

API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
BASE_URL = "https://api.elevenlabs.io/v1"

# Ovoz IDlari
VOICES = {
    "default":   "21m00Tcm4TlvDq8ikWAM",  # Rachel
    "male":      "VR6AewLTigWG4xSOukaG",  # Arnold
    "female":    "EXAVITQu4vr4xnSDxMaL",  # Bella
    "news":      "ErXwobaYiN019PkySvjV",  # Antoni
    "narrator":  "N2lVS1w4EtoT3dr4eOWO",  # Callum
}

TTS_SETTINGS = {
    "stability":         0.35,
    "similarity_boost":  0.85,
    "style":             0.3,
    "use_speaker_boost": True,
}


class ElevenLabsService:

    @staticmethod
    async def text_to_speech(
        text:     str,
        voice:    str   = "default",
        model_id: str   = "eleven_multilingual_v2",
    ) -> str | None:
        """Matnni ovozga aylantirish → base64 MP3."""
        if not API_KEY:
            return None

        voice_id = VOICES.get(voice, VOICES["default"])

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    f"{BASE_URL}/text-to-speech/{voice_id}",
                    headers={
                        "xi-api-key":   API_KEY,
                        "Content-Type": "application/json",
                    },
                    json={
                        "text":           text[:5000],
                        "model_id":       model_id,
                        "voice_settings": TTS_SETTINGS,
                    },
                )
                if response.status_code == 200:
                    return base64.b64encode(response.content).decode()
                print(f"ElevenLabs xato: {response.status_code} — {response.text[:200]}")
        except Exception as e:
            print(f"ElevenLabs xizmati xato: {e}")
        return None

    @staticmethod
    async def get_voices() -> list:
        """Mavjud ovozlar ro'yxati."""
        if not API_KEY:
            return []
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                r = await client.get(f"{BASE_URL}/voices",
                                     headers={"xi-api-key": API_KEY})
                if r.status_code == 200:
                    return r.json().get("voices", [])
        except Exception as e:
            print(f"ElevenLabs voices xato: {e}")
        return []

    @staticmethod
    async def get_usage() -> dict:
        """API foydalanish statistikasi."""
        if not API_KEY:
            return {}
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                r = await client.get(f"{BASE_URL}/user/subscription",
                                     headers={"xi-api-key": API_KEY})
                if r.status_code == 200:
                    data = r.json()
                    return {
                        "characters_used":  data.get("character_count", 0),
                        "characters_limit": data.get("character_limit", 0),
                        "tier": data.get("tier", "free"),
                    }
        except Exception as e:
            print(f"ElevenLabs usage xato: {e}")
        return {}