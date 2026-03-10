"""
backend/app/models/reminder.py — Eslatma modellari
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReminderBase(BaseModel):
    title:     str
    message:   Optional[str] = None
    remind_at: str  # ISO datetime string


class ReminderCreate(ReminderBase):
    pass


class ReminderUpdate(BaseModel):
    title:     Optional[str] = None
    message:   Optional[str] = None
    remind_at: Optional[str] = None
    is_sent:   Optional[bool] = None


class ReminderResponse(ReminderBase):
    id:         int
    user_id:    int
    is_sent:    bool
    created_at: datetime

    class Config:
        from_attributes = True