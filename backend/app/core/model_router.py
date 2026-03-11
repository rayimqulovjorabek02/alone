"""
backend/app/core/model_router_v2.py
Smart AI routing tizimi

Har bir model o'z vazifasida ishlaydi:
  Groq       → tez chat, oddiy savollar
  Gemini     → murakkab fikrlash, tahlil
  OpenAI     → universal fallback
  DeepSeek   → kod yozish, debugging
  Stability  → rasm generatsiya (image router da ishlatiladi)

Fallback tartibi:
  chat:  Groq → Gemini → OpenAI
  code:  DeepSeek → Groq → OpenAI
  think: Gemini → OpenAI → Groq
  image: Stability (alohida)
"""

import os
import re
from typing import AsyncGenerator

# ── API kalitlar ──────────────────────────────────────────────

GROQ_KEY      = os.getenv("GROQ_API_KEY",      "")
GEMINI_KEY    = os.getenv("GEMINI_API_KEY",     "")
OPENAI_KEY    = os.getenv("OPENAI_API_KEY",     "")
DEEPSEEK_KEY  = os.getenv("DEEPSEEK_API_KEY",   "")

# ── Model konfiguratsiyasi ────────────────────────────────────

MODELS = {
    "groq": {
        "name":     "groq",
        "label":    "Groq (llama-3.3-70b)",
        "model":    os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
        "api_key":  GROQ_KEY,
        "enabled":  bool(GROQ_KEY),
        "role":     "chat",
        "speed":    "fast",
    },
    "gemini": {
        "name":     "gemini",
        "label":    "Gemini 1.5 Flash",
        "model":    os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
        "api_key":  GEMINI_KEY,
        "enabled":  bool(GEMINI_KEY),
        "role":     "reasoning",
        "speed":    "medium",
    },
    "openai": {
        "name":     "openai",
        "label":    "OpenAI GPT-4o-mini",
        "model":    os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        "api_key":  OPENAI_KEY,
        "enabled":  bool(OPENAI_KEY),
        "role":     "universal",
        "speed":    "medium",
    },
    "deepseek": {
        "name":     "deepseek",
        "label":    "DeepSeek Coder",
        "model":    os.getenv("DEEPSEEK_MODEL", "deepseek-coder"),
        "api_key":  DEEPSEEK_KEY,
        "enabled":  bool(DEEPSEEK_KEY),
        "role":     "coding",
        "speed":    "medium",
    },
}

# ── Routing qoidalari ─────────────────────────────────────────

# Kod yozish belgilari
CODE_KEYWORDS = [
    "kod", "code", "python", "javascript", "js", "typescript", "ts",
    "react", "fastapi", "django", "flask", "sql", "html", "css",
    "debug", "xato", "error", "function", "class", "import",
    "yoz", "tuzat", "refactor", "optimize", "algorithm",
    "def ", "async ", "await ", "return ", "if __name__",
    "```", "print(", "console.log",
]

# Chuqur fikrlash belgilari
THINK_KEYWORDS = [
    "tushuntir", "explain", "tahlil", "analyze", "nima uchun", "why",
    "farqi", "difference", "qanday ishlaydi", "how does",
    "solishtiR", "compare", "afzalliklari", "advantages",
    "strategiya", "strategy", "reja", "plan", "arxitektura",
    "architecture", "muhim", "important", "complex",
    "matematik", "math", "formula", "hisoblash",
]


def detect_intent(message: str) -> str:
    """
    Xabar matniga qarab intent aniqlash.
    Qaytaradi: 'code' | 'think' | 'chat'
    """
    text = message.lower()

    # Kod yozish
    code_score = sum(1 for k in CODE_KEYWORDS if k in text)
    if code_score >= 1:
        return "code"

    # Chuqur tahlil
    think_score = sum(1 for k in THINK_KEYWORDS if k in text)
    if think_score >= 2:
        return "think"

    # Uzun xabar → fikrlash kerak
    if len(message) > 200:
        return "think"

    return "chat"


def get_route(intent: str) -> list[dict]:
    """
    Intentga qarab model tartibi.
    Fallback: birinchi xato bersa, keyingisi ishlatiladi.
    """
    routes = {
        "chat": ["groq", "gemini", "openai"],
        "code": ["deepseek", "groq", "openai"],
        "think": ["gemini", "openai", "groq"],
    }
    order = routes.get(intent, routes["chat"])
    result = []
    for name in order:
        model = MODELS.get(name)
        if model and model["enabled"]:
            result.append(model)
    return result


# ── Provider holati ───────────────────────────────────────────

import time

class _State:
    _failed: dict = {}

    @classmethod
    def fail(cls, name: str):
        cls._failed[name] = time.time() + 60
        print(f"[Router] '{name}' xato — 60s kutiladi")

    @classmethod
    def ok(cls, name: str):
        cls._failed.pop(name, None)

    @classmethod
    def available(cls, name: str) -> bool:
        retry = cls._failed.get(name, 0)
        if retry and time.time() < retry:
            return False
        cls._failed.pop(name, None)
        return True

    @classmethod
    def reset(cls):
        cls._failed.clear()

    @classmethod
    def status(cls) -> list[dict]:
        result = []
        for name, model in MODELS.items():
            retry = cls._failed.get(name, 0)
            retry_in = max(0, int(retry - time.time())) if retry else 0
            result.append({
                "name":      name,
                "label":     model["label"],
                "role":      model["role"],
                "enabled":   model["enabled"],
                "available": cls.available(name),
                "retry_in":  retry_in,
            })
        return result


# ── Har bir provider caller ───────────────────────────────────

async def _groq_call(
    model_cfg: dict,
    messages: list,
    system: str,
    stream: bool,
) -> AsyncGenerator[str, None]:
    from groq import AsyncGroq
    client = AsyncGroq(api_key=model_cfg["api_key"])
    all_msgs = [{"role": "system", "content": system}] + messages

    if stream:
        resp = await client.chat.completions.create(
            model=model_cfg["model"],
            messages=all_msgs,
            stream=True,
            max_tokens=2048,
            temperature=0.7,
        )
        async for chunk in resp:
            token = chunk.choices[0].delta.content
            if token:
                yield token
    else:
        resp = await client.chat.completions.create(
            model=model_cfg["model"],
            messages=all_msgs,
            stream=False,
            max_tokens=2048,
            temperature=0.7,
        )
        yield resp.choices[0].message.content


async def _gemini_call(
    model_cfg: dict,
    messages: list,
    system: str,
    stream: bool,
) -> AsyncGenerator[str, None]:
    import httpx
    import json

    api_key = model_cfg["api_key"]
    model   = model_cfg["model"]

    gemini_contents = []
    for msg in messages:
        role = "user" if msg["role"] == "user" else "model"
        gemini_contents.append({
            "role":  role,
            "parts": [{"text": msg["content"]}],
        })

    payload = {
        "system_instruction": {"parts": [{"text": system}]},
        "contents": gemini_contents,
        "generationConfig": {
            "maxOutputTokens": 2048,
            "temperature":     0.7,
        },
    }

    async with httpx.AsyncClient(timeout=60) as client:
        if stream:
            url = (
                f"https://generativelanguage.googleapis.com/v1beta/models/"
                f"{model}:streamGenerateContent?alt=sse&key={api_key}"
            )
            async with client.stream("POST", url, json=payload) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if line.startswith("data: "):
                        raw = line[6:].strip()
                        if raw and raw != "[DONE]":
                            try:
                                data  = json.loads(raw)
                                parts = (
                                    data.get("candidates", [{}])[0]
                                    .get("content", {})
                                    .get("parts", [])
                                )
                                for part in parts:
                                    text = part.get("text", "")
                                    if text:
                                        yield text
                            except Exception:
                                pass
        else:
            url = (
                f"https://generativelanguage.googleapis.com/v1beta/models/"
                f"{model}:generateContent?key={api_key}"
            )
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data  = resp.json()
            parts = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [])
            )
            for part in parts:
                text = part.get("text", "")
                if text:
                    yield text


async def _openai_call(
    model_cfg: dict,
    messages: list,
    system: str,
    stream: bool,
) -> AsyncGenerator[str, None]:
    import httpx
    import json

    headers = {
        "Authorization": f"Bearer {model_cfg['api_key']}",
        "Content-Type":  "application/json",
    }
    payload = {
        "model":      model_cfg["model"],
        "messages":   [{"role": "system", "content": system}] + messages,
        "stream":     stream,
        "max_tokens": 2048,
        "temperature": 0.7,
    }

    async with httpx.AsyncClient(timeout=60) as client:
        if stream:
            async with client.stream(
                "POST",
                "https://api.openai.com/v1/chat/completions",
                json=payload,
                headers=headers,
            ) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if line.startswith("data: ") and "[DONE]" not in line:
                        try:
                            data  = json.loads(line[6:])
                            token = data["choices"][0]["delta"].get("content", "")
                            if token:
                                yield token
                        except Exception:
                            pass
        else:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                json=payload,
                headers=headers,
            )
            resp.raise_for_status()
            yield resp.json()["choices"][0]["message"]["content"]


async def _deepseek_call(
    model_cfg: dict,
    messages: list,
    system: str,
    stream: bool,
) -> AsyncGenerator[str, None]:
    """
    DeepSeek — OpenAI-compatible API.
    Kod yozish uchun maxsus system prompt qo'shiladi.
    """
    import httpx
    import json

    code_system = (
        system
        + "\n\nSen professional dasturchi yordamchisisan. "
        "Kodni to'liq, izohli va ishlaydigan holda yoz. "
        "Xatolarni aniqlab tuzat. Best practices larga amal qil."
    )

    headers = {
        "Authorization": f"Bearer {model_cfg['api_key']}",
        "Content-Type":  "application/json",
    }
    payload = {
        "model":      model_cfg["model"],
        "messages":   [{"role": "system", "content": code_system}] + messages,
        "stream":     stream,
        "max_tokens": 4096,
        "temperature": 0.1,   # Kod uchun past temperature
    }

    async with httpx.AsyncClient(timeout=90) as client:
        if stream:
            async with client.stream(
                "POST",
                "https://api.deepseek.com/v1/chat/completions",
                json=payload,
                headers=headers,
            ) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if line.startswith("data: ") and "[DONE]" not in line:
                        try:
                            data  = json.loads(line[6:])
                            token = data["choices"][0]["delta"].get("content", "")
                            if token:
                                yield token
                        except Exception:
                            pass
        else:
            resp = await client.post(
                "https://api.deepseek.com/v1/chat/completions",
                json=payload,
                headers=headers,
            )
            resp.raise_for_status()
            yield resp.json()["choices"][0]["message"]["content"]


# Provider → caller xaritasi
_CALLERS = {
    "groq":     _groq_call,
    "gemini":   _gemini_call,
    "openai":   _openai_call,
    "deepseek": _deepseek_call,
}


# ── Asosiy routing funksiyasi ─────────────────────────────────

async def routed_chat(
    messages:  list,
    system:    str  = "Siz foydali AI yordamchisiz.",
    stream:    bool = True,
    intent:    str  = None,
    user_plan: str  = "free",
) -> AsyncGenerator[str, None]:
    """
    Smart routing bilan AI chaqiruv.

    intent ni o'zing berish mumkin: 'chat' | 'code' | 'think'
    Bo'lmasa, oxirgi xabar matnidan avtomatik aniqlanadi.
    """
    # Intent aniqlash
    if not intent:
        last_msg = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                last_msg = m.get("content", "")
                break
        intent = detect_intent(last_msg)

    # Model tartibi
    route = get_route(intent)

    if not route:
        yield "Hech qanday AI modeli sozlanmagan. .env faylini tekshiring."
        return

    print(f"[Router] Intent: {intent} | Route: {[r['name'] for r in route]}")

    last_error = ""
    for model_cfg in route:
        if not _State.available(model_cfg["name"]):
            continue

        caller = _CALLERS.get(model_cfg["name"])
        if not caller:
            continue

        try:
            print(f"[Router] Ishlatilmoqda: {model_cfg['label']}")
            count = 0

            async for token in caller(model_cfg, messages, system, stream):
                yield token
                count += 1

            if count > 0:
                _State.ok(model_cfg["name"])
                return

        except Exception as e:
            last_error = str(e)
            print(f"[Router] '{model_cfg['name']}' xato: {e}")
            _State.fail(model_cfg["name"])

    yield f"Barcha AI modellar javob bermadi. Xato: {last_error}"


async def routed_simple(
    messages: list,
    system:   str = "Siz foydali AI yordamchisiz.",
    intent:   str = None,
) -> str:
    """Streaming bo'lmagan javob."""
    parts = []
    async for token in routed_chat(
        messages=messages,
        system=system,
        stream=False,
        intent=intent,
    ):
        parts.append(token)
    return "".join(parts)


# ── Admin funksiyalari ────────────────────────────────────────

def get_router_status() -> list[dict]:
    """Barcha modellar holati."""
    return _State.status()


def reset_router():
    """Barcha modellarni qayta tiklash."""
    _State.reset()


def force_model(name: str) -> bool:
    """Bitta modelni majburan ishlatish."""
    if name not in MODELS or not MODELS[name]["enabled"]:
        return False
    for n in MODELS:
        if n != name:
            _State.fail(n)
    _State.ok(name)
    return True


# ── Alias ─────────────────────────────────────────────────────
def choose_model(message: str = "", plan: str = "free") -> str:
    """smart_ai.py uchun moslik aliasi."""
    from config import DEFAULT_MODEL
    return DEFAULT_MODEL