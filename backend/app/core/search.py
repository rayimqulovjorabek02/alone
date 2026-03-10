"""
backend/app/core/search.py — Veb qidiruv
"""
import os
import httpx

TAVILY_KEY = os.getenv("TAVILY_API_KEY", "")


async def web_search(query: str) -> str:
    # Tavily (to'liq)
    if TAVILY_KEY:
        try:
            async with httpx.AsyncClient(timeout=12) as c:
                r = await c.post(
                    "https://api.tavily.com/search",
                    json={
                        "api_key":        TAVILY_KEY,
                        "query":          query,
                        "max_results":    5,
                        "search_depth":   "basic",
                        "include_answer": True,
                    }
                )
                data = r.json()
                parts = []
                if data.get("answer"):
                    parts.append(f"📌 {data['answer']}")
                for res in data.get("results", [])[:4]:
                    title   = res.get("title", "")
                    content = (res.get("content") or "")[:200]
                    if title:
                        parts.append(f"• {title}: {content}")
                if parts:
                    return "\n".join(parts)
        except Exception as e:
            print(f"Tavily xato: {e}")

    # DuckDuckGo (bepul fallback)
    try:
        async with httpx.AsyncClient(timeout=8) as c:
            r = await c.get(
                "https://api.duckduckgo.com/",
                params={"q": query, "format": "json", "no_html": 1}
            )
            data = r.json()
            abstract = data.get("AbstractText", "")
            if abstract:
                return f"• {abstract}"
    except Exception as e:
        print(f"DuckDuckGo xato: {e}")

    return ""