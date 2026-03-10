"""
backend/app/core/smart_ai.py — Groq AI pipeline
"""
import os
import re
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))


def run_pipeline(messages: list, model: str, temperature: float = 0.7, stream: bool = False):
    """Groq AI ga so'rov yuborish."""
    return client.chat.completions.create(
        model=model,
        messages=messages,
        max_tokens=4096,
        temperature=temperature,
        stream=stream,
    )


def post_process(text: str) -> str:
    """Javobni tozalash."""
    if not text:
        return ""
    text = text.strip()
    # Ortiqcha bo'sh qatorlarni olib tashlash
    text = re.sub(r'\n{4,}', '\n\n\n', text)
    return text