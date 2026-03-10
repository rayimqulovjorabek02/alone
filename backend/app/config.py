"""
backend/app/config.py — Barcha sozlamalar
"""
import os
from dotenv import load_dotenv
load_dotenv()

# ── DATABASE ──────────────────────────────────
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "alone.db")
DB_NAME = os.getenv("DB_PATH", DB_PATH)

# ── JWT ───────────────────────────────────────
JWT_SECRET    = os.getenv("JWT_SECRET", "alone-ai-secret-key-2024")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES  = 60 * 24        # 1 kun
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 30   # 30 kun

# ── AI ────────────────────────────────────────
GROQ_API_KEY        = os.getenv("GROQ_API_KEY", "")
ELEVENLABS_API_KEY  = os.getenv("ELEVENLABS_API_KEY", "")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "")
TAVILY_API_KEY      = os.getenv("TAVILY_API_KEY", "")
STABILITY_API_KEY   = os.getenv("STABILITY_API_KEY", "")

# ── TO'LOV ────────────────────────────────────
STRIPE_SECRET_KEY      = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET  = os.getenv("STRIPE_WEBHOOK_SECRET", "")

# ── EMAIL ─────────────────────────────────────
EMAIL_USER = os.getenv("EMAIL_USER", "")
EMAIL_PASS = os.getenv("EMAIL_PASS", "")
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))

# ── PLANLAR ───────────────────────────────────
DEFAULT_MODEL = "llama-3.3-70b-versatile"

PLANS = {
    "free": {
        "name": "Bepul",
        "price_uzs": 0,
        "limits": {
            "messages": 50,
            "images":   3,
            "voice":    10,
            "files":    2,
        },
        "features": ["chat", "basic_image"],
    },
    "pro": {
        "name": "Pro",
        "price_uzs": 49000,
        "price_usd": 9.99,
        "limits": {
            "messages": 500,
            "images":   20,
            "voice":    100,
            "files":    20,
        },
        "features": ["chat", "image", "voice", "agent", "files", "export"],
    },
    "premium": {
        "name": "Premium",
        "price_uzs": 99000,
        "price_usd": 19.99,
        "limits": {
            "messages": 99999,
            "images":   99999,
            "voice":    99999,
            "files":    99999,
        },
        "features": ["chat", "image", "voice", "agent", "files", "export", "priority"],
    },
}

GROQ_MODELS = {
    "llama-3.3-70b-versatile": {
        "name": "Llama 3.3 70B",
        "icon": "🦙",
        "context": 128000,
        "plan": "free",
    },
    "llama-3.1-8b-instant": {
        "name": "Llama 3.1 8B (Tez)",
        "icon": "⚡",
        "context": 128000,
        "plan": "free",
    },
    "mixtral-8x7b-32768": {
        "name": "Mixtral 8x7B",
        "icon": "🌀",
        "context": 32768,
        "plan": "pro",
    },
    "meta-llama/llama-4-scout-17b-16e-instruct": {
        "name": "Llama 4 Scout (Vision)",
        "icon": "👁️",
        "context": 131072,
        "plan": "pro",
    },
}

CONTEXT_WINDOW = 20

# ── CORS ──────────────────────────────────────
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://aloneai.uz",
    "https://www.aloneai.uz",
]