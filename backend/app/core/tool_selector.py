"""
backend/app/core/tool_selector.py — Savolga mos toollarni tanlash
"""

TOOL_KEYWORDS = {
    "search":    ["qidir", "topib", "hozir", "bugun", "yangilik", "narx", "kim", "qachon", "qayerda", "bozor", "weather", "ob-havo", "yangi"],
    "calculate": ["hisob", "qo'sh", "ayir", "ko'payt", "bo'l", "foiz", "summa", "natija", "nechta", "qancha"],
    "translate": ["tarjima", "o'zbek", "ingliz", "rus", "translate", "inglizcha", "ruscha"],
}


def select_tools(query: str) -> list[str]:
    """Savolga mos toollarni avtomatik tanlash."""
    q       = query.lower()
    tools   = []

    for tool, keywords in TOOL_KEYWORDS.items():
        if any(kw in q for kw in keywords):
            tools.append(tool)

    return tools or []