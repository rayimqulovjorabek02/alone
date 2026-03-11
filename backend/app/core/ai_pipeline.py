"""
backend/app/core/ai_pipeline.py
AI pipeline — kontekst yig'ish, xotira, qidiruv

Bu modul faqat bir ish qiladi:
  foydalanuvchi xabari + tarix → system_prompt + messages
"""
import os
from core.memory_engine import get_relevant_memory, auto_extract_from_conversation
from core.system_prompt  import get_system_prompt, build_prompt
from core.cache          import get_cache, save_cache, cached_get_settings
from core.search         import search_web

try:
    from core.embeddings   import create_embedding, add_memory, search_memory
    EMBEDDINGS_ENABLED = True
except Exception:
    EMBEDDINGS_ENABLED = False

try:
    from core.tool_selector  import choose_tool
    from core.tool_runner    import run_tool
    TOOLS_ENABLED = True
except Exception:
    TOOLS_ENABLED = False

try:
    from core.prompt_security import check_message
    from core.response_filter import filter_response, format_code_blocks
    SECURITY_ENABLED = True
except Exception:
    SECURITY_ENABLED = False
    def check_message(t): return True, ""
    def filter_response(t): return t
    def format_code_blocks(t): return t

DEFAULT_SYSTEM = """Sen Alone AI — o'zbek tilida ishlaydigan aqlli yordamchisan.
Qoidalar:
- foydalanuvchiga yordam ber
- aniq va tushunarli javob yoz
- do'stona uslubda javob ber"""

SEARCH_KEYWORDS = [
    "who", "what", "news", "qachon", "kim", "yangilik", "hozir", "bugun",
    "narxi", "price", "weather", "ob-havo",
]


def build_context(user_id: str, message: str, history: list = None) -> tuple:
    """
    Kontekst yig'ish.
    Qaytaradi: (system_prompt, messages, embedding)
    """
    # Vector memory
    embedding   = None
    memory_text = ""
    if EMBEDDINGS_ENABLED:
        try:
            embedding = create_embedding(message)
            memories  = search_memory(user_id, embedding)
            if memories:
                memory_text = "\n".join(memories)
        except Exception:
            pass

    # Prompt security tekshiruvi
    if SECURITY_ENABLED:
        is_safe, reason = check_message(message)
        if not is_safe:
            raise ValueError(f"Xabar bloklandi: {reason}")

    # Tool
    tool_result = ""
    if TOOLS_ENABLED:
        try:
            tool = choose_tool(message)
            if tool != "none":
                tool_result = run_tool(tool, message)
        except Exception:
            pass

    # Web search
    search_data = ""
    if any(k in message.lower() for k in SEARCH_KEYWORDS):
        try:
            search_data = search_web(message)
        except Exception:
            pass

    # System prompt
    try:
        from core.memory_engine import get_all_memory
        profile       = get_all_memory(user_id)
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


def apply_filters(answer: str) -> str:
    """AI javobiga filter va format qo'llash."""
    if SECURITY_ENABLED:
        answer = filter_response(answer)
        answer = format_code_blocks(answer)
    return answer


def save_context(user_id: str, message: str, answer: str, embedding):
    """Javobni xotira va cache ga saqlash."""
    if EMBEDDINGS_ENABLED and embedding is not None:
        try:
            add_memory(user_id, message, embedding)
        except Exception:
            pass
    try:
        save_cache(message, answer)
    except Exception:
        pass