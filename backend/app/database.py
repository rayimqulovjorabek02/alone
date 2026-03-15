"""
backend/app/database.py
SQLite ulanish — path muammosi hal qilindi
"""
import os
import sqlite3
from pathlib import Path

# ── DB Path — har qanday muhitda to'g'ri ishlaydi ────────────
def get_db_path() -> str:
    # 1. .env dan
    env_path = os.getenv("DB_PATH", "")
    if env_path:
        path = Path(env_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        return str(path)

    # 2. Fayl joylashuviga qarab (backend/data/alone.db)
    base = Path(__file__).resolve().parent.parent  # backend/
    data_dir = base / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    return str(data_dir / "alone.db")

DB_PATH = get_db_path()
print(f"[DB] Path: {DB_PATH}")


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                username     TEXT    NOT NULL,
                email        TEXT    UNIQUE NOT NULL,
                password     TEXT    NOT NULL,
                avatar       TEXT    DEFAULT 'bot',
                plan         TEXT    DEFAULT 'free',
                is_admin     INTEGER DEFAULT 0,
                is_active    INTEGER DEFAULT 1,
                is_verified  INTEGER DEFAULT 0,
                verify_code  TEXT,
                reset_code   TEXT,
                last_login   REAL,
                created_at   REAL    DEFAULT (unixepoch())
            );

            CREATE TABLE IF NOT EXISTS chat_sessions (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title      TEXT    DEFAULT 'Yangi suhbat',
                model      TEXT    DEFAULT '',
                created_at REAL    DEFAULT (unixepoch()),
                updated_at REAL    DEFAULT (unixepoch())
            );

            CREATE TABLE IF NOT EXISTS chat_history (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                session_id INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,
                role       TEXT    NOT NULL,
                content    TEXT    NOT NULL,
                created_at REAL    DEFAULT (unixepoch())
            );

            CREATE TABLE IF NOT EXISTS user_memory (
                id       INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                key      TEXT    NOT NULL,
                value    TEXT    NOT NULL,
                UNIQUE(user_id, key)
            );

            CREATE TABLE IF NOT EXISTS user_settings (
                user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                language   TEXT    DEFAULT 'uz',
                ai_style   TEXT    DEFAULT 'friendly',
                theme      TEXT    DEFAULT 'dark',
                model      TEXT    DEFAULT '',
                updated_at REAL    DEFAULT (unixepoch())
            );

            CREATE TABLE IF NOT EXISTS usage_stats (
                id      INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type    TEXT    NOT NULL,
                count   INTEGER DEFAULT 0,
                date    TEXT    DEFAULT (date('now')),
                UNIQUE(user_id, type, date)
            );

            CREATE TABLE IF NOT EXISTS notifications (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title      TEXT    NOT NULL,
                message    TEXT    NOT NULL,
                type       TEXT    DEFAULT 'info',
                is_read    INTEGER DEFAULT 0,
                created_at REAL    DEFAULT (unixepoch())
            );

            CREATE TABLE IF NOT EXISTS todos (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                text       TEXT    NOT NULL,
                done       INTEGER DEFAULT 0,
                priority   TEXT    DEFAULT 'normal',
                due_date   TEXT,
                created_at REAL    DEFAULT (unixepoch())
            );

            CREATE TABLE IF NOT EXISTS reminders (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title      TEXT    NOT NULL,
                body       TEXT,
                remind_at  REAL    NOT NULL,
                is_sent    INTEGER DEFAULT 0,
                created_at REAL    DEFAULT (unixepoch())
            );

            CREATE TABLE IF NOT EXISTS feedback (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    INTEGER,
                type       TEXT    DEFAULT 'general',
                message    TEXT    NOT NULL,
                rating     INTEGER,
                created_at REAL    DEFAULT (unixepoch())
            );

            CREATE TABLE IF NOT EXISTS image_history (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                prompt     TEXT    NOT NULL,
                url        TEXT,
                model      TEXT    DEFAULT 'stability',
                created_at REAL    DEFAULT (unixepoch())
            );

            CREATE TABLE IF NOT EXISTS subscriptions (
                id                 INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                plan               TEXT    NOT NULL,
                status             TEXT    DEFAULT 'active',
                stripe_customer_id TEXT,
                stripe_sub_id      TEXT,
                started_at         REAL    DEFAULT (unixepoch()),
                expires_at         REAL
            );

            -- Indekslar
            CREATE INDEX IF NOT EXISTS idx_chat_user    ON chat_history(user_id);
            CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_history(session_id);
            CREATE INDEX IF NOT EXISTS idx_notif_user   ON notifications(user_id);
            CREATE INDEX IF NOT EXISTS idx_todo_user    ON todos(user_id);
            CREATE INDEX IF NOT EXISTS idx_reminder_at  ON reminders(remind_at);
        """)
        conn.commit()

        # Migration: usage_stats ga UNIQUE constraint qo'shish (eski DB uchun)
        _migrate_usage_stats(conn)

    # Migration: image_history va boshqa jadvallarni yangilash
    _migrate_tables(conn)

    print("✅ Database initialized")


def _migrate_tables(conn):
    """Eski DB da etishmayotgan ustunlarni qo'shish."""
    migrations = [
        # image_history
        ("image_history", "url",      "ALTER TABLE image_history ADD COLUMN url TEXT"),
        ("image_history", "model",    "ALTER TABLE image_history ADD COLUMN model TEXT DEFAULT 'stability'"),
        # chat_sessions
        ("chat_sessions", "model",    "ALTER TABLE chat_sessions ADD COLUMN model TEXT DEFAULT ''"),
        # users
        ("users", "is_verified",      "ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0"),
        ("users", "verify_code",      "ALTER TABLE users ADD COLUMN verify_code TEXT"),
        ("users", "reset_code",       "ALTER TABLE users ADD COLUMN reset_code TEXT"),
        ("users", "last_login",       "ALTER TABLE users ADD COLUMN last_login REAL"),
        # todos
        ("todos", "task",             "ALTER TABLE todos ADD COLUMN task TEXT"),
        ("todos", "title",            "ALTER TABLE todos ADD COLUMN title TEXT"),
        ("todos", "priority",         "ALTER TABLE todos ADD COLUMN priority TEXT DEFAULT 'normal'"),
        ("todos", "due_date",         "ALTER TABLE todos ADD COLUMN due_date TEXT"),
        # reminders
        ("reminders", "body",         "ALTER TABLE reminders ADD COLUMN body TEXT"),
        ("reminders", "is_sent",      "ALTER TABLE reminders ADD COLUMN is_sent INTEGER DEFAULT 0"),
        # notifications
        ("notifications", "type",     "ALTER TABLE notifications ADD COLUMN type TEXT DEFAULT 'info'"),
        ("notifications", "is_read",  "ALTER TABLE notifications ADD COLUMN is_read INTEGER DEFAULT 0"),
        # user_settings
        ("user_settings", "name",        "ALTER TABLE user_settings ADD COLUMN name TEXT DEFAULT ''"),
        ("user_settings", "temperature", "ALTER TABLE user_settings ADD COLUMN temperature REAL DEFAULT 0.7"),
        ("user_settings", "tts_voice",   "ALTER TABLE user_settings ADD COLUMN tts_voice TEXT DEFAULT 'default'"),
        # feedback
        ("feedback", "status",      "ALTER TABLE feedback ADD COLUMN status TEXT DEFAULT 'new'"),
        ("feedback", "admin_reply", "ALTER TABLE feedback ADD COLUMN admin_reply TEXT"),
        # subscriptions
        ("subscriptions", "status",           "ALTER TABLE subscriptions ADD COLUMN status TEXT DEFAULT 'active'"),
        ("subscriptions", "stripe_customer_id","ALTER TABLE subscriptions ADD COLUMN stripe_customer_id TEXT"),
        ("subscriptions", "stripe_sub_id",    "ALTER TABLE subscriptions ADD COLUMN stripe_sub_id TEXT"),
        ("subscriptions", "expires_at",       "ALTER TABLE subscriptions ADD COLUMN expires_at REAL"),
    ]
    for table, column, sql in migrations:
        try:
            cols = [row[1] for row in conn.execute(f"PRAGMA table_info({table})").fetchall()]
            if column not in cols:
                conn.execute(sql)
                conn.commit()
                print(f"✅ Migration: {table}.{column} qo\'shildi")
        except Exception as e:
            pass


def _migrate_usage_stats(conn):
    """Eski DB da usage_stats UNIQUE constraint yo'q bo'lsa tuzatish."""
    try:
        # Jadval ma'lumotini olish
        info = conn.execute("PRAGMA table_info(usage_stats)").fetchall()
        if not info:
            return  # Jadval yo'q, init_db yaratadi

        # UNIQUE index bormi tekshirish
        indexes = conn.execute("PRAGMA index_list(usage_stats)").fetchall()
        has_unique = any(
            idx["unique"] == 1
            for idx in indexes
            if idx["name"] != "sqlite_autoindex_usage_stats_1"
        )

        # SQLite da mavjud jadvalga UNIQUE qo'shib bo'lmaydi
        # Shuning uchun jadalni qayta yaratish kerak
        if not has_unique:
            conn.executescript("""
                -- Vaqtinchalik jadvalga ko'chirish
                CREATE TABLE IF NOT EXISTS usage_stats_backup AS
                SELECT * FROM usage_stats;

                DROP TABLE usage_stats;

                CREATE TABLE usage_stats (
                    id      INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    type    TEXT    NOT NULL,
                    count   INTEGER DEFAULT 0,
                    date    TEXT    DEFAULT (date('now')),
                    UNIQUE(user_id, type, date)
                );

                -- Ma'lumotlarni qayta yuklash (takrorlanmaydiganlari)
                INSERT OR IGNORE INTO usage_stats (user_id, type, count, date)
                SELECT user_id, type, SUM(count), date
                FROM usage_stats_backup
                GROUP BY user_id, type, date;

                DROP TABLE usage_stats_backup;
            """)
            conn.commit()
            print("✅ usage_stats migration bajarildi")
    except Exception as e:
        print(f"⚠️  usage_stats migration xato: {e}")


# ── CRUD funksiyalari ─────────────────────────────────────────

def get_user_by_email(email: str):
    with get_db() as db:
        return db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()

def get_user_by_id(user_id: int):
    with get_db() as db:
        return db.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()

def create_user(username, email, hashed_password, avatar="bot") -> int:
    with get_db() as db:
        cur = db.execute(
            "INSERT INTO users (username,email,password,avatar) VALUES (?,?,?,?)",
            (username, email, hashed_password, avatar)
        )
        db.commit()
        return cur.lastrowid

def get_plan(user_id: int) -> str:
    with get_db() as db:
        row = db.execute("SELECT plan FROM users WHERE id=?", (user_id,)).fetchone()
        return row["plan"] if row else "free"

def set_plan(user_id: int, plan: str):
    with get_db() as db:
        db.execute("UPDATE users SET plan=? WHERE id=?", (plan, user_id))
        db.commit()

def save_message(user_id: int, role: str, content: str):
    with get_db() as db:
        db.execute(
            "INSERT INTO chat_history (user_id,role,content) VALUES (?,?,?)",
            (user_id, role, content)
        )
        db.commit()

def save_message_session(user_id: int, session_id: int, role: str, content: str):
    with get_db() as db:
        db.execute(
            "INSERT INTO chat_history (user_id,session_id,role,content) VALUES (?,?,?,?)",
            (user_id, session_id, role, content)
        )
        db.commit()

def get_chat_history(user_id: int, limit: int = 50) -> list:
    with get_db() as db:
        rows = db.execute(
            "SELECT role,content FROM chat_history WHERE user_id=? ORDER BY id DESC LIMIT ?",
            (user_id, limit)
        ).fetchall()
        return [dict(r) for r in reversed(rows)]

def clear_chat_history(user_id: int):
    with get_db() as db:
        db.execute("DELETE FROM chat_history WHERE user_id=?", (user_id,))
        db.commit()

def get_sessions_list(user_id: int, limit: int = 30) -> list:
    with get_db() as db:
        rows = db.execute(
            "SELECT * FROM chat_sessions WHERE user_id=? ORDER BY updated_at DESC LIMIT ?",
            (user_id, limit)
        ).fetchall()
        return [dict(r) for r in rows]

def create_session_full(user_id: int, title: str = "Yangi suhbat", model: str = "") -> int:
    with get_db() as db:
        cur = db.execute(
            "INSERT INTO chat_sessions (user_id,title,model) VALUES (?,?,?)",
            (user_id, title, model)
        )
        db.commit()
        return cur.lastrowid

def get_session_messages(session_id: int, limit: int = 100) -> list:
    with get_db() as db:
        rows = db.execute(
            "SELECT role,content FROM chat_history WHERE session_id=? ORDER BY id LIMIT ?",
            (session_id, limit)
        ).fetchall()
        return [dict(r) for r in rows]

def auto_name_session(session_id: int, first_msg: str):
    title = first_msg[:40] + ("..." if len(first_msg) > 40 else "")
    with get_db() as db:
        db.execute("UPDATE chat_sessions SET title=? WHERE id=?", (title, session_id))
        db.commit()

def delete_session_full(session_id: int):
    with get_db() as db:
        db.execute("DELETE FROM chat_sessions WHERE id=?", (session_id,))
        db.commit()

def get_usage(user_id: int, type: str) -> int:
    with get_db() as db:
        row = db.execute(
            "SELECT count FROM usage_stats WHERE user_id=? AND type=? AND date=date('now')",
            (user_id, type)
        ).fetchone()
        return row["count"] if row else 0

def increment_usage(user_id: int, type: str):
    with get_db() as db:
        # Avval mavjudligini tekshir
        row = db.execute(
            "SELECT id FROM usage_stats WHERE user_id=? AND type=? AND date=date('now')",
            (user_id, type)
        ).fetchone()
        if row:
            db.execute(
                "UPDATE usage_stats SET count=count+1 WHERE user_id=? AND type=? AND date=date('now')",
                (user_id, type)
            )
        else:
            db.execute(
                "INSERT INTO usage_stats (user_id,type,count,date) VALUES (?,?,1,date('now'))",
                (user_id, type)
            )
        db.commit()

def get_settings(user_id: int) -> dict:
    with get_db() as db:
        row = db.execute("SELECT * FROM user_settings WHERE user_id=?", (user_id,)).fetchone()
        return dict(row) if row else {}

def update_settings(user_id: int, data: dict):
    with get_db() as db:
        existing = db.execute("SELECT user_id FROM user_settings WHERE user_id=?", (user_id,)).fetchone()
        if existing:
            sets = ", ".join(f"{k}=?" for k in data)
            db.execute(f"UPDATE user_settings SET {sets} WHERE user_id=?", (*data.values(), user_id))
        else:
            data["user_id"] = user_id
            cols = ", ".join(data.keys())
            vals = ", ".join("?" * len(data))
            db.execute(f"INSERT INTO user_settings ({cols}) VALUES ({vals})", tuple(data.values()))
        db.commit()

def save_memory(user_id: int, key: str, value: str):
    with get_db() as db:
        db.execute("""
            INSERT INTO user_memory (user_id,key,value) VALUES (?,?,?)
            ON CONFLICT(user_id,key) DO UPDATE SET value=excluded.value
        """, (user_id, key, value))
        db.commit()

def get_memory(user_id: int) -> dict:
    with get_db() as db:
        rows = db.execute("SELECT key,value FROM user_memory WHERE user_id=?", (user_id,)).fetchall()
        return {r["key"]: r["value"] for r in rows}

def delete_memory(user_id: int, key: str):
    with get_db() as db:
        db.execute("DELETE FROM user_memory WHERE user_id=? AND key=?", (user_id, key))
        db.commit()

def clear_memory(user_id: int):
    with get_db() as db:
        db.execute("DELETE FROM user_memory WHERE user_id=?", (user_id,))
        db.commit()