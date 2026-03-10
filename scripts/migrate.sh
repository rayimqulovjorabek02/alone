#!/bin/bash
# scripts/migrate.sh — DB migration

echo "🔄 Migration boshlandi..."
cd "$(dirname "$0")/../backend/app"

python -c "
from database import init_db, get_db
import sqlite3

init_db()

# session_id ustunini qo'shish (eski DB uchun)
with get_db() as conn:
    try:
        conn.execute('ALTER TABLE chat_history ADD COLUMN session_id INTEGER')
        print('✅ session_id ustuni qoshildi')
    except:
        print('ℹ️  session_id allaqachon bor')
"

echo "✅ Migration tugadi"