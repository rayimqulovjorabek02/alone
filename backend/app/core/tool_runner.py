"""
backend/app/core/tool_runner.py — Agent toollarini ishga tushirish
"""
from core.search import web_search


async def run_tool(tool: str, input_data: str) -> str:
    """Tool nomiga qarab tegishli funksiyani chaqirish."""
    runners = {
        "search":    _run_search,
        "calculate": _run_calculate,
        "translate": _run_translate,
    }
    runner = runners.get(tool)
    if runner:
        return await runner(input_data)
    return f"[Noma'lum tool: {tool}]"


async def _run_search(query: str) -> str:
    result = await web_search(query)
    return result or "Qidiruv natijasi topilmadi"


async def _run_calculate(expr: str) -> str:
    try:
        allowed = set('0123456789+-*/.() ')
        if not all(c in allowed for c in expr):
            return "Faqat raqamlar va operatorlar qo'llab-quvvatlanadi"
        result = eval(expr, {"__builtins__": {}})
        return f"Natija: {result}"
    except Exception as e:
        return f"Hisoblash xato: {e}"


async def _run_translate(text: str) -> str:
    return f"[Tarjima: {text[:100]}...]"