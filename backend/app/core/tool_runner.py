"""
backend/app/core/tool_runner.py
Tool larni ishga tushirish — to'liq error handling
"""
import asyncio
from core.search import web_search


async def run_tool(tool: str, input_data: str) -> str:
    """Tool nomiga qarab tegishli funksiyani chaqirish."""
    if not tool or tool == "none":
        return ""
    try:
        runners = {
            "search":    _run_search,
            "calculate": _run_calculate,
            "translate": _run_translate,
            "weather":   _run_weather,
            "wiki":      _run_wiki,
        }
        runner = runners.get(tool)
        if not runner:
            return ""
        result = await asyncio.wait_for(runner(input_data), timeout=10.0)
        return result or ""
    except asyncio.TimeoutError:
        print(f"[Tool] {tool} timeout")
        return ""
    except Exception as e:
        print(f"[Tool] {tool} xato: {e}")
        return ""


async def _run_search(query: str) -> str:
    try:
        result = await web_search(query)
        return result or ""
    except Exception:
        return ""


async def _run_calculate(expr: str) -> str:
    try:
        # Faqat raqamlar va oddiy operatorlar
        import re
        clean = re.sub(r"[^0-9+\-*/().\s]", "", expr).strip()
        if not clean:
            return ""
        result = eval(clean, {"__builtins__": {}})
        return f"Natija: {result}"
    except ZeroDivisionError:
        return "Xato: nolga bo'lish"
    except Exception:
        return ""


async def _run_translate(text: str) -> str:
    # Keyinroq DeepL yoki LibreTranslate qo'shish mumkin
    return ""


async def _run_weather(query: str) -> str:
    # Keyinroq OpenWeatherMap qo'shish mumkin
    return ""


async def _run_wiki(query: str) -> str:
    try:
        import httpx
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.get(
                "https://en.wikipedia.org/api/rest_v1/page/summary/" + query.replace(" ", "_")
            )
            if r.status_code == 200:
                data = r.json()
                extract = data.get("extract", "")
                return extract[:300] if extract else ""
    except Exception:
        return ""
    return ""