"""
backend/app/routers/file_analysis.py — Fayl tahlil
"""
import os
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from core.jwt import get_current_user

router   = APIRouter(prefix="/api/files", tags=["files"])
GROQ_KEY = os.getenv("GROQ_API_KEY", "")


def _read_file(path: str, ext: str) -> str:
    if ext == ".pdf":
        try:
            from pypdf import PdfReader
            reader = PdfReader(path)
            return "\n".join(p.extract_text() or "" for p in reader.pages)
        except Exception:
            return ""
    elif ext == ".docx":
        try:
            from docx import Document
            doc = Document(path)
            return "\n".join(p.text for p in doc.paragraphs)
        except Exception:
            return ""
    else:
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        except Exception:
            return ""


@router.post("/analyze")
async def analyze_file(
    file:     UploadFile = File(...),
    question: str = "Bu faylni tahlil qil",
    current:  dict = Depends(get_current_user)
):
    ext = os.path.splitext(file.filename or "")[-1].lower() or ".txt"
    content = await file.read()

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(400, "Fayl 10MB dan kichik bolsin")

    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        text = _read_file(tmp_path, ext)
        if not text.strip():
            raise HTTPException(400, "Fayl bosh yoki oqub bolmadi")

        from groq import Groq
        client   = Groq(api_key=GROQ_KEY)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Faylni tahlil qil. Uzbek tilida javob ber."},
                {"role": "user",   "content": f"Fayl:\n{text[:12000]}\n\nSavol: {question}"}
            ],
            max_tokens=2048,
        )
        return {
            "filename": file.filename,
            "text_len": len(text),
            "analysis": response.choices[0].message.content,
        }
    finally:
        os.unlink(tmp_path)