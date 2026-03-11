"""
core/tool_selector.py
AI agent tool selector
"""

TOOLS = {
    "search": ["search", "news", "yangilik", "kim", "who", "what"],
    "calculator": ["calculate", "hisobla", "math", "+", "-", "*", "/"],
    "code": ["code", "python", "program", "bug"],
}


def choose_tool(message: str) -> str:
    """
    User message asosida tool tanlash
    """

    msg = message.lower()

    for tool, keywords in TOOLS.items():
        for k in keywords:
            if k in msg:
                return tool

    return "none"