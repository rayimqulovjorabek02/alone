"""
backend/app/db_init.py
DB jadvallarini yaratish — to'g'ridan SQLite ishlatadi.
Import zanjiri muammolari yo'q.
"""
import sys
import os
import sqlite3

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# DB path ni config dan olish, bo'lmasa default
try:
    from config import DB_PATH
except Exception:
    DB_PATH = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "..", "data", "alone.db"
    )

# data/ papkasini yaratish
os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)

print("=" * 40)
print("  Alone AI — DB yaratilmoqda")
print(f"  Path: {DB_PATH}")
print("=" * 40)


def run_sql(label: str, sql_list: list):
    try:
        with sqlite3.connect(DB_PATH) as db:
            for sql in sql_list:
                db.execute(sql)
            db.commit()
        print(f"  [OK] {label}")
    except Exception as e:
        print(f"  [XATO] {label}: {e}")


# 1. Asosiy jadvallar
try:
    from database import init_db
    init_db()
    print("  [OK] Asosiy jadvallar")
except Exception as e:
    print(f"  [XATO] Asosiy jadvallar: {e}")

# 2. Audit log jadvali
run_sql("Audit log", ["""
    CREATE TABLE IF NOT EXISTS audit_log (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp   REAL    NOT NULL DEFAULT (unixepoch()),
        user_id     INTEGER,
        ip          TEXT,
        action      TEXT    NOT NULL,
        resource    TEXT,
        resource_id TEXT,
        old_value   TEXT,
        new_value   TEXT,
        status      TEXT    DEFAULT 'success',
        details     TEXT,
        user_agent  TEXT
    )
""",
    "CREATE INDEX IF NOT EXISTS idx_audit_user   ON audit_log(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action)",
    "CREATE INDEX IF NOT EXISTS idx_audit_time   ON audit_log(timestamp)",
])

# 3. IP blacklist jadvali
run_sql("IP blacklist", ["""
    CREATE TABLE IF NOT EXISTS ip_blacklist (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        ip         TEXT    UNIQUE NOT NULL,
        reason     TEXT,
        blocked_by INTEGER,
        blocked_at REAL    DEFAULT (unixepoch()),
        expires_at REAL,
        is_active  INTEGER DEFAULT 1
    )
""", """
    CREATE TABLE IF NOT EXISTS ip_violations (
        ip        TEXT    PRIMARY KEY,
        count     INTEGER DEFAULT 0,
        last_seen REAL
    )
"""])

# 4. 2FA jadvali
run_sql("2FA", ["""
    CREATE TABLE IF NOT EXISTS user_2fa (
        user_id    INTEGER PRIMARY KEY,
        secret     TEXT    NOT NULL,
        enabled    INTEGER DEFAULT 0,
        created_at REAL    DEFAULT (unixepoch()),
        last_used  REAL
    )
"""])

# 5. Provider log jadvali
run_sql("Provider log", ["""
    CREATE TABLE IF NOT EXISTS provider_log (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        provider   TEXT,
        event      TEXT,
        created_at REAL DEFAULT (unixepoch())
    )
"""])

print("=" * 40)
print("  DB tayyor!")
print("=" * 40)