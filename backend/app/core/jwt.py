"""
backend/app/core/jwt.py — JWT token yaratish va tekshirish
"""
import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET     = os.getenv("JWT_SECRET", "alone-ai-secret-2024")
ALGORITHM  = "HS256"
ACCESS_EXP  = 60 * 24        # 1 kun
REFRESH_EXP = 60 * 24 * 30  # 30 kun

bearer = HTTPBearer(auto_error=False)


def create_access_token(user_id: int, username: str, is_admin: bool = False) -> str:
    exp = datetime.utcnow() + timedelta(minutes=ACCESS_EXP)
    return jwt.encode(
        {"user_id": user_id, "username": username, "is_admin": is_admin, "exp": exp, "type": "access"},
        SECRET, algorithm=ALGORITHM
    )


def create_refresh_token(user_id: int) -> str:
    exp = datetime.utcnow() + timedelta(minutes=REFRESH_EXP)
    return jwt.encode(
        {"user_id": user_id, "exp": exp, "type": "refresh"},
        SECRET, algorithm=ALGORITHM
    )


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGORITHM])
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Token noto'g'ri: {e}")


def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    if not creds:
        raise HTTPException(status_code=401, detail="Token kerak")
    payload = decode_token(creds.credentials)
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Access token kerak")
    return {
        "user_id":  payload["user_id"],
        "username": payload["username"],
        "is_admin": payload.get("is_admin", False),
    }