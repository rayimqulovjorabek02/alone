"""
backend/app/core/email_sender.py — Email yuborish
"""
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

EMAIL_USER = os.getenv("EMAIL_USER", "")
EMAIL_PASS = os.getenv("EMAIL_PASS", "")
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))


def send_email(to: str, subject: str, body: str, html: bool = False) -> bool:
    if not EMAIL_USER or not EMAIL_PASS:
        print("Email sozlanmagan")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = EMAIL_USER
        msg["To"]      = to

        part = MIMEText(body, "html" if html else "plain", "utf-8")
        msg.attach(part)

        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.sendmail(EMAIL_USER, to, msg.as_string())
        return True
    except Exception as e:
        print(f"Email xato: {e}")
        return False


def send_verification_code(to: str, code: str, username: str = "") -> bool:
    subject = "Alone AI — Tasdiqlash kodi"
    body = f"""
    <div style="font-family: Arial; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #7c3aed;">🤖 Alone AI</h2>
        <p>Salom {username}!</p>
        <p>Tasdiqlash kodingiz:</p>
        <div style="font-size: 32px; font-weight: bold; color: #7c3aed; letter-spacing: 8px; padding: 20px; background: #f3f0ff; border-radius: 10px; text-align: center;">
            {code}
        </div>
        <p style="color: #666; margin-top: 20px;">Kod 10 daqiqa davomida amal qiladi.</p>
    </div>
    """
    return send_email(to, subject, body, html=True)