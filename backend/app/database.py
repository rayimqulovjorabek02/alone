"""
backend/app/database.py — SQLite database va barcha DB funksiyalar
"""
import os
import sqlite3
from contextlib import contextmanager

# DB yo'li — backend/data/ papkasida
_BASE = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.path.join(_BASE, "..", "data", "alone.db")

# Eski yo'l bilan ham ishlashi uchun
if not os.path.exists(os.path.dirname(DB_NAME)):
    DB_NAME = os.path.join(_BASE, "alone.db")


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# ══════════════════════════════════════════════
# DATABASE INIT
# ══════════════════════════════════════════════
def init_db():
    with get_db() as conn:
        # Users
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                username   TEXT    NOT NULL,
                email      TEXT    UNIQUE NOT NULL,
                password   TEXT    NOT NULL,
                avatar     TEXT    DEFAULT 'bot',
                plan       TEXT    DEFAULT 'free',
                is_admin   INTEGER DEFAULT 0,
                is_active  INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT (datetime('now'))
            )
        """)

        # Chat sessiyalar
        conn.execute("""
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    INTEGER NOT NULL,
                title      TEXT    DEFAULT 'Yangi suhbat',
                model      TEXT    DEFAULT 'llama-3.3-70b-versatile',
                summary    TEXT,
                msg_count  INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT (datetime('now')),
                updated_at TIMESTAMP DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Chat tarixi
        conn.execute("""
            CREATE TABLE IF NOT EXISTS chat_history (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    INTEGER NOT NULL,
                session_id INTEGER,
                role       TEXT    NOT NULL,
                content    TEXT    NOT NULL,
                created_at TIMESTAMP DEFAULT (datetime('now')),
                FOREIGN KEY (user_id)    REFERENCES users(id)         ON DELETE CASCADE,
                FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE SET NULL
            )
        """)

        # User xotirasi
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user_memory (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    INTEGER NOT NULL,
                key        TEXT    NOT NULL,
                value      TEXT    NOT NULL,
                created_at TIMESTAMP DEFAULT (datetime('now')),
                UNIQUE(user_id, key),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Sozlamalar
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user_settings (
                user_id    INTEGER PRIMARY KEY,
                name       TEXT,
                language   TEXT    DEFAULT 'uz',
                ai_style   TEXT    DEFAULT 'friendly',
                theme      TEXT    DEFAULT 'dark',
                temperature REAL   DEFAULT 0.7,
                tts_voice  TEXT    DEFAULT 'default',
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Kunlik foydalanish
        conn.execute("""
            CREATE TABLE IF NOT EXISTS usage_stats (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    INTEGER NOT NULL,
                type       TEXT    NOT NULL,
                count      INTEGER DEFAULT 0,
                date       TEXT    DEFAULT (date('now')),
                UNIQUE(user_id, type, date),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Bildirishnomalar
        conn.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    INTEGER NOT NULL,
                title      TEXT    NOT NULL,
                message    TEXT    NOT NULL,
                type       TEXT    DEFAULT 'info',
                is_read    INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Obunalar
        conn.execute("""
            CREATE TABLE IF NOT EXISTS subscriptions (
                id                 INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id            INTEGER NOT NULL,
                plan               TEXT    NOT NULL,
                stripe_customer_id TEXT,
                stripe_sub_id      TEXT,
                status             TEXT    DEFAULT 'active',
                started_at         TIMESTAMP DEFAULT (datetime('now')),
                expires_at         TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Todo
        conn.execute("""
            CREATE TABLE IF NOT EXISTS todos (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    INTEGER NOT NULL,
                title      TEXT    NOT NULL,
                done       INTEGER DEFAULT 0,
                priority   TEXT    DEFAULT 'normal',
                due_date   TEXT,
                created_at TIMESTAMP DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Eslatmalar
        conn.execute("""
            CREATE TABLE IF NOT EXISTS reminders (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    INTEGER NOT NULL,
                title      TEXT    NOT NULL,
                message    TEXT,
                remind_at  TIMESTAMP NOT NULL,
                is_sent    INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Taklif/Shikoyat
        conn.execute("""
            CREATE TABLE IF NOT EXISTS feedback (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id     INTEGER NOT NULL,
                type        TEXT    NOT NULL CHECK(type IN ('taklif','shikoyat')),
                rating      INTEGER CHECK(rating BETWEEN 1 AND 5),
                message     TEXT    NOT NULL,
                status      TEXT    DEFAULT 'new',
                admin_reply TEXT,
                created_at  TIMESTAMP DEFAULT (datetime('now')),
                updated_at  TIMESTAMP DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Rasm tarixi
        conn.execute("""
            CREATE TABLE IF NOT EXISTS image_history (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    INTEGER NOT NULL,
                prompt     TEXT    NOT NULL,
                style      TEXT    DEFAULT 'realistic',
                image_url  TEXT,
                image_b64  TEXT,
                engine     TEXT    DEFAULT 'pollinations',
                created_at TIMESTAMP DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Indekslar
        conn.execute("CREATE INDEX IF NOT EXISTS idx_chat_history_session ON chat_history(session_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_chat_history_user ON chat_history(user_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_usage_stats_user ON usage_stats(user_id, date)")

    print("✅ Database initialized")


# ══════════════════════════════════════════════
# USER FUNKSIYALAR
# ══════════════════════════════════════════════
def get_user_by_email(email: str):
    with get_db() as conn:
        return conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()

def get_user_by_id(user_id: int):
    with get_db() as conn:
        return conn.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()

def create_user(username: str, email: str, hashed_password: str, avatar: str = "bot") -> int:
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO users (username, email, password, avatar) VALUES (?,?,?,?)",
            (username, email, hashed_password, avatar)
        )
        uid = cur.lastrowid
        conn.execute("INSERT OR IGNORE INTO user_settings (user_id) VALUES (?)", (uid,))
        return uid

def get_plan(user_id: int) -> str:
    with get_db() as conn:
        row = conn.execute("SELECT plan FROM users WHERE id=?", (user_id,)).fetchone()
        return row["plan"] if row else "free"

def set_plan(user_id: int, plan: str):
    with get_db() as conn:
        conn.execute("UPDATE users SET plan=? WHERE id=?", (plan, user_id))


# ══════════════════════════════════════════════
# CHAT FUNKSIYALAR
# ══════════════════════════════════════════════
def save_message(user_id: int, role: str, content: str):
    with get_db() as conn:
        conn.execute(
            "INSERT INTO chat_history (user_id, role, content) VALUES (?,?,?)",
            (user_id, role, content[:8000])
        )

def save_message_session(user_id: int, session_id: int, role: str, content: str):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    try:
        conn.execute(
            "INSERT INTO chat_history (user_id, session_id, role, content) VALUES (?,?,?,?)",
            (user_id, session_id, role, content[:8000])
        )
        conn.execute(
            "UPDATE chat_sessions SET msg_count=msg_count+1, updated_at=datetime('now') WHERE id=?",
            (session_id,)
        )
        conn.commit()
    except Exception as e:
        print(f"save_message_session xato: {e}")
        conn.rollback()
    finally:
        conn.close()

def get_chat_history(user_id: int, limit: int = 50) -> list:
    with get_db() as conn:
        rows = conn.execute(
            "SELECT role, content, created_at FROM chat_history WHERE user_id=? ORDER BY created_at DESC LIMIT ?",
            (user_id, limit)
        ).fetchall()
    return [{"role": r["role"], "content": r["content"], "created_at": r["created_at"]} for r in reversed(rows)]

def clear_chat_history(user_id: int):
    with get_db() as conn:
        conn.execute("DELETE FROM chat_history WHERE user_id=?", (user_id,))


# ══════════════════════════════════════════════
# SESSIYA FUNKSIYALAR
# ══════════════════════════════════════════════
def get_sessions_list(user_id: int, limit: int = 30) -> list:
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, title, model, msg_count, updated_at FROM chat_sessions WHERE user_id=? ORDER BY updated_at DESC LIMIT ?",
            (user_id, limit)
        ).fetchall()
    return [dict(r) for r in rows]

def create_session_full(user_id: int, title: str = "Yangi suhbat", model: str = "") -> int:
    from config import DEFAULT_MODEL
    m = model or DEFAULT_MODEL
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO chat_sessions (user_id, title, model) VALUES (?,?,?)",
            (user_id, title, m)
        )
        return cur.lastrowid

def get_session_messages(session_id: int, limit: int = 100) -> list:
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    try:
        rows = conn.execute(
            "SELECT role, content, created_at FROM chat_history WHERE session_id=? ORDER BY created_at ASC LIMIT ?",
            (session_id, limit)
        ).fetchall()
        return [{"role": r["role"], "content": r["content"], "created_at": r["created_at"]} for r in rows]
    except Exception as e:
        print(f"get_session_messages xato: {e}")
        return []
    finally:
        conn.close()

def auto_name_session(session_id: int, first_msg: str):
    title = first_msg.strip()[:50]
    if len(first_msg) > 50:
        title += "..."
    with get_db() as conn:
        conn.execute("UPDATE chat_sessions SET title=? WHERE id=?", (title, session_id))

def delete_session_full(session_id: int):
    with get_db() as conn:
        conn.execute("DELETE FROM chat_history WHERE session_id=?", (session_id,))
        conn.execute("DELETE FROM chat_sessions WHERE id=?", (session_id,))


# ══════════════════════════════════════════════
# USAGE / LIMIT
# ══════════════════════════════════════════════
def get_usage(user_id: int, type: str) -> int:
    with get_db() as conn:
        row = conn.execute(
            "SELECT count FROM usage_stats WHERE user_id=? AND type=? AND date=date('now')",
            (user_id, type)
        ).fetchone()
    return row["count"] if row else 0

def increment_usage(user_id: int, type: str):
    with get_db() as conn:
        conn.execute("""
            INSERT INTO usage_stats (user_id, type, count, date) VALUES (?,?,1,date('now'))
            ON CONFLICT(user_id, type, date) DO UPDATE SET count=count+1
        """, (user_id, type))


# ══════════════════════════════════════════════
# SETTINGS
# ══════════════════════════════════════════════
def get_settings(user_id: int) -> dict:
    with get_db() as conn:
        row = conn.execute("SELECT * FROM user_settings WHERE user_id=?", (user_id,)).fetchone()
    return dict(row) if row else {}

def update_settings(user_id: int, data: dict):
    fields = ["name", "language", "ai_style", "theme", "temperature", "tts_voice"]
    updates = {k: v for k, v in data.items() if k in fields}
    if not updates:
        return
    with get_db() as conn:
        conn.execute("INSERT OR IGNORE INTO user_settings (user_id) VALUES (?)", (user_id,))
        sets = ", ".join(f"{k}=?" for k in updates)
        conn.execute(f"UPDATE user_settings SET {sets} WHERE user_id=?", (*updates.values(), user_id))


# ══════════════════════════════════════════════
# MEMORY
# ══════════════════════════════════════════════
def save_memory(user_id: int, key: str, value: str):
    with get_db() as conn:
        conn.execute("""
            INSERT INTO user_memory (user_id, key, value) VALUES (?,?,?)
            ON CONFLICT(user_id, key) DO UPDATE SET value=excluded.value
        """, (user_id, key, value))

def get_memory(user_id: int) -> dict:
    with get_db() as conn:
        rows = conn.execute("SELECT key, value FROM user_memory WHERE user_id=?", (user_id,)).fetchall()
    return {r["key"]: r["value"] for r in rows}

def delete_memory(user_id: int, key: str):
    with get_db() as conn:
        conn.execute("DELETE FROM user_memory WHERE user_id=? AND key=?", (user_id, key))

def clear_memory(user_id: int):
    with get_db() as conn:
        conn.execute("DELETE FROM user_memory WHERE user_id=?", (user_id,))