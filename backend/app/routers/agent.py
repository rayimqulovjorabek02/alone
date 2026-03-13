"""
backend/app/routers/agent.py — AI Agent
"""
import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from core.jwt import get_current_user
from core.search import web_search

router   = APIRouter(prefix="/api/agent", tags=["agent"])
GROQ_KEY = os.getenv("GROQ_API_KEY", "")


class AgentRequest(BaseModel):
    query: str
    tools: list[str] = ["search", "calculate"]


@router.post("/run")
async def run_agent(body: AgentRequest, current: dict = Depends(get_current_user)):
    if not body.query.strip():
        raise HTTPException(400, "Savol kerak")

    results = {}

    if "search" in body.tools:
        try:
            search_result = await web_search(body.query)
            if search_result:
                results["search"] = search_result
        except Exception:
            pass

    from groq import AsyncGroq
    client = AsyncGroq(api_key=GROQ_KEY)

    context = ""
    if results.get("search"):
        context = f"\n\nVeb qidiruv natijasi:\n{results['search']}"

    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": f"Sen aqlli agent. O'zbek tilida javob ber.{context}"},
            {"role": "user",   "content": body.query}
        ],
        max_tokens=2048,
    )
    return {
        "answer":        response.choices[0].message.content,
        "tools_used":    list(results.keys()),
        "search_result": results.get("search", ""),
    }