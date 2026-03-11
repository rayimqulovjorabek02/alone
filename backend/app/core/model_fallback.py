"""
backend/app/core/model_fallback.py
AI model fallback tizimi

Tartib:
  1. Groq         (llama-3.3-70b)   — asosiy, tez, bepul
  2. Gemini        (gemini-1.5-flash) — Google, bepul limit bor
  3. HuggingFace   (mistral-7b)      — bepul, sekinroq
  4. Ollama        (local llama3)    — internet kerak emas
"""

import os
import time
import sqlite3
from typing import AsyncGenerator

from config import DB_PATH


# ── Provayder konfiguratsiyasi ────────────────────────────────

PROVIDERS = [
    {
        "name":     "groq",
        "label":    "Groq (llama-3.3-70b)",
        "type":     "groq",
        "model":    "llama-3.3-70b-versatile",
        "api_key":  os.getenv("GROQ_API_KEY", ""),
        "enabled":  bool(os.getenv("GROQ_API_KEY", "")),
        "priority": 1,
    },
    {
        "name":     "gemini",
        "label":    "Gemini (gemini-1.5-flash)",
        "type":     "gemini",
        "model":    "gemini-1.5-flash",
        "api_key":  os.getenv("GEMINI_API_KEY", ""),
        "enabled":  bool(os.getenv("GEMINI_API_KEY", "")),
        "priority": 2,
    },
    {
        "name":     "huggingface",
        "label":    "HuggingFace (mistral-7b)",
        "type":     "hf",
        "model":    "mistralai/Mistral-7B-Instruct-v0.3",
        "api_key":  os.getenv("HUGGINGFACE_API_KEY", ""),
        "enabled":  bool(os.getenv("HUGGINGFACE_API_KEY", "")),
        "priority": 3,
    },
    {
        "name":     "ollama",
        "label":    "Ollama (local llama3)",
        "type":     "ollama",
        "model":    os.getenv("OLLAMA_MODEL", "llama3"),
        "api_key":  "",
        "base_url": os.getenv("OLLAMA_URL", "http://localhost:11434"),
        "enabled":  os.getenv("OLLAMA_ENABLED", "false").lower() == "true",
        "priority": 4,
    },
]


# ── Provayder holati kuzatuvi ─────────────────────────────────

class ProviderState:
    _failed: dict = {}   # name -> retry_after timestamp

    @classmethod
    def mark_failed(cls, name: str):
        retry_after = time.time() + 60
        cls._failed[name] = retry_after
        print(f"Provider '{name}' xato berdi. 60s dan keyin qayta sinab koriladi.")
        _log_event(name, "failed")

    @classmethod
    def mark_ok(cls, name: str):
        if name in cls._failed:
            del cls._failed[name]
            print(f"Provider '{name}' qayta ishlayapti.")
            _log_event(name, "recovered")

    @classmethod
    def is_available(cls, name: str) -> bool:
        retry_after = cls._failed.get(name)
        if retry_after is None:
            return True
        if time.time() > retry_after:
            del cls._failed[name]
            return True
        return False

    @classmethod
    def get_all_status(cls) -> list:
        result = []
        for p in PROVIDERS:
            name = p["name"]
            retry_after = cls._failed.get(name, 0)
            retry_in = max(0, int(retry_after - time.time())) if retry_after else 0
            result.append({
                "name":      name,
                "label":     p["label"],
                "enabled":   p["enabled"],
                "available": cls.is_available(name),
                "retry_in":  retry_in,
            })
        return result


def _log_event(provider: str, event: str):
    try:
        with sqlite3.connect(DB_PATH) as db:
            db.execute(
                "CREATE TABLE IF NOT EXISTS provider_log "
                "(id INTEGER PRIMARY KEY AUTOINCREMENT, "
                "provider TEXT, event TEXT, "
                "created_at REAL DEFAULT (unixepoch()))"
            )
            db.execute(
                "INSERT INTO provider_log (provider, event) VALUES (?, ?)",
                (provider, event)
            )
            db.commit()
    except Exception:
        pass


# ── Har bir provayder uchun so'rov yuboruvchi ─────────────────

async def _call_groq(
    provider: dict,
    messages: list,
    system: str,
    stream: bool,
) -> AsyncGenerator[str, None]:
    from groq import AsyncGroq
    client = AsyncGroq(api_key=provider["api_key"])
    all_messages = [{"role": "system", "content": system}] + messages

    if stream:
        response = await client.chat.completions.create(
            model=provider["model"],
            messages=all_messages,
            stream=True,
            max_tokens=2048,
        )
        async for chunk in response:
            content = chunk.choices[0].delta.content
            if content:
                yield content
    else:
        response = await client.chat.completions.create(
            model=provider["model"],
            messages=all_messages,
            stream=False,
            max_tokens=2048,
        )
        yield response.choices[0].message.content


async def _call_gemini(
    provider: dict,
    messages: list,
    system: str,
    stream: bool,
) -> AsyncGenerator[str, None]:
    import httpx
    import json

    api_key = provider["api_key"]
    model   = provider["model"]

    # Gemini format: messages ni birlashtirish
    gemini_contents = []
    for msg in messages:
        role = "user" if msg["role"] == "user" else "model"
        gemini_contents.append({
            "role": role,
            "parts": [{"text": msg["content"]}]
        })

    payload = {
        "system_instruction": {
            "parts": [{"text": system}]
        },
        "contents": gemini_contents,
        "generationConfig": {
            "maxOutputTokens": 2048,
            "temperature": 0.7,
        }
    }

    if stream:
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{model}:streamGenerateContent?alt=sse&key={api_key}"
        )
        async with httpx.AsyncClient(timeout=60) as client:
            async with client.stream("POST", url, json=payload) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if line.startswith("data: "):
                        raw = line[6:].strip()
                        if raw and raw != "[DONE]":
                            try:
                                data = json.loads(raw)
                                candidates = data.get("candidates", [])
                                if candidates:
                                    parts = candidates[0].get("content", {}).get("parts", [])
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
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                for part in parts:
                    text = part.get("text", "")
                    if text:
                        yield text


async def _call_huggingface(
    provider: dict,
    messages: list,
    system: str,
    stream: bool,
) -> AsyncGenerator[str, None]:
    import httpx

    # Mistral uchun prompt formatlash
    prompt = f"<s>[INST] {system}\n\n"
    for i, msg in enumerate(messages):
        if msg["role"] == "user":
            if i == 0:
                prompt += f"{msg['content']} [/INST] "
            else:
                prompt += f"<s>[INST] {msg['content']} [/INST] "
        else:
            prompt += f"{msg['content']} </s>"

    headers = {"Authorization": f"Bearer {provider['api_key']}"}
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 1024,
            "temperature": 0.7,
            "return_full_text": False,
        }
    }
    url = f"https://api-inference.huggingface.co/models/{provider['model']}"

    async with httpx.AsyncClient(timeout=90) as client:
        resp = await client.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        if isinstance(data, list) and len(data) > 0:
            yield data[0].get("generated_text", "")
        else:
            yield str(data)


async def _call_ollama(
    provider: dict,
    messages: list,
    system: str,
    stream: bool,
) -> AsyncGenerator[str, None]:
    import httpx
    import json

    base_url = provider.get("base_url", "http://localhost:11434")
    all_messages = [{"role": "system", "content": system}] + messages
    payload = {
        "model": provider["model"],
        "messages": all_messages,
        "stream": stream,
    }

    async with httpx.AsyncClient(timeout=120) as client:
        if stream:
            async with client.stream(
                "POST", f"{base_url}/api/chat", json=payload
            ) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            text = data.get("message", {}).get("content", "")
                            if text:
                                yield text
                        except Exception:
                            pass
        else:
            resp = await client.post(f"{base_url}/api/chat", json=payload)
            resp.raise_for_status()
            data = resp.json()
            yield data.get("message", {}).get("content", "")


# Provayder turi -> funksiya
CALLERS = {
    "groq":   _call_groq,
    "gemini": _call_gemini,
    "hf":     _call_huggingface,
    "ollama": _call_ollama,
}


# ── Asosiy fallback funksiyasi ────────────────────────────────

async def chat_with_fallback(
    messages: list,
    system: str = "Siz foydali AI yordamchisiz.",
    stream: bool = True,
    user_plan: str = "free",
) -> AsyncGenerator[str, None]:
    """
    Provayderlarni ketma-ket sinaydi.
    Biri xato berse, keyingisiga otadi.
    """
    # Faol va ustuvor provayderlarni olish
    active_providers = [
        p for p in sorted(PROVIDERS, key=lambda x: x["priority"])
        if p["enabled"] and ProviderState.is_available(p["name"])
    ]

    if not active_providers:
        yield "Hozirda AI xizmati mavjud emas. Iltimos keyinroq urinib koring."
        return

    last_error = ""
    for provider in active_providers:
        caller = CALLERS.get(provider["type"])
        if caller is None:
            continue

        try:
            print(f"AI provider: {provider['label']}")
            token_count = 0

            async for token in caller(provider, messages, system, stream):
                yield token
                token_count += 1

            if token_count > 0:
                ProviderState.mark_ok(provider["name"])
                return

        except Exception as e:
            last_error = str(e)
            print(f"Provider '{provider['name']}' xato: {e}")
            ProviderState.mark_failed(provider["name"])

    yield f"AI javob berishda muammo: {last_error}"


async def simple_chat(
    messages: list,
    system: str = "Siz foydali AI yordamchisiz.",
) -> str:
    """Streaming bolmagan oddiy chat javobi."""
    parts = []
    async for token in chat_with_fallback(messages, system, stream=False):
        parts.append(token)
    return "".join(parts)


# ── Admin funksiyalari ────────────────────────────────────────

def get_provider_status() -> list:
    return ProviderState.get_all_status()


def get_active_provider() -> dict:
    for p in sorted(PROVIDERS, key=lambda x: x["priority"]):
        if p["enabled"] and ProviderState.is_available(p["name"]):
            return p
    return {}


def force_provider(name: str) -> bool:
    """Faqat bitta provayerni majburan ishlatish."""
    target = None
    for p in PROVIDERS:
        if p["name"] == name:
            target = p
            break

    if target is None or not target["enabled"]:
        return False

    for p in PROVIDERS:
        if p["name"] != name:
            ProviderState.mark_failed(p["name"])
    ProviderState.mark_ok(name)
    return True


def reset_all_providers():
    """Barcha provayderlarni qayta tiklash."""
    ProviderState._failed.clear()