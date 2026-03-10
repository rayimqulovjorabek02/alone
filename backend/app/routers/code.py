"""
backend/app/routers/code.py — Kod yozish va tushuntirish
"""
import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from core.jwt import get_current_user

router   = APIRouter()
GROQ_KEY = os.getenv("GROQ_API_KEY", "")


class CodeRequest(BaseModel):
    prompt:   str
    language: str = "python"
    action:   str = "write"  # write | explain | fix | optimize | review


@router.post("")
async def code_assistant(body: CodeRequest, current: dict = Depends(get_current_user)):
    if not body.prompt.strip():
        raise HTTPException(400, "Prompt kerak")

    action_prompts = {
        "write":    f"{body.language} tilida kod yoz. Faqat kod va qisqa izoh ber.",
        "explain":  f"Bu kodni tushuntir. O'zbek tilida batafsil izohla.",
        "fix":      f"Bu koddagi xatolarni tuzat va tushuntir.",
        "optimize": f"Bu kodni optimalllashtir va yaxshilanishlarni tushuntir.",
        "review":   f"Bu kodni ko'rib chiq. Kamchiliklar va yaxshilanishlar haqida yoz.",
    }

    system = f"""Sen tajribali dasturchi. {action_prompts.get(body.action, action_prompts['write'])}
Kod qismlarini ```{body.language} ... ``` bloklari ichida yoz."""

    from groq import Groq
    client = Groq(api_key=GROQ_KEY)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": body.prompt}
        ],
        max_tokens=4096,
        temperature=0.3,
    )
    return {
        "result":   response.choices[0].message.content,
        "language": body.language,
        "action":   body.action,
    }