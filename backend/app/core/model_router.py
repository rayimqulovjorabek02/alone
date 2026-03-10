"""
backend/app/core/model_router.py — AI model tanlash
"""
from config import GROQ_MODELS, PLANS


def get_allowed_models(plan: str) -> list[dict]:
    """Foydalanuvchi planiga mos modellar ro'yxati."""
    allowed_plans = {
        "free":    ["free"],
        "pro":     ["free", "pro"],
        "premium": ["free", "pro", "premium"],
    }
    allowed = allowed_plans.get(plan, ["free"])
    return [
        {"id": model_id, **info}
        for model_id, info in GROQ_MODELS.items()
        if info["plan"] in allowed
    ]


def validate_model(model_id: str, plan: str) -> str:
    """Model ID ni tekshirish, noto'g'ri bo'lsa default qaytarish."""
    from config import DEFAULT_MODEL
    allowed = [m["id"] for m in get_allowed_models(plan)]
    if model_id in allowed:
        return model_id
    return DEFAULT_MODEL


def get_model_info(model_id: str) -> dict:
    return GROQ_MODELS.get(model_id, {})