# core/config.py

import os
from dotenv import load_dotenv

load_dotenv()

APP_NAME = "Alone AI"
APP_VERSION = "2.0.0"

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

DEFAULT_MODEL = "llama-3.3-70b-versatile"

CHAT_HISTORY_LIMIT = 200
CONTEXT_WINDOW = 20

SESSION_TIMEOUT = 30


GROQ_MODELS = {

    "llama-3.3-70b-versatile": {
        "name": "LLaMA 3.3 70B",
        "tokens": 32768
    },

    "llama-3.1-8b-instant": {
        "name": "LLaMA 3.1 8B",
        "tokens": 8192
    }
}