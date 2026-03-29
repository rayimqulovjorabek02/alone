"""
backend/app/routers/chat.py — WebSocket chat, sessiyalar
"""
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from pydantic import BaseModel
from core.jwt import get_current_user, decode_token
from core.smart_ai import stream_ai_response, post_process
from core.system_prompt import get_system_prompt
from core.memory_engine import get_relevant_memory, auto_extract_from_conversation
from core.search import web_search
from core.cache import cached_get_settings
from database import (
    save_message_session, get_session_messages,
    get_sessions_list, create_session_full,
    delete_session_full, auto_name_session,
    get_usage, increment_usage, get_plan
)
from config import PLANS, DEFAULT_MODEL, CONTEXT_WINDOW

router = APIRouter(prefix="/api/chat", tags=["chat"])


# ── SESSIYALAR ────────────────────────────────────────────────

@router.get("/sessions")
async def get_sessions(current: dict = Depends(get_current_user)):
    return get_sessions_list(current["user_id"])


@router.post("/sessions")
async def new_session(current: dict = Depends(get_current_user)):
    sid = create_session_full(current["user_id"])
    return {"id": sid, "title": "Yangi suhbat"}


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: int, current: dict = Depends(get_current_user)):
    delete_session_full(session_id)
    return {"success": True}


@router.get("/sessions/{session_id}/messages")
async def get_messages(session_id: int, current: dict = Depends(get_current_user)):
    return get_session_messages(session_id)


# ── WEBSOCKET ─────────────────────────────────────────────────

@router.websocket("/ws/{token}")
async def websocket_chat(websocket: WebSocket, token: str):
    await websocket.accept()

    try:
        payload  = decode_token(token)
        user_id  = payload["user_id"]
        username = payload["username"]
    except Exception:
        await websocket.send_json({"type": "error", "message": "Token notogri"})
        await websocket.close()
        return

    try:
        while True:
            raw  = await websocket.receive_text()
            data = json.loads(raw)

            user_msg   = data.get("message", "").strip()
            session_id = data.get("session_id", 0)
            model      = data.get("model", DEFAULT_MODEL)

            if not user_msg:
                continue

            # Limit tekshirish
            plan  = get_plan(user_id)
            limit = PLANS[plan]["limits"]["messages"]
            usage = get_usage(user_id, "messages")
            if usage >= limit:
                await websocket.send_json({
                    "type":    "error",
                    "message": f"Kunlik limit ({limit} ta) tugadi. Premium plan oling!",
                })
                continue

            # Sessiya yaratish
            if not session_id:
                session_id = create_session_full(user_id, user_msg[:50], model)
                await websocket.send_json({"type": "session_created", "session_id": session_id})

            # Settings va xotira
            settings      = cached_get_settings(user_id)
            # chat_language — AI javob berish tili (60+ til)
            # language      — interfeys tili (faqat uz/ru/en)
            language = settings.get("chat_language") or settings.get("language", "uz")
            ai_style = settings.get("ai_style", "friendly")
            name     = settings.get("name") or username

            # ── 1. Foydalanuvchi tilni o'zgartirish so'rasa ──────────
            LANG_KEYWORDS = {
                "uz": ["o'zbek tilida", "uzbek tilida", "o'zbekcha", "uzbekcha"],
                "ru": ["на русском", "по-русски", "русском языке", "rus tilida", "ruscha"],
                "en": ["in english", "english tilida", "ingliz tilida", "inglizcha"],
                "tr": ["türkçe", "turkish", "turk tilida"],
                "de": ["auf deutsch", "german tilida", "nemis tilida"],
                "fr": ["en français", "french tilida", "fransuz tilida"],
                "ar": ["بالعربية", "arab tilida", "arabcha"],
                "zh": ["用中文", "chinese tilida", "xitoy tilida"],
                "es": ["en español", "spanish tilida", "ispan tilida"],
                "ko": ["한국어로", "korean tilida", "koreys tilida"],
                "ja": ["日本語で", "japanese tilida", "yapon tilida"],
                "kk": ["қазақша", "qazaqsha", "qozoq tilida"],
                "ky": ["кыргызча", "kyrgyzcha"],
                "tg": ["тоҷикӣ", "tojikcha"],
                "az": ["azərbaycanca", "azerbayjon tilida"],
                "tk": ["türkmençe", "türkmen tilida"],
            }
            msg_lower = user_msg.lower()
            for lang_code, keywords in LANG_KEYWORDS.items():
                if any(kw in msg_lower for kw in keywords):
                    language = lang_code
                    break

            # ── 2. Avtomatik til aniqlash ─────────────────────────────
            # Agar foydalanuvchi xabar lotin/kirill/arab harflarida bo'lsa
            else_auto = True
            if else_auto and len(user_msg.strip()) > 3:
                # Kirill harflari ko'p bo'lsa — rus tili
                cyrillic = sum(1 for c in user_msg if '\u0400' <= c <= '\u04FF')
                latin    = sum(1 for c in user_msg if c.isascii() and c.isalpha())
                arabic   = sum(1 for c in user_msg if '\u0600' <= c <= '\u06FF')
                chinese  = sum(1 for c in user_msg if '\u4e00' <= c <= '\u9fff')
                total    = max(len(user_msg), 1)

                if cyrillic / total > 0.3:
                    # Ko'p kirill — rus yoki o'zbek kirill
                    # O'zbek kirillida maxsus harflar: ғ қ ҳ ў ё
                    uzbek_chars = sum(1 for c in user_msg if c in 'ғқҳўёҒҚҲЎЁ')
                    if uzbek_chars > 0:
                        language = "uz"
                    else:
                        language = "ru"
                elif arabic / total > 0.3:
                    language = "ar"
                elif chinese / total > 0.3:
                    language = "zh"
                # Lotin harflar ko'p bo'lsa — settings dagi tilni saqlab qol

            memory   = get_relevant_memory(user_id, user_msg)

            # Sessiya tarixi
            history  = get_session_messages(session_id, limit=CONTEXT_WINDOW)
            messages = [{"role": r["role"], "content": r["content"]} for r in history]

            # Veb qidiruv
            search_keywords = ["hozir", "bugun", "yangilik", "narx", "ob-havo", "kim", "qachon"]
            search_result   = ""
            if any(kw in user_msg.lower() for kw in search_keywords):
                try:
                    search_result = await web_search(user_msg)
                except Exception:
                    pass

            # System prompt
            sys_prompt = get_system_prompt(name, ai_style, language, memory, user_msg)
            if search_result:
                sys_prompt += f"\n\nVeb qidiruv natijasi:\n{search_result}"

            # Xabarni saqlash
            save_message_session(user_id, session_id, "user", user_msg)
            increment_usage(user_id, "messages")

            if len(history) == 0:
                auto_name_session(session_id, user_msg)

            # AI javob — streaming
            await websocket.send_json({"type": "start"})

            full_response = ""
            try:
                async for chunk in stream_ai_response(
                    messages=messages + [{"role": "user", "content": user_msg}],
                    system=sys_prompt,
                ):
                    if chunk:
                        full_response += chunk
                        await websocket.send_json({"type": "chunk", "content": chunk})
            except Exception as e:
                await websocket.send_json({"type": "error", "message": f"AI xato: {e}"})
                continue

            full_response = post_process(full_response)

            if full_response:
                save_message_session(user_id, session_id, "assistant", full_response)
                auto_extract_from_conversation(user_id, user_msg, full_response)

            await websocket.send_json({
                "type":       "done",
                "session_id": session_id,
                "usage":      usage + 1,
                "limit":      limit,
            })

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass