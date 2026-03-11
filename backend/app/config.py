"""
backend/app/config.py
Barcha sozlamalar — faqat shu yerdan o'qiladi

Qoida:
  1. .env fayldan o'qish
  2. Default qiymat berish
  3. Boshqa fayllar bu yerdan import qiladi
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# .env faylni yuklash — backend/ papkasidan qidiradi
_base = Path(__file__).resolve().parent.parent  # backend/
load_dotenv(_base / ".env")
load_dotenv(_base / "app" / ".env")  # fallback

# ── DATABASE ──────────────────────────────────────────────────
DB_PATH = os.getenv("DB_PATH", str(_base / "data" / "alone.db"))

# ── JWT ───────────────────────────────────────────────────────
JWT_SECRET                   = os.getenv("JWT_SECRET", "alone-ai-secret-CHANGE-THIS")
JWT_ALGORITHM                = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES  = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES",  str(60 * 24)))
REFRESH_TOKEN_EXPIRE_MINUTES = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 30)))

# ── AI MODELLAR ───────────────────────────────────────────────
GROQ_API_KEY        = os.getenv("GROQ_API_KEY",        "")
GEMINI_API_KEY      = os.getenv("GEMINI_API_KEY",      "")
OPENAI_API_KEY      = os.getenv("OPENAI_API_KEY",      "")
DEEPSEEK_API_KEY    = os.getenv("DEEPSEEK_API_KEY",    "")
STABILITY_API_KEY   = os.getenv("STABILITY_API_KEY",   "")
ELEVENLABS_API_KEY  = os.getenv("ELEVENLABS_API_KEY",  "")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "")
TAVILY_API_KEY      = os.getenv("TAVILY_API_KEY",      "")

GROQ_MODEL     = os.getenv("GROQ_MODEL",     "llama-3.3-70b-versatile")
GEMINI_MODEL   = os.getenv("GEMINI_MODEL",   "gemini-1.5-flash")
OPENAI_MODEL   = os.getenv("OPENAI_MODEL",   "gpt-4o-mini")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-coder")
DEFAULT_MODEL  = GROQ_MODEL

# ── TO'LOV ────────────────────────────────────────────────────
STRIPE_SECRET_KEY     = os.getenv("STRIPE_SECRET_KEY",     "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
STRIPE_PRICE_PRO      = os.getenv("STRIPE_PRICE_PRO",      "")
STRIPE_PRICE_PREMIUM  = os.getenv("STRIPE_PRICE_PREMIUM",  "")

# ── EMAIL ─────────────────────────────────────────────────────
EMAIL_USER = os.getenv("EMAIL_USER", "")
EMAIL_PASS = os.getenv("EMAIL_PASS", "")
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))

# ── ILOVA ─────────────────────────────────────────────────────
APP_NAME = os.getenv("APP_NAME", "Alone AI")
APP_URL  = os.getenv("APP_URL",  "http://localhost:8000")
DEBUG    = os.getenv("DEBUG", "false").lower() == "true"

ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:3000,https://aloneai.uz"
    ).split(",")
    if o.strip()
]

CONTEXT_WINDOW = int(os.getenv("CONTEXT_WINDOW", "20"))

# ── PLANLAR ───────────────────────────────────────────────────
PLANS = {
    "free": {
        "name":      "Bepul",
        "price_uzs": 0,
        "limits":    {"messages": 50, "images": 3, "voice": 10, "files": 2},
        "features":  ["chat", "basic_image"],
    },
    "pro": {
        "name":      "Pro",
        "price_uzs": 49000,
        "price_usd": 9.99,
        "limits":    {"messages": 500, "images": 20, "voice": 100, "files": 20},
        "features":  ["chat", "image", "voice", "agent", "files", "export"],
    },
    "premium": {
        "name":      "Premium",
        "price_uzs": 99000,
        "price_usd": 19.99,
        "limits":    {"messages": 99999, "images": 99999, "voice": 99999, "files": 99999},
        "features":  ["chat", "image", "voice", "agent", "files", "export", "priority"],
    },
}

# ── GROQ MODELLARI ────────────────────────────────────────────
GROQ_MODELS = {
    "llama-3.3-70b-versatile": {
        "name": "Llama 3.3 70B", "icon": "🦙", "context": 128000, "plan": "free",
    },
    "llama-3.1-8b-instant": {
        "name": "Llama 3.1 8B (Tez)", "icon": "⚡", "context": 128000, "plan": "free",
    },
    "mixtral-8x7b-32768": {
        "name": "Mixtral 8x7B", "icon": "🌀", "context": 32768, "plan": "pro",
    },
}

# ── Konfiguratsiyani tekshirish ───────────────────────────────
def check_config():
    """Startup da muhim kalitlarni tekshirish."""
    warnings = []
    if not GROQ_API_KEY and not GEMINI_API_KEY and not OPENAI_API_KEY:
        warnings.append("⚠️  Hech qanday AI API key topilmadi!")
    if JWT_SECRET == "alone-ai-secret-CHANGE-THIS":
        warnings.append("⚠️  JWT_SECRET o'zgartiring!")
    if DEBUG:
        warnings.append("⚠️  DEBUG=true — production da o'chiring!")
    for w in warnings:
        print(w)
    return len(warnings) == 0