"""
backend/app/core/admin_guard.py
Admin huquqini tekshirish — barcha admin routerlar uchun
"""
from fastapi import Depends, HTTPException, status
from core.jwt import get_current_user


def require_admin(current: dict = Depends(get_current_user)) -> dict:
    """
    Admin huquqini tekshirish dependency.

    Ishlatish:
        from core.admin_guard import require_admin

        @router.get("/stats")
        async def stats(admin=Depends(require_admin)):
            ...
    """
    if not current.get("is_admin"):
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail      = "Bu sahifaga faqat adminlar kira oladi",
        )
    return current


def require_active(current: dict = Depends(get_current_user)) -> dict:
    """
    Foydalanuvchi aktiv ekanini tekshirish.
    Ban qilingan foydalanuvchilarni bloklash.
    """
    if not current.get("is_active", True):
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail      = "Hisobingiz bloklangan. Qo'llab-quvvatlash bilan bog'laning.",
        )
    return current


def require_plan(plan: str):
    """
    Foydalanuvchi planini tekshirish.

    Ishlatish:
        @router.post("/generate")
        async def gen(user=Depends(require_plan("pro"))):
            ...
    """
    def _check(current: dict = Depends(get_current_user)) -> dict:
        user_plan = current.get("plan", "free")
        plans_order = {"free": 0, "pro": 1, "premium": 2}
        if plans_order.get(user_plan, 0) < plans_order.get(plan, 0):
            raise HTTPException(
                status_code = status.HTTP_403_FORBIDDEN,
                detail      = f"Bu funksiya {plan.capitalize()} plan talab qiladi",
            )
        return current
    return _check