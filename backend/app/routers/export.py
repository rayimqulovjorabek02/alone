"""
backend/app/routers/export.py — Chat eksport
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
import io, json
from core.jwt import get_current_user
from database import get_session_messages, get_db

router = APIRouter(prefix="/api/export", tags=["export"])


@router.get("/chat/{session_id}")
async def export_chat(session_id: int, format: str = "txt", current: dict = Depends(get_current_user)):
    messages = get_session_messages(session_id)
    if not messages:
        raise HTTPException(404, "Xabarlar topilmadi")

    with get_db() as conn:
        session = conn.execute("SELECT title FROM chat_sessions WHERE id=?", (session_id,)).fetchone()
    title = session["title"] if session else f"suhbat_{session_id}"

    if format == "json":
        content  = json.dumps(messages, ensure_ascii=False, indent=2)
        filename = f"{title}.json"
        media    = "application/json"
    elif format == "md":
        lines    = [f"# {title}\n"]
        for m in messages:
            icon = "U" if m["role"] == "user" else "AI"
            lines.append(f"## [{icon}]\n{m['content']}\n")
        content  = "\n".join(lines)
        filename = f"{title}.md"
        media    = "text/markdown"
    else:
        lines    = [f"=== {title} ===\n"]
        for m in messages:
            prefix = "SEN" if m["role"] == "user" else "AI"
            lines.append(f"[{prefix}] {m['content']}\n")
        content  = "\n".join(lines)
        filename = f"{title}.txt"
        media    = "text/plain"

    buf = io.BytesIO(content.encode("utf-8"))
    return StreamingResponse(buf, media_type=media,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )