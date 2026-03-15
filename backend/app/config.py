"""
backend/app/config.py
Barcha sozlamalar — faqat shu yerdan o'qiladi

Qoida:
  1. .env fayldan o'qish
  2. Default qiymat berish
  3. Boshqa fayllar bu yerdan import qiladi
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# .env faylni yuklash — backend/ papkasidan qidiradi
_base = Path(__file__).resolve().parent.parent  # backend/
load_dotenv(_base / ".env")
load_dotenv(_base / "app" / ".env")  # fallback

# ── DATABASE ──────────────────────────────────────────────────
DB_PATH = os.getenv("DB_PATH", str(_base / "data" / "alone.db"))

# Windows absolut yo'lini avtomatik to'g'irlash
if "Users" in DB_PATH and "\\" in DB_PATH:
    print("⚠️  DB_PATH Windows absolut yo'li! Nisbiy yo'lga o'tkazilmoqda...")
    DB_PATH = str(_base / "data" / "alone.db")

# ── JWT ───────────────────────────────────────────────────────
JWT_SECRET                   = os.getenv("JWT_SECRET", "")
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

# ── GOOGLE OAUTH ──────────────────────────────────────────────
GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID",     "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")

# ── ADMIN ─────────────────────────────────────────────────────
ADMIN_EMAIL    = os.getenv("ADMIN_EMAIL",    "")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")

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
        "limits":    {"messages": 500, "images": 50, "voice": 100, "files": 20},
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
_WEAK_SECRETS = {
    "alone-ai-secret-CHANGE-THIS",
    "your-super-secret-key-change-this",
    "secret",
    "password",
    "",
}

def check_config() -> bool:
    """Startup da muhim kalitlarni tekshirish."""
    warnings = []
    errors   = []

    # JWT tekshiruv
    if not JWT_SECRET or JWT_SECRET in _WEAK_SECRETS:
        errors.append("❌ JWT_SECRET bo'sh yoki zaif! `openssl rand -hex 32` bilan yangi kalit oling.")

    if len(JWT_SECRET) < 32:
        warnings.append("⚠️  JWT_SECRET kamida 32 belgi bo'lishi kerak.")

    # AI kalitlar
    if not GROQ_API_KEY and not GEMINI_API_KEY and not OPENAI_API_KEY:
        errors.append("❌ Hech qanday AI API key topilmadi! GROQ_API_KEY yoki boshqasini kiriting.")

    # Admin
    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        warnings.append("⚠️  ADMIN_EMAIL yoki ADMIN_PASSWORD bo'sh.")

    # Email
    if EMAIL_USER and not EMAIL_PASS:
        warnings.append("⚠️  EMAIL_USER bor, lekin EMAIL_PASS yo'q.")

    # Debug
    if DEBUG:
        warnings.append("⚠️  DEBUG=true — production da o'chiring!")

    # DB yo'l
    db_dir = Path(DB_PATH).parent
    if not db_dir.exists():
        try:
            db_dir.mkdir(parents=True, exist_ok=True)
            print(f"📁 DB papka yaratildi: {db_dir}")
        except Exception as e:
            errors.append(f"❌ DB papka yaratib bo'lmadi: {db_dir} — {e}")

    for w in warnings:
        print(w)

    if errors:
        for e in errors:
            print(e)
        print("\n💡 .env.example faylini .env ga nusxalab to'ldiring.")
        return False

    return True