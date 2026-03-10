"""
backend/app/core/system_prompt.py — AI system prompt generator
"""

LANG_MAP = {
    "uz": "O'zbek tilida javob ber",
    "ru": "Отвечай на русском языке",
    "en": "Answer in English",
}

STYLE_MAP = {
    "friendly":    "Do'stona, iliq va samimiy bo'l",
    "professional":"Professional va rasmiy uslubda javob ber",
    "funny":       "Hazilkash va quvnoq bo'l",
    "strict":      "Qisqa, aniq va to'g'ridan-to'g'ri javob ber",
    "teacher":     "Sabr bilan tushuntir, o'qituvchi kabi yondashuv",
}


def get_system_prompt(name: str, ai_style: str, language: str, memory: dict = None, query: str = "") -> str:
    lang_str  = LANG_MAP.get(language, LANG_MAP["uz"])
    style_str = STYLE_MAP.get(ai_style, STYLE_MAP["friendly"])

    prompt = f"""{lang_str}.
Sen Alone AI — aqlli, ko'p qobiliyatli shaxsiy yordamchi.
Foydalanuvchi: {name}
Uslub: {style_str}

Qobiliyatlaring:
- Savollarga batafsil javob berish
- Kod yozish va tushuntirish
- Ijodiy yozish (she'r, hikoya, esse)
- Matematika va mantiq masalalarini yechish
- Tarjima qilish
- Veb qidiruv natijalari asosida javob berish"""

    if memory:
        mem_lines = [f"  • {k}: {v}" for k, v in list(memory.items())[:8]]
        prompt += "\n\nFoydalanuvchi haqida ma'lumotlar:\n" + "\n".join(mem_lines)

    return prompt