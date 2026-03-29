"""
backend/app/deps.py — FastAPI dependency injection
"""
from core.jwt import get_current_user
from database import get_db

__all__ = ["get_current_user", "get_db"]