"""
backend/app/core/file_security.py — Fayl xavfsizligi tekshiruvi
"""
import os
import magic  # python-magic


ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/csv",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB


def check_file(path: str) -> tuple[bool, str]:
    """
    Faylni xavfsizlik nuqtai nazaridan tekshirish.
    Returns: (is_safe, reason)
    """
    # Hajm tekshirish
    size = os.path.getsize(path)
    if size > MAX_FILE_SIZE:
        return False, f"Fayl {MAX_FILE_SIZE // (1024*1024)}MB dan kichik bo'lsin"

    if size == 0:
        return False, "Fayl bo'sh"

    # MIME tur tekshirish (python-magic kerak)
    try:
        mime = magic.from_file(path, mime=True)
        if mime not in ALLOWED_MIME_TYPES:
            return False, f"Fayl turi qo'llab-quvvatlanmaydi: {mime}"
    except Exception:
        # magic o'rnatilmagan bo'lsa, kengaytma bo'yicha tekshirish
        ext = os.path.splitext(path)[-1].lower()
        if ext not in {'.pdf', '.docx', '.txt', '.csv', '.jpg', '.jpeg', '.png', '.webp', '.gif'}:
            return False, f"Kengaytma qo'llab-quvvatlanmaydi: {ext}"

    return True, ""