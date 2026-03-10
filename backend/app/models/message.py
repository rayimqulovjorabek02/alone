"""
backend/app/models/message.py — Chat xabar modellari
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MessageBase(BaseModel):
    role:    str   # user | assistant | system
    content: str


class MessageCreate(MessageBase):
    session_id: Optional[int] = None


class MessageResponse(MessageBase):
    id:         int
    user_id:    int
    session_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSessionBase(BaseModel):
    title: str = "Yangi suhbat"
    model: str = "llama-3.3-70b-versatile"


class ChatSessionCreate(ChatSessionBase):
    pass


class ChatSessionResponse(ChatSessionBase):
    id:         int
    user_id:    int
    msg_count:  int
    summary:    Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    message:    str
    session_id: int  = 0
    model:      str  = "llama-3.3-70b-versatile"


class ChatResponse(BaseModel):
    response:   str
    session_id: int
    usage:      int
    limit:      int