"""
backend/app/core/tool_selector.py
Savolga mos toollarni tanlash
"""

TOOL_KEYWORDS = {
    "search":    ["qidir", "topib", "hozir", "bugun", "yangilik", "narx",
                  "kim", "qachon", "qayerda", "bozor", "weather", "ob-havo"],
    "calculate": ["hisob", "qo'sh", "ayir", "ko'payt", "bo'l", "foiz",
                  "summa", "natija", "nechta", "qancha", "calculate"],
    "translate": ["tarjima", "o'zbek", "ingliz", "rus", "translate"],
    "weather":   ["ob-havo", "havo", "temperature", "weather"],
    "wiki":      ["wikipedia", "wiki", "nima bu", "tarix", "kim bu"],
}


def select_tools(query: str) -> list[str]:
    """Savolga mos toollarni avtomatik tanlash."""
    try:
        q     = query.lower()
        tools = []
        for tool, keywords in TOOL_KEYWORDS.items():
            if any(kw in q for kw in keywords):
                tools.append(tool)
        return tools or []
    except Exception:
        return []


def choose_tool(query: str) -> str:
    """Eng mos bitta tool tanlash (smart_ai uchun)."""
    try:
        tools = select_tools(query)
        return tools[0] if tools else "none"
    except Exception:
        return "none"