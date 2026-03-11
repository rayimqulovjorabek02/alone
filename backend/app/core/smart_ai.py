"""
backend/app/core/smart_ai.py
Alone AI — asosiy AI interfeysi

Har bir funksiya faqat bir ish qiladi:
  stream_ai_response() → async streaming (WebSocket)
  get_ai_response()    → async oddiy javob
  quick_answer()       → tez javob (ichki funksiyalar uchun)
  code_answer()        → kod yozish (DeepSeek)
  think_answer()       → chuqur tahlil (Gemini)
  run_ai()             → sync (eski kod bilan moslik)
  stream_ai()          → sync streaming (eski kod bilan moslik)
"""
from core.ai_pipeline    import build_context, save_context, apply_filters, DEFAULT_SYSTEM
from core.model_router_v2 import routed_chat, routed_simple, detect_intent
from core.cache          import get_cache
from typing import AsyncGenerator, Generator


# ── ASYNC STREAMING ───────────────────────────────────────────

async def stream_ai_response(
    messages:  list,
    system:    str  = DEFAULT_SYSTEM,
    user_plan: str  = "free",
    intent:    str  = None,
) -> AsyncGenerator[str, None]:
    """WebSocket chat uchun async streaming."""
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
    """Agent, tool runner uchun async javob."""
    return await routed_simple(messages=messages, system=system, intent=intent)


async def quick_answer(prompt: str, system: str = "Qisqa va aniq javob ber.", intent: str = "chat") -> str:
    """Ichki funksiyalar uchun tez javob."""
    return await routed_simple(
        messages=[{"role": "user", "content": prompt}],
        system=system,
        intent=intent,
    )


async def code_answer(prompt: str, system: str = DEFAULT_SYSTEM) -> str:
    """Kod yozish — DeepSeek birinchi."""
    return await routed_simple(
        messages=[{"role": "user", "content": prompt}],
        system=system,
        intent="code",
    )


async def think_answer(prompt: str, system: str = DEFAULT_SYSTEM) -> str:
    """Chuqur tahlil — Gemini birinchi."""
    return await routed_simple(
        messages=[{"role": "user", "content": prompt}],
        system=system,
        intent="think",
    )


# ── SYNC (eski kod bilan moslik) ──────────────────────────────

def run_ai(user_id: str, message: str, history: list = None) -> str:
    """Sinxron AI pipeline."""
    import asyncio

    cached = get_cache(message)
    if cached:
        return cached

    system_prompt, messages, embedding = build_context(user_id, message, history)
    intent = detect_intent(message)

    try:
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop and loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                future = pool.submit(asyncio.run, routed_simple(
                    messages=messages, system=system_prompt, intent=intent
                ))
                answer = future.result(timeout=60)
        else:
            answer = asyncio.run(routed_simple(
                messages=messages, system=system_prompt, intent=intent
            ))
    except Exception as e:
        return f"AI xato: {e}"

    save_context(user_id, message, answer, embedding)
    return answer.strip()


def stream_ai(user_id: str, message: str, history: list = None) -> Generator[str, None, None]:
    """Sinxron streaming."""
    import os
    try:
        from groq import Groq
        msgs = [{"role": "system", "content": DEFAULT_SYSTEM}]
        if history:
            msgs.extend(history[-10:])
        msgs.append({"role": "user", "content": message})
        client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))
        stream = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
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
    return text.strip() if text else ""


# ── Qo'shimcha aliaslar ───────────────────────────────────────

async def run_pipeline(user_id: str, message: str, history: list = None, **kwargs) -> str:
    """run_ai uchun async alias."""
    system_prompt, messages, embedding = build_context(user_id, message, history)
    intent = detect_intent(message)
    answer = await routed_simple(messages=messages, system=system_prompt, intent=intent)
    answer = apply_filters(answer)
    save_context(user_id, message, answer, embedding)
    return answer.strip()