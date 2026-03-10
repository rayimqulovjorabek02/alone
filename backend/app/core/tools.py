"""
backend/app/core/tools.py — Tool definitsiyalari
"""

AVAILABLE_TOOLS = {
    "search": {
        "name":        "search",
        "label":       "Veb Qidiruv",
        "description": "Internetdan haqiqiy vaqt ma'lumotlarini topish",
        "icon":        "🔍",
        "plans":       ["free", "pro", "premium"],
    },
    "calculate": {
        "name":        "calculate",
        "label":       "Hisoblash",
        "description": "Matematik hisob-kitoblarni bajarish",
        "icon":        "🧮",
        "plans":       ["free", "pro", "premium"],
    },
    "translate": {
        "name":        "translate",
        "label":       "Tarjima",
        "description": "Matnni boshqa tillarga tarjima qilish",
        "icon":        "🌍",
        "plans":       ["free", "pro", "premium"],
    },
    "weather": {
        "name":        "weather",
        "label":       "Ob-havo",
        "description": "Ob-havo ma'lumotlarini olish",
        "icon":        "🌤️",
        "plans":       ["pro", "premium"],
    },
    "wiki": {
        "name":        "wiki",
        "label":       "Wikipedia",
        "description": "Wikipedia dan ma'lumot olish",
        "icon":        "📚",
        "plans":       ["pro", "premium"],
    },
}


def get_tools_for_plan(plan: str) -> list[dict]:
    return [
        tool for tool in AVAILABLE_TOOLS.values()
        if plan in tool["plans"]
    ]