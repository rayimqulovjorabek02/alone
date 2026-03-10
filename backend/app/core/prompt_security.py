"""
backend/app/core/prompt_security.py — Prompt injection himoyasi
"""

# Xavfli so'zlar va iboralar
INJECTION_PATTERNS = [
    "ignore previous instructions",
    "ignore all previous",
    "forget everything",
    "system prompt",
    "you are now",
    "pretend you are",
    "act as",
    "jailbreak",
    "dan mode",
    "developer mode",
    "sudo",
    "admin mode",
]

HARMFUL_PATTERNS = [
    "how to make bomb",
    "how to hack",
    "illegal weapon",
    "drug synthesis",
]


def is_prompt_injection(text: str) -> bool:
    """Prompt injection hujumini aniqlash."""
    text_lower = text.lower()
    return any(pattern in text_lower for pattern in INJECTION_PATTERNS)


def contains_harmful_content(text: str) -> bool:
    """Zararli kontent aniqlash."""
    text_lower = text.lower()
    return any(pattern in text_lower for pattern in HARMFUL_PATTERNS)


def sanitize_prompt(text: str) -> str:
    """Xavfli qismlarni olib tashlash."""
    if not text:
        return ""
    text = text.strip()
    text = text[:8000]
    return text


def check_message(text: str) -> tuple[bool, str]:
    """
    Xabarni tekshirish.
    Returns: (is_safe, reason)
    """
    if is_prompt_injection(text):
        return False, "Prompt injection aniqlandi"
    if contains_harmful_content(text):
        return False, "Zararli kontent aniqlandi"
    return True, ""