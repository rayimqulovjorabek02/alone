"""
backend/app/core/security.py — Xavfsizlik tekshiruvlari
"""
import re
import hashlib
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def is_strong_password(password: str) -> tuple[bool, str]:
    if len(password) < 6:
        return False, "Parol kamida 6 ta belgi bo'lishi kerak"
    if len(password) > 128:
        return False, "Parol 128 ta belgidan oshmasin"
    return True, ""


def sanitize_input(text: str, max_len: int = 10000) -> str:
    """Xavfli belgilarni tozalash."""
    if not text:
        return ""
    text = text[:max_len]
    text = text.replace('\x00', '')
    return text.strip()


def is_valid_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def generate_code(length: int = 6) -> str:
    """Tasdiqlash kodi generatsiya."""
    import random
    import string
    return ''.join(random.choices(string.digits, k=length))


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()