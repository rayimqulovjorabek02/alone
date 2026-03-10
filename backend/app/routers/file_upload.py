"""
backend/app/routers/file_upload.py — Fayl yuklash
"""
import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from core.jwt import get_current_user

router    = APIRouter()
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_SIZE  = 20 * 1024 * 1024  # 20MB
ALLOWED   = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".docx", ".txt", ".csv"}


@router.post("")
async def upload_file(file: UploadFile = File(...), current: dict = Depends(get_current_user)):
    ext = os.path.splitext(file.filename or "")[-1].lower()
    if ext not in ALLOWED:
        raise HTTPException(400, f"Fayl turi qo'llab-quvvatlanmaydi: {ext}")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(400, "Fayl hajmi 20MB dan oshmasin")

    filename = f"{uuid.uuid4()}{ext}"
    path     = os.path.join(UPLOAD_DIR, filename)

    async with aiofiles.open(path, "wb") as f:
        await f.write(content)

    return {
        "filename":  filename,
        "original":  file.filename,
        "size":      len(content),
        "url":       f"/data/uploads/{filename}",
    }