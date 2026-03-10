"""
modules/i18n.py — Ko'p til qo'llab-quvvatlash (i18n)
O'zbek / Rus / Ingliz UI tarjimalari
"""

TRANSLATIONS: dict = {
    # ── UMUMIY ──────────────────────────────────
    "app_name":        {"uz": "Alone AI",        "ru": "Alone AI",       "en": "Alone AI"},
    "app_subtitle":    {"uz": "O'zbekistonning eng aqlli AI assistanti",
                        "ru": "Самый умный ИИ-ассистент Узбекистана",
                        "en": "Uzbekistan's smartest AI assistant"},

    # ── NAVIGATSIYA ──────────────────────────────
    "nav_chat":        {"uz": "💬 Chat",          "ru": "💬 Чат",         "en": "💬 Chat"},
    "nav_agent":       {"uz": "🤖 Agent",         "ru": "🤖 Агент",       "en": "🤖 Agent"},
    "nav_todo":        {"uz": "📝 Vazifalar",     "ru": "📝 Задачи",      "en": "📝 Tasks"},
    "nav_image":       {"uz": "🖼️ Rasm",          "ru": "🖼️ Изображение", "en": "🖼️ Image"},
    "nav_dashboard":   {"uz": "📊 Dashboard",     "ru": "📊 Панель",      "en": "📊 Dashboard"},
    "nav_premium":     {"uz": "💎 Premium",       "ru": "💎 Премиум",     "en": "💎 Premium"},
    "nav_notifs":      {"uz": "🔔 Bildirishnomalar", "ru": "🔔 Уведомления", "en": "🔔 Notifications"},
    "nav_settings":    {"uz": "⚙️ Sozlamalar",   "ru": "⚙️ Настройки",  "en": "⚙️ Settings"},
    "nav_admin":       {"uz": "👑 Admin",         "ru": "👑 Админ",       "en": "👑 Admin"},

    # ── CHAT ─────────────────────────────────────
    "chat_title":      {"uz": "💬 Suhbat",        "ru": "💬 Чат",         "en": "💬 Chat"},
    "chat_placeholder":{"uz": "Xabar yozing...",  "ru": "Введите сообщение...", "en": "Type a message..."},
    "chat_welcome":    {"uz": "Salom! Men Alone AI, sizning aqlli assistantingizman 🚀",
                        "ru": "Привет! Я Alone AI, ваш умный ассистент 🚀",
                        "en": "Hello! I'm Alone AI, your smart assistant 🚀"},
    "chat_thinking":   {"uz": "Alone o'ylayapti...", "ru": "Alone думает...", "en": "Alone is thinking..."},
    "chat_clear":      {"uz": "🗑️ Tozalash",     "ru": "🗑️ Очистить",   "en": "🗑️ Clear"},
    "chat_logout":     {"uz": "🚪 Chiqish",       "ru": "🚪 Выйти",       "en": "🚪 Logout"},
    "new_chat":        {"uz": "➕ Yangi suhbat",   "ru": "➕ Новый чат",   "en": "➕ New Chat"},

    # ── SESSIYALAR ───────────────────────────────
    "sessions_title":  {"uz": "Suhbatlar",        "ru": "Разговоры",      "en": "Conversations"},
    "session_rename":  {"uz": "✏️ Nomlash",       "ru": "✏️ Переименовать","en": "✏️ Rename"},
    "session_delete":  {"uz": "🗑️ O'chirish",    "ru": "🗑️ Удалить",    "en": "🗑️ Delete"},
    "session_msgs":    {"uz": "xabar",             "ru": "сообщ.",         "en": "msg"},

    # ── SOZLAMALAR ───────────────────────────────
    "settings_title":  {"uz": "⚙️ Sozlamalar",   "ru": "⚙️ Настройки",  "en": "⚙️ Settings"},
    "settings_profile":{"uz": "👤 Profil",        "ru": "👤 Профиль",     "en": "👤 Profile"},
    "settings_theme":  {"uz": "🎨 Tema",          "ru": "🎨 Тема",        "en": "🎨 Theme"},
    "settings_lang":   {"uz": "🌐 Til",           "ru": "🌐 Язык",        "en": "🌐 Language"},
    "settings_ai":     {"uz": "🤖 AI uslubi",     "ru": "🤖 Стиль ИИ",   "en": "🤖 AI Style"},
    "settings_save":   {"uz": "💾 Saqlash",       "ru": "💾 Сохранить",   "en": "💾 Save"},
    "settings_saved":  {"uz": "✅ Saqlandi!",     "ru": "✅ Сохранено!",  "en": "✅ Saved!"},

    # ── TEMA ─────────────────────────────────────
    "theme_dark":      {"uz": "🌙 Qorong'i",      "ru": "🌙 Тёмная",      "en": "🌙 Dark"},
    "theme_light":     {"uz": "☀️ Yorug'",        "ru": "☀️ Светлая",     "en": "☀️ Light"},
    "theme_purple":    {"uz": "💜 Binafsha",       "ru": "💜 Фиолетовая",  "en": "💜 Purple"},
    "theme_ocean":     {"uz": "🌊 Okean",          "ru": "🌊 Океан",       "en": "🌊 Ocean"},

    # ── PREMIUM ──────────────────────────────────
    "premium_title":   {"uz": "💎 Premium",       "ru": "💎 Премиум",     "en": "💎 Premium"},
    "plan_free":       {"uz": "Bepul",             "ru": "Бесплатно",      "en": "Free"},
    "plan_pro":        {"uz": "Pro",               "ru": "Про",            "en": "Pro"},
    "plan_premium":    {"uz": "Premium",           "ru": "Премиум",        "en": "Premium"},
    "upgrade":         {"uz": "⬆️ O'tish",        "ru": "⬆️ Перейти",    "en": "⬆️ Upgrade"},
    "current_plan":    {"uz": "✅ Joriy reja",     "ru": "✅ Текущий",     "en": "✅ Current"},

    # ── TODO ─────────────────────────────────────
    "todo_title":      {"uz": "📝 Vazifalar",     "ru": "📝 Задачи",      "en": "📝 Tasks"},
    "todo_add":        {"uz": "➕ Qo'shish",      "ru": "➕ Добавить",    "en": "➕ Add"},
    "todo_empty":      {"uz": "Hali vazifa yo'q. Birinchisini qo'shing!",
                        "ru": "Задач нет. Добавьте первую!",
                        "en": "No tasks yet. Add your first!"},
    "todo_high":       {"uz": "🔴 Yuqori",        "ru": "🔴 Высокий",     "en": "🔴 High"},
    "todo_normal":     {"uz": "🟡 O'rta",         "ru": "🟡 Средний",     "en": "🟡 Normal"},
    "todo_low":        {"uz": "🟢 Past",           "ru": "🟢 Низкий",      "en": "🟢 Low"},

    # ── XATOLAR ──────────────────────────────────
    "err_fill_all":    {"uz": "❌ Barcha maydonlarni to'ldiring!",
                        "ru": "❌ Заполните все поля!",
                        "en": "❌ Fill in all fields!"},
    "err_limit":       {"uz": "⚠️ Kunlik limit tugadi! Premium ga o'ting.",
                        "ru": "⚠️ Дневной лимит исчерпан! Перейдите на Premium.",
                        "en": "⚠️ Daily limit reached! Upgrade to Premium."},
    "err_session":     {"uz": "⚠️ Sessiya muddati tugadi. Qayta kiring.",
                        "ru": "⚠️ Сессия истекла. Войдите снова.",
                        "en": "⚠️ Session expired. Please log in again."},

    # ── RASM ─────────────────────────────────────
    "image_title":     {"uz": "🖼️ Rasm Generatsiya", "ru": "🖼️ Генерация изображений", "en": "🖼️ Image Generation"},
    "image_generate":  {"uz": "🎨 Rasm yaratish",  "ru": "🎨 Создать изображение", "en": "🎨 Generate Image"},
    "image_download":  {"uz": "⬇️ Yuklab olish",   "ru": "⬇️ Скачать",    "en": "⬇️ Download"},

    # ── AGENT ────────────────────────────────────
    "agent_title":     {"uz": "🤖 AI Agent",       "ru": "🤖 ИИ-агент",    "en": "🤖 AI Agent"},
    "agent_run":       {"uz": "🚀 Ishga tushirish", "ru": "🚀 Запустить",   "en": "🚀 Run Agent"},
    "agent_task":      {"uz": "🎯 Vazifangizni kiriting", "ru": "🎯 Введите задачу", "en": "🎯 Enter your task"},

    # ── BILDIRISHNOMALAR ─────────────────────────
    "notif_title":     {"uz": "🔔 Bildirishnomalar", "ru": "🔔 Уведомления", "en": "🔔 Notifications"},
    "notif_read_all":  {"uz": "✅ Barchasini o'qildi", "ru": "✅ Отметить все", "en": "✅ Mark all read"},
    "notif_empty":     {"uz": "Hali bildirishnoma yo'q", "ru": "Нет уведомлений", "en": "No notifications yet"},

    # ── DASHBOARD ────────────────────────────────
    "dash_title":      {"uz": "📊 Dashboard",      "ru": "📊 Панель управления", "en": "📊 Dashboard"},
    "dash_total":      {"uz": "💬 Jami xabarlar",  "ru": "💬 Всего сообщений", "en": "💬 Total Messages"},
    "dash_today":      {"uz": "📅 Bugun",           "ru": "📅 Сегодня",      "en": "📅 Today"},
    "dash_tasks":      {"uz": "✅ Faol vazifalar",  "ru": "✅ Активные задачи", "en": "✅ Active Tasks"},
    "dash_plan":       {"uz": "💎 Reja",            "ru": "💎 Тариф",        "en": "💎 Plan"},
    "dash_avg":        {"uz": "📈 O'rtacha/kun",    "ru": "📈 В среднем/день", "en": "📈 Avg/Day"},
    "dash_peak":       {"uz": "⏰ Eng faol soat",   "ru": "⏰ Пиковый час",  "en": "⏰ Peak Hour"},
    "dash_sessions":   {"uz": "💬 Sessiyalar",      "ru": "💬 Сессии",       "en": "💬 Sessions"},
    "dash_memory":     {"uz": "🧠 Xotira",          "ru": "🧠 Память",       "en": "🧠 Memory"},

    # ── ADMIN ────────────────────────────────────
    "admin_title":     {"uz": "👑 Admin Panel",    "ru": "👑 Админ-панель", "en": "👑 Admin Panel"},
    "admin_users":     {"uz": "👤 Foydalanuvchilar", "ru": "👤 Пользователи", "en": "👤 Users"},
    "admin_block":     {"uz": "🚫 Bloklash",       "ru": "🚫 Заблокировать","en": "🚫 Block"},
    "admin_unblock":   {"uz": "✅ Blokdan chiqar", "ru": "✅ Разблокировать","en": "✅ Unblock"},
    "admin_delete":    {"uz": "🗑️ O'chirish",     "ru": "🗑️ Удалить",     "en": "🗑️ Delete"},

    # ── FAYL ─────────────────────────────────────
    "file_upload":     {"uz": "📎 Fayl yuklash",   "ru": "📎 Загрузить файл", "en": "📎 Upload File"},
    "file_read":       {"uz": "✅ O'qildi!",       "ru": "✅ Прочитано!",   "en": "✅ Read!"},

    # ── SEARCH ───────────────────────────────────
    "search_title":    {"uz": "🌐 Web qidiruv",    "ru": "🌐 Веб-поиск",   "en": "🌐 Web Search"},
    "search_btn":      {"uz": "🔍 Qidirish",       "ru": "🔍 Поиск",       "en": "🔍 Search"},

    # ── VOICE ────────────────────────────────────
    "voice_btn":       {"uz": "🎙️ Ovozli buyruq", "ru": "🎙️ Голосовой",  "en": "🎙️ Voice Input"},
    "voice_listening": {"uz": "Tinglayapman...",   "ru": "Слушаю...",      "en": "Listening..."},
    # ── TAHLIL ──────────────────────────────────
    "analysis_title":  {"uz": "🔍 AI Tahlil",     "ru": "🔍 ИИ-анализ",    "en": "🔍 AI Analysis"},
    "analysis_code":   {"uz": "🖥️ Kod tahlili",   "ru": "🖥️ Анализ кода",  "en": "🖥️ Code Analysis"},
    "analysis_text":   {"uz": "📝 Matn tahlili",  "ru": "📝 Анализ текста", "en": "📝 Text Analysis"},
    "analysis_file":   {"uz": "📎 Fayl tahlili",  "ru": "📎 Анализ файла",  "en": "📎 File Analysis"},
    "analysis_run":    {"uz": "🔍 Tahlil qilish", "ru": "🔍 Анализировать", "en": "🔍 Analyze"},
    "analysis_result": {"uz": "📊 Natija",        "ru": "📊 Результат",    "en": "📊 Result"},

    # ── REMINDER ────────────────────────────────
    "reminder_title":  {"uz": "⏰ Eslatmalar",    "ru": "⏰ Напоминания",  "en": "⏰ Reminders"},
    "reminder_add":    {"uz": "➕ Qo'shish",       "ru": "➕ Добавить",     "en": "➕ Add"},
    "reminder_due":    {"uz": "⚠️ Vaqti yetdi",   "ru": "⚠️ Время пришло", "en": "⚠️ Due"},
    "reminder_done":   {"uz": "✅ Bajarildi",      "ru": "✅ Выполнено",    "en": "✅ Done"},
    "reminder_empty":  {"uz": "Hali eslatma yo'q", "ru": "Нет напоминаний", "en": "No reminders"},

    # ── EKSPORT ─────────────────────────────────
    "export_title":    {"uz": "📤 Eksport",         "ru": "📤 Экспорт",      "en": "📤 Export"},
    "export_download": {"uz": "⬇️ Yuklab olish",    "ru": "⬇️ Скачать",      "en": "⬇️ Download"},
    "export_format":   {"uz": "Format",              "ru": "Формат",          "en": "Format"},

    # ── KO'P OYNA ───────────────────────────────
    "multi_window":    {"uz": "⊞ Ko'p oyna",        "ru": "⊞ Мультиокно",   "en": "⊞ Multi-window"},
    "window_1":        {"uz": "💬 Oyna 1",           "ru": "💬 Окно 1",       "en": "💬 Window 1"},
    "window_2":        {"uz": "💬 Oyna 2",           "ru": "💬 Окно 2",       "en": "💬 Window 2"},

    # ── YANGI TEMALAR ────────────────────────────
    "theme_forest":    {"uz": "🌲 O'rmon",           "ru": "🌲 Лес",          "en": "🌲 Forest"},
    "theme_sunset":    {"uz": "🌅 Quyosh botishi",   "ru": "🌅 Закат",        "en": "🌅 Sunset"},
    "theme_nord":      {"uz": "❄️ Nord",             "ru": "❄️ Норд",         "en": "❄️ Nord"},
    "theme_rose":      {"uz": "🌸 Atirgul",          "ru": "🌸 Роза",         "en": "🌸 Rose"},
}


def t(key: str, lang: str = "uz") -> str:
    """
    Tarjima funksiyasi.
    
    Foydalanish:
        from modules.i18n import t
        text = t("chat_title", lang)   # → "💬 Suhbat"
    """
    entry = TRANSLATIONS.get(key)
    if not entry:
        return key  # Kalit topilmasa, kalitning o'zini qaytaradi
    return entry.get(lang) or entry.get("uz") or key


def get_all_keys() -> list:
    """Barcha tarjima kalitlarini qaytaradi."""
    return list(TRANSLATIONS.keys())


# Tez foydalanish uchun
def uz(key: str) -> str: return t(key, "uz")
def ru(key: str) -> str: return t(key, "ru")
def en(key: str) -> str: return t(key, "en")