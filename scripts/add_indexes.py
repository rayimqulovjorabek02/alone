"""
scripts/add_indexes.py
Mavjud DB ga yetishmayotgan indekslarni qo'shish.
Bir marta ishga tushiring: python scripts/add_indexes.py
"""
import sys
import os

# app papkasini Python path ga qo'shish
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "app"))

# .env ni yuklash
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from database import get_db

INDEXES = [
    # chat_sessions — user_id bo'yicha tez qidiruv
    "CREATE INDEX IF NOT EXISTS idx_sessions_user ON chat_sessions(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_sessions_updated ON chat_sessions(updated_at DESC)",

    # usage_stats — kundagi limitlarni tez tekshirish
    "CREATE INDEX IF NOT EXISTS idx_usage_user_type_date ON usage_stats(user_id, type, date)",

    # reminders — user_id bo'yicha
    "CREATE INDEX IF NOT EXISTS idx_reminder_user ON reminders(user_id)",

    # todos — done=0 bo'lganlarni tez topish
    "CREATE INDEX IF NOT EXISTS idx_todo_user_done ON todos(user_id, done)",

    # audit_log mavjud bo'lsa
    """CREATE INDEX IF NOT EXISTS idx_audit_user
       ON audit_log(user_id) WHERE user_id IS NOT NULL""",

    # notifications — o'qilmagan bildirishnomalar
    "CREATE INDEX IF NOT EXISTS idx_notif_unread ON notifications(user_id, is_read)",
]

ANALYZE = [
    "ANALYZE chat_history",
    "ANALYZE chat_sessions",
    "ANALYZE usage_stats",
    "ANALYZE notifications",
    "ANALYZE todos",
]


def run():
    print("🔧 Indekslar qo'shilmoqda...")
    with get_db() as conn:
        for sql in INDEXES:
            try:
                conn.execute(sql)
                name = sql.split("idx_")[1].split(" ")[0] if "idx_" in sql else "?"
                print(f"  ✅ idx_{name}")
            except Exception as e:
                print(f"  ⚠️  {e}")

        # Statistikani yangilash — query planner yaxshilanadi
        print("\n📊 ANALYZE ishga tushirilmoqda...")
        for sql in ANALYZE:
            try:
                conn.execute(sql)
                print(f"  ✅ {sql.split()[-1]}")
            except Exception as e:
                print(f"  ⚠️  {e}")

        conn.execute("PRAGMA optimize")
        conn.commit()

    print("\n✅ Barcha indekslar qo'shildi!")

    # Indekslar ro'yxatini ko'rsatish
    with get_db() as conn:
        rows = conn.execute(
            "SELECT name, tbl_name FROM sqlite_master WHERE type='index' ORDER BY tbl_name, name"
        ).fetchall()
    print("\n📋 Barcha indekslar:")
    current_table = ""
    for row in rows:
        if row["tbl_name"] != current_table:
            current_table = row["tbl_name"]
            print(f"\n  [{current_table}]")
        print(f"    • {row['name']}")


if __name__ == "__main__":
    run()