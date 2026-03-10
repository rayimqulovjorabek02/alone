"""
backend/app/core/premium.py — Premium limit tekshiruvi
"""
from database import get_usage, get_plan
from config import PLANS


def check_limit(user_id: int, resource: str) -> tuple[bool, int, int]:
    """
    Limit tekshirish.
    Returns: (can_use, current_usage, limit)
    """
    plan    = get_plan(user_id)
    limit   = PLANS.get(plan, PLANS["free"])["limits"].get(resource, 0)
    current = get_usage(user_id, resource)
    return current < limit, current, limit


def get_plan_features(plan: str) -> list[str]:
    return PLANS.get(plan, PLANS["free"]).get("features", [])


def has_feature(user_id: int, feature: str) -> bool:
    plan     = get_plan(user_id)
    features = get_plan_features(plan)
    return feature in features