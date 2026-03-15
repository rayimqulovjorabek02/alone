"""
backend/app/routers/file_analysis.py — Fayl tahlil
"""
import os
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from core.jwt import get_current_user

router = APIRouter(tags=["files"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".xlsx", ".xls", ".pptx", ".ppt", ".txt", ".md", ".csv", ".json", ".py", ".js", ".ts", ".html", ".xml"}


def _groq_key(): return os.getenv("GROQ_API_KEY", "")


def _read_file(path: str, ext: str) -> str:
    from core.file_reader import read_file
    return read_file(path)


@router.post("/analyze")
async def analyze_file(
    file:     UploadFile = File(...),
    question: str = "Bu faylni tahlil qil",
    current:  dict = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(400, "Fayl nomi kerak")

    ext = os.path.splitext(file.filename)[-1].lower()
    if not ext:
        ext = ".txt"

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Qo'llab-quvvatlanmaydigan format: {ext}. Ruxsat etilganlar: {', '.join(ALLOWED_EXTENSIONS)}")

    content = await file.read()
    if not content:
        raise HTTPException(400, "Fayl bo'sh")
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(400, "Fayl 10MB dan kichik bo'lsin")

    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        text = _read_file(tmp_path, ext)
        print(f"[FileAnalysis] {file.filename} | ext={ext} | text={len(text)} belgi | preview={repr(text[:80])}")

        if not text or not text.strip() or text.startswith("["):
            raise HTTPException(400, f"Fayl o'qib bo'lmadi: {text[:100]}")

        groq_key = _groq_key()
        if not groq_key:
            raise HTTPException(500, "GROQ_API_KEY sozlanmagan")

        from groq import Groq
        client   = Groq(api_key=groq_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Faylni tahlil qil. O'zbek tilida javob ber. Aniq va batafsil bo'l."},
                {"role": "user",   "content": f"Fayl matni:\n{text[:12000]}\n\nSavol: {question}"}
            ],
            max_tokens=2048,
        )
        return {
            "filename": file.filename,
            "text_len": len(text),
            "analysis": response.choices[0].message.content,
        }
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass