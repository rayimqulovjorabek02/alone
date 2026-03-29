"""
backend/app/core/email_service.py — Email xabarnoma yuborish
"""
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT
import logging

logger = logging.getLogger(__name__)


async def send_email(to: str, subject: str, body_html: str) -> bool:
    """Asinxron email yuborish."""
    if not EMAIL_USER or not EMAIL_PASS:
        logger.warning("[Email] EMAIL_USER yoki EMAIL_PASS sozlanmagan")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"Alone AI <{EMAIL_USER}>"
    msg["To"]      = to
    msg.attach(MIMEText(body_html, "html", "utf-8"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=EMAIL_HOST,
            port=EMAIL_PORT,
            username=EMAIL_USER,
            password=EMAIL_PASS,
            start_tls=True,
        )
        logger.info(f"[Email] Yuborildi: {to}")
        return True
    except Exception as e:
        logger.error(f"[Email] Xato: {e}")
        return False


async def send_reminder_email(to: str, title: str, username: str = "Foydalanuvchi") -> bool:
    """Eslatma emailini yuborish."""
    subject = f"⏰ Eslatma: {title}"
    body = f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#09090d;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="500" cellpadding="0" cellspacing="0"
               style="background:#111118;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:32px;text-align:center;">
              <div style="font-size:36px;margin-bottom:8px;">⏰</div>
              <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">Eslatma vaqti keldi!</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="color:#9898aa;margin:0 0 16px;font-size:14px;">
                Salom, <strong style="color:#ededf0;">{username}</strong>!
              </p>
              <div style="background:#1a1a24;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:20px;margin:16px 0;">
                <p style="color:#a78bfa;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">
                  Eslatma
                </p>
                <p style="color:#ededf0;font-size:18px;font-weight:700;margin:0;">
                  {title}
                </p>
              </div>
              <p style="color:#55556a;font-size:13px;margin:16px 0 0;text-align:center;">
                Bu xabar Alone AI tomonidan avtomatik yuborildi.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#0d0d14;padding:20px;text-align:center;">
              <a href="http://localhost:5173/reminder"
                 style="background:#7c3aed;color:white;padding:10px 24px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:700;">
                Eslatmalarni ko'rish →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    return await send_email(to, subject, body)