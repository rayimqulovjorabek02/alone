"""
backend/app/core/response_filter.py — AI javobini filterlash
"""
import re


def filter_response(text: str) -> str:
    """AI javobini tozalash va filterlash."""
    if not text:
        return ""

    text = text.strip()

    # System prompt izlarini olib tashlash
    patterns_to_remove = [
        r"^(As an AI|I'm an AI|As a language model)[,:]?\s*",
        r"^(Note:|Important:|Warning:)\s*I (cannot|can't|won't)\s*",
    ]
    for pattern in patterns_to_remove:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE | re.MULTILINE)

    # Ortiqcha bo'sh qatorlarni tozalash
    text = re.sub(r'\n{4,}', '\n\n\n', text)

    return text.strip()


def format_code_blocks(text: str) -> str:
    """Kod bloklarini formatlash."""
    # Tilsiz kod bloklarini aniqlash va qo'shish
    text = re.sub(r'```\n', '```plaintext\n', text)
    return text