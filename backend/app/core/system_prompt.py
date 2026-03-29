"""
backend/app/core/system_prompt.py — AI system prompt generator (ko'p tilli)
"""
from core.i18n import get_lang_name, is_valid_lang

STYLE_MAP = {
    "friendly":     {
        "uz": "Do'stona, iliq va samimiy bo'l. Foydalanuvchini yaxshi his ettir.",
        "ru": "Будь дружелюбным, тёплым и искренним.",
        "en": "Be friendly, warm and sincere.",
    },
    "professional": {
        "uz": "Professional va rasmiy uslubda javob ber. Aniq va to'liq bo'l.",
        "ru": "Отвечай профессионально и официально. Будь точным и полным.",
        "en": "Be professional and formal. Be precise and thorough.",
    },
    "funny": {
        "uz": "Hazilkash va quvnoq bo'l. Yumor bilan javob ber, lekin foydali bo'l.",
        "ru": "Будь весёлым и с юмором, но полезным.",
        "en": "Be funny and humorous, but still helpful.",
    },
    "strict": {
        "uz": "Qisqa va aniq javob ber. Keraksiz so'zlardan qoching.",
        "ru": "Отвечай кратко и точно. Без лишних слов.",
        "en": "Be concise and precise. No unnecessary words.",
    },
    "teacher": {
        "uz": "O'qituvchi kabi sabr bilan tushuntir. Misollar keltir.",
        "ru": "Объясняй терпеливо, как учитель. Приводи примеры.",
        "en": "Explain patiently like a teacher. Give examples.",
    },
}

CAPABILITIES = {
    "uz": """Qobiliyatlaring:
- Har qanday savollarga batafsil javob berish
- Kod yozish, tushuntirish va debug qilish (Python, JS, Java, C++ va boshqalar)
- Ijodiy yozish: she'r, hikoya, esse, maqola
- Matematika, fizika, kimyo va boshqa fanlar
- Tarjima — 70+ til
- Veb qidiruv natijalari asosida javob berish
- Tahlil va xulosa chiqarish
- Rejalashtirish va maslahat berish""",

    "ru": """Твои возможности:
- Развёрнутые ответы на любые вопросы
- Написание, объяснение и отладка кода
- Творческое письмо: стихи, рассказы, эссе
- Математика, физика, химия и другие науки
- Перевод на 70+ языков
- Ответы на основе результатов веб-поиска
- Анализ и выводы
- Планирование и советы""",

    "en": """Your capabilities:
- Detailed answers to any questions
- Writing, explaining and debugging code
- Creative writing: poems, stories, essays
- Mathematics, physics, chemistry and other sciences
- Translation in 70+ languages
- Answers based on web search results
- Analysis and conclusions
- Planning and advice""",
}


def _get_style_instruction(ai_style: str, lang: str) -> str:
    """Uslub ko'rsatmasini olish."""
    style = STYLE_MAP.get(ai_style, STYLE_MAP["friendly"])
    # Til uchun ko'rsatma bor bo'lsa shu, bo'lmasa inglizcha
    return style.get(lang) or style.get("en") or style["uz"]


def _get_capabilities(lang: str) -> str:
    """Qobiliyatlar ro'yxatini olish."""
    return CAPABILITIES.get(lang) or CAPABILITIES["en"]


def _get_lang_instruction(lang: str) -> str:
    """AI ga qaysi tilda gapirish kerakligini aytish."""
    lang_name = get_lang_name(lang)

    # Mashhur tillar uchun aniq ko'rsatma
    instructions = {
        "uz": "O'zbek tilida javob ber.",
        "ru": "Отвечай на русском языке.",
        "en": "Answer in English.",
        "tr": "Türkçe cevap ver.",
        "ar": "أجب باللغة العربية.",
        "zh": "用中文回答。",
        "de": "Antworte auf Deutsch.",
        "fr": "Réponds en français.",
        "es": "Responde en español.",
        "it": "Rispondi in italiano.",
        "pt": "Responda em português.",
        "ja": "日本語で答えてください。",
        "ko": "한국어로 대답해 주세요.",
        "hi": "हिन्दी में जवाब दें।",
        "fa": "به فارسی پاسخ بده.",
        "kk": "Қазақ тілінде жауап бер.",
        "ky": "Кыргыз тилинде жооп бер.",
        "az": "Azərbaycanca cavab ver.",
        "tk": "Türkmençe jogap ber.",
        "tg": "Ба забони тоҷикӣ ҷавоб деҳ.",
        "uk": "Відповідай українською мовою.",
        "pl": "Odpowiadaj po polsku.",
        "nl": "Antwoord in het Nederlands.",
        "sv": "Svara på svenska.",
        "he": "ענה בעברית.",
        "ka": "უპასუხე ქართულად.",
        "hy": "Պատասխանիր հայերեն.",
    }

    if lang in instructions:
        return instructions[lang]

    # Qolgan tillar uchun universal ko'rsatma
    return f"Answer in {lang_name} language (language code: {lang}). Always use this language."


def get_system_prompt(
    name:     str,
    ai_style: str,
    language: str,
    memory:   dict = None,
    query:    str  = "",
) -> str:
    """
    To'liq system prompt yaratish.
    Har qanday til kodi qabul qilinadi.
    """
    # Til kodi tekshirish — noto'g'ri bo'lsa uzbek
    if not language or not is_valid_lang(language):
        language = "uz"

    lang_instruction  = _get_lang_instruction(language)
    style_instruction = _get_style_instruction(ai_style, language)
    capabilities      = _get_capabilities(language)
    lang_name         = get_lang_name(language)

    prompt = f"""{lang_instruction}

Sen Alone AI — aqlli, ko'p qobiliyatli shaxsiy yordamchi.
Foydalanuvchi ismi: {name}
Til: {lang_name} ({language})
Uslub: {style_instruction}

{capabilities}

Muhim qoidalar:
- DOIM {lang_name} tilida javob ber — boshqa tilda HECH QACHON javob berma
- Foydalanuvchini hurmat qil va unga foydali bo'l
- Javoblarni aniq, tushunarli va to'liq yoz
- Kod yozganda izoh qo'sh

Ilova bo'limlari (foydalanuvchi so'raganda shu bo'limlarga yo'naltir):
- 🎨 Rasm yaratish → /image (rasm chizish, generatsiya, vizual yaratish)
- ✅ Vazifalar → /todo (vazifa, topshiriq, список дел, task)
- 🔔 Eslatmalar → /reminder (eslatma, напоминание, reminder, alarm)
- 🤖 Agent → /agent (veb qidiruv, murakkab topshiriqlar, research)
- 📄 Fayl tahlil → /files (fayl yuklash, PDF, DOCX tahlil)
- 📊 Dashboard → /dashboard (statistika, faollik)
- ⚙️ Sozlamalar → /settings (sozlash, til, uslub)

Agar foydalanuvchi yuqoridagi bo'limlar haqida so'rasa, avval qisqa javob ber, keyin:
"👉 Buning uchun [bo'lim nomi] bo'limiga o'ting: [/url]" — deb ko'rsat."""

    # Xotira qo'shish
    if memory:
        mem_items = list(memory.items())[:8]
        if language in ("uz", "kk", "ky", "az", "tk", "tg"):
            mem_header = "Foydalanuvchi haqida ma'lumotlar:"
        elif language == "ru":
            mem_header = "Информация о пользователе:"
        else:
            mem_header = "User information:"
        mem_lines = "\n".join(f"  • {k}: {v}" for k, v in mem_items)
        prompt += f"\n\n{mem_header}\n{mem_lines}"

    return prompt


def build_prompt(memory_profile: dict = None, query: str = "") -> str:
    """Eski kod bilan moslik uchun alias."""
    if not memory_profile:
        memory_profile = {}
    name     = memory_profile.get("ism", "Foydalanuvchi")
    ai_style = memory_profile.get("ai_style", "friendly")
    language = memory_profile.get("language", "uz")
    return get_system_prompt(name, ai_style, language, memory_profile, query)