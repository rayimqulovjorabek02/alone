"""
backend/app/models/payment.py — To'lov modellari
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CheckoutRequest(BaseModel):
    plan:        str
    success_url: str = "https://aloneai.uz/premium?success=1"
    cancel_url:  str = "https://aloneai.uz/premium?cancel=1"


class CheckoutResponse(BaseModel):
    checkout_url: str


class SubscriptionResponse(BaseModel):
    id:                int
    user_id:           int
    plan:              str
    status:            str
    stripe_sub_id:     Optional[str]
    started_at:        datetime
    expires_at:        Optional[datetime]

    class Config:
        from_attributes = True


class PriceInfo(BaseModel):
    plan:      str
    uzs:       int
    usd:       float
    stripe_id: Optional[str] = None