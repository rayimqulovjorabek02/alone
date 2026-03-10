"""
backend/app/models/todo.py — Vazifa modellari
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TodoBase(BaseModel):
    title:    str
    priority: str = "normal"   # low | normal | high
    due_date: Optional[str] = None


class TodoCreate(TodoBase):
    pass


class TodoUpdate(BaseModel):
    title:    Optional[str]  = None
    done:     Optional[bool] = None
    priority: Optional[str]  = None
    due_date: Optional[str]  = None


class TodoResponse(TodoBase):
    id:         int
    user_id:    int
    done:       bool
    created_at: datetime

    class Config:
        from_attributes = True