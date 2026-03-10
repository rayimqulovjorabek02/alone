"""
backend/app/routers/file_analysis.py — Fayl tahlil (PDF, DOCX, TXT)
"""
import os
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from core.jwt import get_current_user
from database import get_plan
from config import PLANS

router = APIRouter()
GROQ_KEY = os.getenv("GROQ_API_KEY", "")

ALLOWED_TYPES = {
    "application/pdf":     ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "text/plain":          ".txt",
    "text/csv":            ".csv",
}


def _read_file(path: str, ext: str) -> str:
    if ext == ".pdf":
        try:
            import PyPDF2
            with open(path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                return "\n".join(p.extract_text() or "" for p in reader.pages)
        except:
            return ""
    elif ext == ".docx":
        try:
            from docx import Document
            doc = Document(path)
            return "\n".join(p.text for p in doc.paragraphs)
        except:
            return ""
    else:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()


@router.post("/analyze")
async def analyze_file(
    file:     UploadFile = File(...),
    question: str = "Bu faylni tahlil qil va asosiy ma'lumotlarni ber",
    current:  dict = Depends(get_current_user)
):
    plan  = get_plan(current["user_id"])
    limit = PLANS[plan]["limits"]["files"]
    # (Kunlik limit tekshirish qo'shilishi mumkin)

    ext = os.path.splitext(file.filename or "")[-1].lower()
    if not ext:
        ext = ALLOWED_TYPES.get(file.content_type, ".txt")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(400, "Fayl 10MB dan kichik bo'lsin")

    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        text = _read_file(tmp_path, ext)
        if not text.strip():
            raise HTTPException(400, "Fayl bo'sh yoki o'qib bo'lmadi")

        # AI tahlil
        from groq import Groq
        client = Groq(api_key=GROQ_KEY)
        truncated = text[:12000]
        response  = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Faylni o'qib tahlil qil. O'zbek tilida javob ber."},
                {"role": "user",   "content": f"Fayl mazmuni:\n{truncated}\n\nSavol: {question}"}
            ],
            max_tokens=2048,
        )
        return {
            "filename":  file.filename,
            "text_len":  len(text),
            "analysis":  response.choices[0].message.content,
        }
    finally:
        os.unlink(tmp_path)