"""
backend/app/models/user.py — Foydalanuvchi Pydantic modellari
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    username: str
    email:    EmailStr
    avatar:   str = "bot"


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    avatar:   Optional[str] = None


class UserResponse(UserBase):
    id:         int
    plan:       str
    is_admin:   bool
    is_active:  bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserInDB(UserResponse):
    password: str


class TokenResponse(BaseModel):
    access_token:  str
    refresh_token: str
    token_type:    str = "bearer"
    user:          UserResponse


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class RegisterRequest(BaseModel):
    username: str
    email:    EmailStr
    password: str
    avatar:   str = "bot"


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class PlanInfo(BaseModel):
    name:      str
    price_uzs: int
    limits:    dict
    features:  list[str]