"""
backend/app/core/i18n.py — Ko'p til qo'llab-quvvatlash (50+ til)
"""

# ── BARCHA TILLAR RO'YXATI ────────────────────────────────────
LANGUAGES = {
    "uz": "🇺🇿 O'zbek",
    "ru": "🇷🇺 Русский",
    "en": "🇬🇧 English",
    "tr": "🇹🇷 Türkçe",
    "ar": "🇸🇦 العربية",
    "zh": "🇨🇳 中文",
    "de": "🇩🇪 Deutsch",
    "fr": "🇫🇷 Français",
    "es": "🇪🇸 Español",
    "it": "🇮🇹 Italiano",
    "pt": "🇵🇹 Português",
    "ja": "🇯🇵 日本語",
    "ko": "🇰🇷 한국어",
    "hi": "🇮🇳 हिन्दी",
    "fa": "🇮🇷 فارسی",
    "kk": "🇰🇿 Қазақша",
    "ky": "🇰🇬 Кыргызча",
    "tg": "🇹🇯 Тоҷикӣ",
    "az": "🇦🇿 Azərbaycan",
    "tk": "🇹🇲 Türkmençe",
    "uk": "🇺🇦 Українська",
    "pl": "🇵🇱 Polski",
    "nl": "🇳🇱 Nederlands",
    "sv": "🇸🇪 Svenska",
    "no": "🇳🇴 Norsk",
    "da": "🇩🇰 Dansk",
    "fi": "🇫🇮 Suomi",
    "cs": "🇨🇿 Čeština",
    "ro": "🇷🇴 Română",
    "hu": "🇭🇺 Magyar",
    "id": "🇮🇩 Bahasa Indonesia",
    "ms": "🇲🇾 Bahasa Melayu",
    "th": "🇹🇭 ภาษาไทย",
    "vi": "🇻🇳 Tiếng Việt",
    "bn": "🇧🇩 বাংলা",
    "ur": "🇵🇰 اردو",
    "he": "🇮🇱 עברית",
    "el": "🇬🇷 Ελληνικά",
    "bg": "🇧🇬 Български",
    "sr": "🇷🇸 Српски",
    "hr": "🇭🇷 Hrvatski",
    "sk": "🇸🇰 Slovenčina",
    "lt": "🇱🇹 Lietuvių",
    "lv": "🇱🇻 Latviešu",
    "et": "🇪🇪 Eesti",
    "ka": "🇬🇪 ქართული",
    "hy": "🇦🇲 Հայերեն",
    "sw": "🇰🇪 Kiswahili",
    "af": "🇿🇦 Afrikaans",
    "sq": "🇦🇱 Shqip",
    "be": "🇧🇾 Беларуская",
    "mk": "🇲🇰 Македонски",
    "sl": "🇸🇮 Slovenščina",
    "mn": "🇲🇳 Монгол",
    "ne": "🇳🇵 नेपाली",
    "si": "🇱🇰 සිංහල",
    "km": "🇰🇭 ភាសាខ្មែរ",
    "lo": "🇱🇦 ລາວ",
    "my": "🇲🇲 မြန်မာ",
    "am": "🇪🇹 አማርኛ",
    "so": "🇸🇴 Soomaali",
    "ha": "🇳🇬 Hausa",
    "yo": "🇳🇬 Yorùbá",
    "ig": "🇳🇬 Igbo",
    "zu": "🇿🇦 isiZulu",
    "cy": "🏴󠁧󠁢󠁷󠁬󠁳󠁿 Cymraeg",
    "eu": "🇪🇸 Euskara",
    "ca": "🇪🇸 Català",
    "gl": "🇪🇸 Galego",
    "is": "🇮🇸 Íslenska",
    "mt": "🇲🇹 Malti",
}

# ── UI TARJIMALARI (asosiy 3 til + fallback) ──────────────────
TRANSLATIONS: dict = {
    "app_name":         {"uz": "Alone AI",          "ru": "Alone AI",           "en": "Alone AI"},
    "app_subtitle":     {"uz": "O'zbekistonning eng aqlli AI assistanti",
                         "ru": "Самый умный ИИ-ассистент Узбекистана",
                         "en": "Uzbekistan's smartest AI assistant"},
    "nav_chat":         {"uz": "💬 Chat",            "ru": "💬 Чат",             "en": "💬 Chat"},
    "nav_agent":        {"uz": "🤖 Agent",           "ru": "🤖 Агент",           "en": "🤖 Agent"},
    "nav_todo":         {"uz": "📝 Vazifalar",       "ru": "📝 Задачи",          "en": "📝 Tasks"},
    "nav_image":        {"uz": "🖼️ Rasm",            "ru": "🖼️ Изображение",     "en": "🖼️ Image"},
    "nav_dashboard":    {"uz": "📊 Dashboard",       "ru": "📊 Панель",          "en": "📊 Dashboard"},
    "nav_premium":      {"uz": "💎 Premium",         "ru": "💎 Премиум",         "en": "💎 Premium"},
    "nav_notifs":       {"uz": "🔔 Bildirishnomalar","ru": "🔔 Уведомления",     "en": "🔔 Notifications"},
    "nav_settings":     {"uz": "⚙️ Sozlamalar",     "ru": "⚙️ Настройки",      "en": "⚙️ Settings"},
    "nav_admin":        {"uz": "👑 Admin",           "ru": "👑 Админ",           "en": "👑 Admin"},
    "chat_placeholder": {"uz": "Xabar yozing...",    "ru": "Введите сообщение...","en": "Type a message..."},
    "chat_welcome":     {"uz": "Salom! Men Alone AI 🚀",
                         "ru": "Привет! Я Alone AI 🚀",
                         "en": "Hello! I'm Alone AI 🚀"},
    "chat_thinking":    {"uz": "Alone o'ylayapti...", "ru": "Alone думает...",    "en": "Alone is thinking..."},
    "new_chat":         {"uz": "➕ Yangi suhbat",    "ru": "➕ Новый чат",       "en": "➕ New Chat"},
    "settings_save":    {"uz": "💾 Saqlash",         "ru": "💾 Сохранить",       "en": "💾 Save"},
    "settings_saved":   {"uz": "✅ Saqlandi!",       "ru": "✅ Сохранено!",      "en": "✅ Saved!"},
    "todo_empty":       {"uz": "Hali vazifa yo'q",   "ru": "Задач нет",          "en": "No tasks yet"},
    "err_limit":        {"uz": "⚠️ Kunlik limit tugadi! Premium ga o'ting.",
                         "ru": "⚠️ Дневной лимит исчерпан!",
                         "en": "⚠️ Daily limit reached!"},
    "err_session":      {"uz": "⚠️ Sessiya tugadi. Qayta kiring.",
                         "ru": "⚠️ Сессия истекла.",
                         "en": "⚠️ Session expired."},
    "image_generate":   {"uz": "🎨 Rasm yaratish",  "ru": "🎨 Создать",         "en": "🎨 Generate"},
    "image_download":   {"uz": "⬇️ Yuklab olish",   "ru": "⬇️ Скачать",         "en": "⬇️ Download"},
    "notif_empty":      {"uz": "Bildirishnoma yo'q", "ru": "Нет уведомлений",    "en": "No notifications"},
    "reminder_empty":   {"uz": "Hali eslatma yo'q",  "ru": "Нет напоминаний",    "en": "No reminders"},
    "export_download":  {"uz": "⬇️ Yuklab olish",   "ru": "⬇️ Скачать",         "en": "⬇️ Download"},
    "file_upload":      {"uz": "📎 Fayl yuklash",    "ru": "📎 Загрузить файл",  "en": "📎 Upload File"},
    "admin_block":      {"uz": "🚫 Bloklash",        "ru": "🚫 Заблокировать",   "en": "🚫 Block"},
    "admin_delete":     {"uz": "🗑️ O'chirish",      "ru": "🗑️ Удалить",         "en": "🗑️ Delete"},
}


def t(key: str, lang: str = "uz") -> str:
    """
    Tarjima funksiyasi — har qanday til uchun.
    Agar til topilmasa, ingliz tiliga, u ham bo'lmasa o'zbek tiliga qaytadi.
    """
    entry = TRANSLATIONS.get(key)
    if not entry:
        return key
    return entry.get(lang) or entry.get("en") or entry.get("uz") or key


def get_lang_name(code: str) -> str:
    """Til kodidan til nomini olish."""
    return LANGUAGES.get(code, code)


def is_valid_lang(code: str) -> bool:
    """Til kodi to'g'rimi tekshirish."""
    return code in LANGUAGES


def get_all_languages() -> dict:
    """Barcha tillar ro'yxatini qaytaradi."""
    return LANGUAGES


# Tez foydalanish uchun aliaslar
def uz(key: str) -> str: return t(key, "uz")
def ru(key: str) -> str: return t(key, "ru")
def en(key: str) -> str: return t(key, "en")