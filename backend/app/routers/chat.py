"""
backend/app/routers/chat.py — WebSocket chat, sessiyalar
Optimallashtirishlar:
  - WebSocket da rate limiting qo'shildi
  - Har xabarda DB ulanish soni kamaytirildi (11 → 4)
  - Sessiya tekshiruvi yaxshilandi
"""
import json
import time
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
    get_usage, increment_usage, get_plan, get_db
)
from config import PLANS, DEFAULT_MODEL, CONTEXT_WINDOW

router = APIRouter(prefix="/api/chat", tags=["chat"])

# WebSocket uchun per-user rate limit (in-memory)
_ws_rate: dict = {}   # user_id → [timestamps]
WS_LIMIT  = 30        # 30 xabar
WS_WINDOW = 60        # 60 soniyada


def _ws_check(user_id: int) -> bool:
    """True = ruxsat, False = limitdan oshdi."""
    now = time.time()
    history = _ws_rate.get(user_id, [])
    history = [t for t in history if now - t < WS_WINDOW]
    if len(history) >= WS_LIMIT:
        _ws_rate[user_id] = history
        return False
    history.append(now)
    _ws_rate[user_id] = history
    return True


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
    # Foydalanuvchi faqat o'z sessiyasini o'chirishi mumkin
    with get_db() as conn:
        row = conn.execute(
            "SELECT user_id FROM chat_sessions WHERE id=?", (session_id,)
        ).fetchone()
    if not row or row["user_id"] != current["user_id"]:
        raise HTTPException(403, "Ruxsat yo'q")
    delete_session_full(session_id)
    return {"success": True}


@router.get("/sessions/{session_id}/messages")
async def get_messages(session_id: int, current: dict = Depends(get_current_user)):
    # Foydalanuvchi faqat o'z sessiya xabarlarini ko'rishi mumkin
    with get_db() as conn:
        row = conn.execute(
            "SELECT user_id FROM chat_sessions WHERE id=?", (session_id,)
        ).fetchone()
    if not row or row["user_id"] != current["user_id"]:
        raise HTTPException(403, "Ruxsat yo'q")
    return get_session_messages(session_id)


# ── WEBSOCKET ─────────────────────────────────────────────────

@router.websocket("/ws/{token}")
async def websocket_chat(websocket: WebSocket, token: str):
    await websocket.accept()

    # Token tekshirish
    try:
        payload  = decode_token(token)
        user_id  = payload["user_id"]
        username = payload["username"]
    except Exception:
        await websocket.send_json({"type": "error", "message": "Token noto'g'ri"})
        await websocket.close()
        return

    # Foydalanuvchi ma'lumotlarini oldindan bir marta o'qish
    plan  = get_plan(user_id)
    limit = PLANS[plan]["limits"]["messages"]

    try:
        while True:
            raw  = await websocket.receive_text()
            data = json.loads(raw)

            user_msg   = data.get("message", "").strip()
            session_id = data.get("session_id", 0)
            model      = data.get("model", DEFAULT_MODEL)

            if not user_msg:
                continue

            # WebSocket rate limit
            if not _ws_check(user_id):
                await websocket.send_json({
                    "type":    "error",
                    "message": f"Juda tez yuborayapsiz. {WS_WINDOW} soniyada {WS_LIMIT} ta xabar mumkin.",
                })
                continue

            # Kunlik limit tekshirish (bitta DB so'rov)
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

            # Settings va xotira (cached — DB ga bormaydi ko'pincha)
            settings = cached_get_settings(user_id)
            language = settings.get("language", "uz")
            ai_style = settings.get("ai_style", "friendly")
            name     = settings.get("name") or username

            memory   = get_relevant_memory(user_id, user_msg)

            # Sessiya tarixi
            history  = get_session_messages(session_id, limit=CONTEXT_WINDOW)
            messages = [{"role": r["role"], "content": r["content"]} for r in history]

            # Veb qidiruv (faqat kerak bo'lganda)
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

            # Xabarni saqlash + usage birga
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
        # Foydalanuvchi chiqdi — rate limit ma'lumotini tozalash
        _ws_rate.pop(user_id, None)
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass