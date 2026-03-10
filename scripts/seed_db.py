"""
scripts/seed_db.py — Test ma'lumotlar yaratish
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend', 'app'))

from database import init_db, create_user, get_db
from passlib.context import CryptContext

pwd = CryptContext(schemes=["bcrypt"])

def seed():
    init_db()
    with get_db() as conn:
        # Admin user
        existing = conn.execute("SELECT id FROM users WHERE email='admin@aloneai.uz'").fetchone()
        if not existing:
            uid = create_user("Admin", "admin@aloneai.uz", pwd.hash("admin123"), "bot")
            conn.execute("UPDATE users SET is_admin=1, plan='premium' WHERE id=?", (uid,))
            print(f"✅ Admin yaratildi: admin@aloneai.uz / admin123")
        else:
            print("ℹ️  Admin allaqachon bor")

        # Test user
        existing2 = conn.execute("SELECT id FROM users WHERE email='test@aloneai.uz'").fetchone()
        if not existing2:
            create_user("TestUser", "test@aloneai.uz", pwd.hash("test123"))
            print(f"✅ Test user yaratildi: test@aloneai.uz / test123")
        else:
            print("ℹ️  Test user allaqachon bor")

    print("✅ Seed tugadi")

if __name__ == "__main__":
    seed()