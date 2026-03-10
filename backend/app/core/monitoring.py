"""
backend/app/core/monitoring.py — Monitoring va logging
"""
import time
import logging
from functools import wraps
from typing import Callable

# Logger sozlash
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)

logger = logging.getLogger('alone-ai')


def log_request(endpoint: str, user_id: int, duration_ms: float, status: str = 'ok'):
    logger.info(f"[{status.upper()}] {endpoint} | user={user_id} | {duration_ms:.1f}ms")


def timed(func: Callable):
    """Funksiya bajarilish vaqtini o'lchash decorator."""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.time()
        try:
            result = await func(*args, **kwargs)
            duration = (time.time() - start) * 1000
            logger.debug(f"{func.__name__} completed in {duration:.1f}ms")
            return result
        except Exception as e:
            duration = (time.time() - start) * 1000
            logger.error(f"{func.__name__} failed in {duration:.1f}ms: {e}")
            raise
    return wrapper


class APIStats:
    """Sodda in-memory statistika."""
    _requests:  dict = {}
    _errors:    dict = {}

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