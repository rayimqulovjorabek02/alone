"""
backend/app/core/security_utils.py
Xavfsizlik — birlashtirilgan modul

monitoring.py + security_log.py + security.py → shu fayl
"""
import re
import time
import random
import string
import hashlib
import logging
from datetime import datetime
from functools import wraps
from passlib.context import CryptContext

# ── Logging ───────────────────────────────────────────────────
try:
    from core.logger import logger, sec_logger
except Exception:
    logger     = logging.getLogger("alone-ai")
    sec_logger = logging.getLogger("alone-ai.security")


# ── Password ──────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(plain, hashed)
    except Exception:
        return False

def is_strong_password(password: str) -> tuple:
    if len(password) < 6:
        return False, "Parol kamida 6 ta belgi bo'lishi kerak"
    if len(password) > 128:
        return False, "Parol 128 ta belgidan oshmasin"
    return True, ""


# ── Validatsiya ───────────────────────────────────────────────
def is_valid_email(email: str) -> bool:
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))

def sanitize_input(text: str, max_len: int = 10000) -> str:
    if not text:
        return ""
    text = text[:max_len]
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    return text.strip()

def check_sql_injection(text: str) -> bool:
    patterns = [r"(--|#|/\*|union\s|select\s|insert\s|update\s|delete\s|drop\s|exec\s)"]
    t = text.lower()
    return any(re.search(p, t) for p in patterns)

def check_xss(text: str) -> bool:
    patterns = [r"<script", r"javascript:", r"on\w+\s*=", r"<iframe", r"<object"]
    t = text.lower()
    return any(re.search(p, t) for p in patterns)


# ── Token / Code ──────────────────────────────────────────────
import secrets

def generate_token(length: int = 32) -> str:
    return secrets.token_urlsafe(length)

def generate_code(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


# ── API Monitoring ────────────────────────────────────────────
class APIStats:
    _requests: dict = {}
    _errors:   dict = {}

    @classmethod
    def track(cls, endpoint: str, success: bool = True):
        cls._requests[endpoint] = cls._requests.get(endpoint, 0) + 1
        if not success:
            cls._errors[endpoint] = cls._errors.get(endpoint, 0) + 1

    @classmethod
    def get_stats(cls) -> dict:
        return {
            "requests": cls._requests,
            "errors":   cls._errors,
            "total":    sum(cls._requests.values()),
        }

    @classmethod
    def reset(cls):
        cls._requests.clear()
        cls._errors.clear()


# ── Timer decorator ───────────────────────────────────────────
def timed(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.time()
        try:
            result  = await func(*args, **kwargs)
            elapsed = (time.time() - start) * 1000
            if elapsed > 1000:
                logger.warning(f"SEKIN: {func.__name__} — {elapsed:.1f}ms")
            return result
        except Exception as e:
            elapsed = (time.time() - start) * 1000
            logger.error(f"{func.__name__} xato {elapsed:.1f}ms: {e}")
            raise
    return wrapper

def log_request(endpoint: str, user_id: int, duration_ms: float, status: str = "ok"):
    logger.info(f"[{status.upper()}] {endpoint} | user={user_id} | {duration_ms:.1f}ms")


# ── Security logging ──────────────────────────────────────────
def log_failed_login(email: str, ip: str = "unknown"):
    sec_logger.warning(f"FAILED_LOGIN | email={email} | ip={ip} | time={datetime.utcnow()}")

def log_injection_attempt(user_id: int, message: str):
    sec_logger.warning(f"INJECTION_ATTEMPT | user={user_id} | msg={message[:100]}")

def log_blocked_ip(ip: str, reason: str = ""):
    sec_logger.warning(f"BLOCKED_IP | ip={ip} | reason={reason}")

def log_limit_exceeded(user_id: int, resource: str):
    sec_logger.info(f"LIMIT_EXCEEDED | user={user_id} | resource={resource}")

def log_admin_action(admin_id: int, action: str, target_id: int = 0):
    sec_logger.info(f"ADMIN_ACTION | admin={admin_id} | action={action} | target={target_id}")

def log_payment(user_id: int, plan: str, status: str):
    sec_logger.info(f"PAYMENT | user={user_id} | plan={plan} | status={status}")