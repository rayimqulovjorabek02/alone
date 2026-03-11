"""
backend/app/core/smart_ai.py
Alone AI asosiy AI pipeline

Routing:
  Groq       → tez chat
  Gemini     → reasoning, tahlil
  OpenAI     → universal fallback
  DeepSeek   → kod yozish

Eski funksiyalar saqlab qolindi:
  run_ai(), stream_ai(), post_process()
"""

import os
from typing import AsyncGenerator, Generator
from dotenv import load_dotenv

from core.cache import get_cache, save_cache
from core.memory_engine import get_memory
from core.system_prompt import build_prompt
from core.search import search_web
from core.model_router import choose_model
from core.tool_selector import choose_tool
from core.tool_runner import run_tool
from core.embeddings import create_embedding
from core.embeddings import search_memory, add_memory
from core.model_router import routed_chat, routed_simple, detect_intent

load_dotenv()

DEFAULT_SYSTEM = """
Sen Alone AI — o'zbek tilida ishlaydigan aqlli yordamchisan.

Qoidalar:
- foydalanuvchiga yordam ber
- aniq va tushunarli javob yoz
- ortiqcha texnik gaplar yozma
- do'stona uslubda javob ber
"""


# ── Kontekst tayyorlash ───────────────────────────────────────

def _build_context(
    user_id: str,
    message: str,
    history: list | None = None,
) -> tuple:
    """Cache, memory, tools, search yig'ib system + messages qaytaradi."""

    # Vector memory
    embedding   = None
    memory_text = ""
    try:
        embedding  = create_embedding(message)
        memories   = search_memory(user_id, embedding)
        if memories:
            memory_text = "\n".join(memories)
    except Exception:
        pass

    # Tool
    tool_result = ""
    try:
        tool = choose_tool(message)
        if tool != "none":
            tool_result = run_tool(tool, message)
    except Exception:
        pass

    # Web search
    search_data = ""
    keywords = ["who", "what", "news", "qachon", "kim", "yangilik", "hozir", "bugun"]
    if any(k in message.lower() for k in keywords):
        try:
            search_data = search_web(message)
        except Exception:
            pass

    # System prompt
    try:
        profile       = get_memory(user_id)
        system_prompt = build_prompt(profile) or DEFAULT_SYSTEM
    except Exception:
        system_prompt = DEFAULT_SYSTEM

    # Messages
    messages = []
    if history:
        messages.extend(history[-10:])

    extras = []
    if memory_text:
        extras.append(f"[Xotira]\n{memory_text}")
    if tool_result:
        extras.append(f"[Tool]\n{tool_result}")
    if search_data:
        extras.append(f"[Qidiruv]\n{search_data}")

    user_content = message
    if extras:
        user_content = message + "\n\n" + "\n\n".join(extras)

    messages.append({"role": "user", "content": user_content})

    return system_prompt, messages, embedding


def _save(user_id: str, message: str, answer: str, embedding):
    try:
        if embedding is not None:
            add_memory(user_id, message, embedding)
    except Exception:
        pass
    try:
        save_cache(message, answer)
    except Exception:
        pass


# ── ASYNC STREAMING (WebSocket) ───────────────────────────────

async def stream_ai_response(
    messages:  list,
    system:    str  = DEFAULT_SYSTEM,
    user_plan: str  = "free",
    intent:    str  = None,
) -> AsyncGenerator[str, None]:
    """
    Async streaming — chat.py WebSocket da ishlatiladi.

    Intent avtomatik aniqlanadi:
      'chat'  → Groq (tez)
      'think' → Gemini (chuqur)
      'code'  → DeepSeek
    """
    async for token in routed_chat(
        messages=messages,
        system=system,
        stream=True,
        intent=intent,
        user_plan=user_plan,
    ):
        yield token


# ── ASYNC ODDIY JAVOB ─────────────────────────────────────────

async def get_ai_response(
    messages: list,
    system:   str = DEFAULT_SYSTEM,
    intent:   str = None,
) -> str:
    """
    Async, streaming bo'lmagan javob.
    Agent, memory extraction, tool runner uchun.
    """
    return await routed_simple(
        messages=messages,
        system=system,
        intent=intent,
    )


async def quick_answer(
    prompt: str,
    system: str   = "Qisqa va aniq javob ber.",
    intent: str   = "chat",
) -> str:
    """Ichki funksiyalar uchun tez javob."""
    return await routed_simple(
        messages=[{"role": "user", "content": prompt}],
        system=system,
        intent=intent,
    )


async def code_answer(prompt: str, system: str = DEFAULT_SYSTEM) -> str:
    """Kod yozish uchun — DeepSeek birinchi ishlatiladi."""
    return await routed_simple(
        messages=[{"role": "user", "content": prompt}],
        system=system,
        intent="code",
    )


async def think_answer(prompt: str, system: str = DEFAULT_SYSTEM) -> str:
    """Chuqur tahlil uchun — Gemini birinchi ishlatiladi."""
    return await routed_simple(
        messages=[{"role": "user", "content": prompt}],
        system=system,
        intent="think",
    )


# ── SYNC PIPELINE (eski kod bilan moslik) ────────────────────

def run_ai(
    user_id: str,
    message: str,
    history: list | None = None,
) -> str:
    """Sinxron AI pipeline — eski routerlar uchun saqlab qolindi."""
    import asyncio

    cached = get_cache(message)
    if cached:
        return cached

    system_prompt, messages, embedding = _build_context(user_id, message, history)
    intent = detect_intent(message)

    try:
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop and loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                future = pool.submit(
                    asyncio.run,
                    routed_simple(messages=messages, system=system_prompt, intent=intent)
                )
                answer = future.result(timeout=60)
        else:
            answer = asyncio.run(
                routed_simple(messages=messages, system=system_prompt, intent=intent)
            )
    except Exception as e:
        return f"AI xato: {e}"

    _save(user_id, message, answer, embedding)
    return answer.strip()


def stream_ai(
    user_id: str,
    message: str,
    history: list | None = None,
) -> Generator[str, None, None]:
    """Sinxron streaming — eski sync endpointlar uchun saqlab qolindi."""
    try:
        from groq import Groq
        model_name = choose_model(message)

        msgs = [{"role": "system", "content": DEFAULT_SYSTEM}]
        if history:
            msgs.extend(history[-10:])
        msgs.append({"role": "user", "content": message})

        client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))
        stream = client.chat.completions.create(
            model=model_name,
            messages=msgs,
            temperature=0.7,
            max_tokens=2048,
            stream=True,
        )
        for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta

    except Exception as e:
        yield f"Xato: {e}"


def post_process(text: str) -> str:
    if not text:
        return ""
    return text.strip()

def run_pipeline(user_id, message, history=None):
    return run_ai(user_id, message, history)
