"""
backend/app/core/two_factor.py — TOTP 2FA (Google Authenticator)
"""
import pyotp
import qrcode
import io
import base64
import sqlite3
import time
from config import DB_PATH


def init_2fa_table():
    with sqlite3.connect(DB_PATH) as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS user_2fa (
                user_id    INTEGER PRIMARY KEY,
                secret     TEXT    NOT NULL,
                enabled    INTEGER DEFAULT 0,
                created_at REAL    DEFAULT (unixepoch()),
                last_used  REAL
            )
        """)
        db.commit()


def generate_secret(user_id: int) -> str:
    """Yangi TOTP secret yaratish va saqlash."""
    secret = pyotp.random_base32()
    with sqlite3.connect(DB_PATH) as db:
        db.execute("""
            INSERT INTO user_2fa (user_id, secret, enabled)
            VALUES (?, ?, 0)
            ON CONFLICT(user_id) DO UPDATE SET secret = excluded.secret, enabled = 0
        """, (user_id, secret))
        db.commit()
    return secret


def get_qr_code(user_id: int, email: str) -> str:
    """QR code generatsiya → base64 PNG."""
    with sqlite3.connect(DB_PATH) as db:
        row = db.execute(
            "SELECT secret FROM user_2fa WHERE user_id=?", (user_id,)
        ).fetchone()
    if not row:
        secret = generate_secret(user_id)
    else:
        secret = row[0]

    totp    = pyotp.TOTP(secret)
    uri     = totp.provisioning_uri(name=email, issuer_name="Alone AI")
    img     = qrcode.make(uri)
    buf     = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def verify_totp(user_id: int, code: str) -> bool:
    """TOTP kodini tekshirish."""
    with sqlite3.connect(DB_PATH) as db:
        row = db.execute(
            "SELECT secret FROM user_2fa WHERE user_id=? AND enabled=1",
            (user_id,)
        ).fetchone()
    if not row:
        return False

    totp  = pyotp.TOTP(row[0])
    valid = totp.verify(code, valid_window=1)  # ±30 soniya

    if valid:
        with sqlite3.connect(DB_PATH) as db:
            db.execute(
                "UPDATE user_2fa SET last_used=? WHERE user_id=?",
                (time.time(), user_id)
            )
            db.commit()
    return valid


def enable_2fa(user_id: int, code: str) -> bool:
    """2FA ni faollashtirish (kod to'g'ri bo'lsa)."""
    with sqlite3.connect(DB_PATH) as db:
        row = db.execute(
            "SELECT secret FROM user_2fa WHERE user_id=?", (user_id,)
        ).fetchone()
    if not row:
        return False

    totp = pyotp.TOTP(row[0])
    if not totp.verify(code, valid_window=1):
        return False

    with sqlite3.connect(DB_PATH) as db:
        db.execute("UPDATE user_2fa SET enabled=1 WHERE user_id=?", (user_id,))
        db.commit()
    return True


def disable_2fa(user_id: int):
    with sqlite3.connect(DB_PATH) as db:
        db.execute("UPDATE user_2fa SET enabled=0 WHERE user_id=?", (user_id,))
        db.commit()


def is_2fa_enabled(user_id: int) -> bool:
    with sqlite3.connect(DB_PATH) as db:
        row = db.execute(
            "SELECT enabled FROM user_2fa WHERE user_id=?", (user_id,)
        ).fetchone()
    return bool(row and row[0])