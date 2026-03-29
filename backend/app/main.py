"""
backend/app/main.py — Alone AI FastAPI Backend (To'liq versiya)
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from database import init_db
from config import ALLOWED_ORIGINS


# ── Startup / Shutdown ────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # DB jadvallarini yaratish
    init_db()

    # Xavfsizlik jadvallarini yaratish
    try:
        from core.audit_log    import init_audit_table
        from core.ip_blacklist import init_blacklist_table
        from core.two_factor   import init_2fa_table
        init_audit_table()
        init_blacklist_table()
        init_2fa_table()
        print("✅ Xavfsizlik jadvallari tayyor")
    except Exception as e:
        print(f"⚠️  Xavfsizlik jadval xato: {e}")

    print("🚀 Alone AI Backend ishga tushdi")

    # Reminder background task
    import asyncio
    reminder_task = asyncio.create_task(_reminder_checker())

    yield

    reminder_task.cancel()
    print("🛑 Alone AI Backend to'xtatildi")




# ── Reminder checker ──────────────────────────────────────────
async def _reminder_checker():
    """Har minutda vaqti kelgan reminderlarni tekshiradi."""
    import asyncio
    while True:
        try:
            _check_reminders()  # darhol tekshir
            await asyncio.sleep(60)  # keyin har 60 sekund
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"[Reminder] Xato: {e}")
            await asyncio.sleep(60)


def _check_reminders():
    """Vaqti kelgan reminderlarni topib notification va email yuboradi."""
    import time
    import asyncio
    from database import get_db
    now = time.time()
    try:
        with get_db() as conn:
            rows = conn.execute(
                "SELECT r.*, u.username, u.email FROM reminders r "
                "JOIN users u ON r.user_id = u.id "
                "WHERE r.remind_at <= ? AND r.is_sent = 0",
                (now,)
            ).fetchall()

            for row in rows:
                try:
                    # In-app notification yaratish
                    conn.execute(
                        "INSERT INTO notifications (user_id, title, message, type) VALUES (?,?,?,?)",
                        (
                            row["user_id"],
                            f"⏰ Eslatma: {row['title']}",
                            row["body"] or row["title"],
                            "reminder"
                        )
                    )
                    # is_sent = 1 qilish
                    conn.execute(
                        "UPDATE reminders SET is_sent=1 WHERE id=?",
                        (row["id"],)
                    )
                    print(f"[Reminder] Notification: {row['username']} → {row['title']}")

                    # Email yuborish (asinxron)
                    if row.get("email"):
                        try:
                            from core.email_service import send_reminder_email
                            loop = asyncio.get_event_loop()
                            loop.create_task(
                                send_reminder_email(
                                    row["email"],
                                    row["title"],
                                    row["username"]
                                )
                            )
                            print(f"[Reminder] Email task: {row['email']}")
                        except Exception as e:
                            print(f"[Reminder] Email xato: {e}")

                except Exception as e:
                    print(f"[Reminder] Xato: {e}")
            conn.commit()
    except Exception as e:
        print(f"[Reminder] DB xato: {e}")

# ── FastAPI ilovasi ───────────────────────────────────────────
app = FastAPI(
    title       = "Alone AI API",
    version     = "2.0.0",
    description = "Alone AI — Aqlli shaxsiy yordamchi API",
    docs_url    = "/api/docs",
    redoc_url   = "/api/redoc",
    openapi_url = "/api/openapi.json",
    lifespan    = lifespan,
)


# ── Middleware ────────────────────────────────────────────────

# 1. CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ALLOWED_ORIGINS + ["http://localhost:5173", "http://localhost:3000"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# 2. IP Blacklist middleware
async def _ip_blacklist_dispatch(request: Request, call_next):
    try:
        from core.ip_blacklist import is_blocked, track_violation
        ip = request.client.host or "unknown"
        if is_blocked(ip):
            return JSONResponse(
                status_code = 403,
                content     = {"detail": "Sizning IP bloklangan. Murojaat uchun: support@aloneai.uz"}
            )
    except Exception:
        pass
    return await call_next(request)

app.add_middleware(BaseHTTPMiddleware, dispatch=_ip_blacklist_dispatch)

# 3. Request logging middleware
async def _request_logger(request: Request, call_next):
    import time
    start    = time.time()
    response = await call_next(request)
    duration = round((time.time() - start) * 1000, 1)

    # Sekin so'rovlarni log qilish (500ms+)
    if duration > 500:
        print(f"🐌 SEKIN: {request.method} {request.url.path} — {duration}ms")

    # API statistikasini yangilash
    try:
        from core.monitoring import APIStats
        path    = request.url.path
        success = response.status_code < 400
        APIStats.track(path, success)
    except Exception:
        pass

    response.headers["X-Response-Time"] = f"{duration}ms"
    response.headers["X-App-Version"]   = "2.0.0"
    return response

app.add_middleware(BaseHTTPMiddleware, dispatch=_request_logger)


# ── Router ro'yxatga olish yordamchisi ───────────────────────
def _reg(module_name: str, prefix: str, tags: list[str]):
    """Router modulini xavfsiz yuklash."""
    import importlib
    try:
        mod = importlib.import_module(f"routers.{module_name}")
        app.include_router(mod.router)
        print(f"  ✅ {prefix}")
    except ModuleNotFoundError:
        print(f"  ⚠️  {module_name} moduli topilmadi")
    except Exception as e:
        print(f"  ❌ {module_name} xato: {e}")


# ── Routerlar ─────────────────────────────────────────────────
print("\n📦 Routerlar yuklanmoqda...")

# Auth
_reg("auth",             "/api/auth",          ["Auth"])
_reg("auth_security",    "/api/auth",          ["Auth"])

# Chat
_reg("chat",             "/api/chat",          ["Chat"])
_reg("agent",            "/api/agent",         ["Agent"])

# Media
_reg("image_router",     "/api/image",         ["Image"])
_reg("voice",            "/api/voice",         ["Voice"])

# Foydalanuvchi
_reg("settings_router",  "/api/settings",      ["Settings"])
_reg("profile_security", "/api/profile",       ["Profile"])
_reg("notifications",    "/api/notifications", ["Notifications"])
_reg("feedback",         "/api/feedback",      ["Feedback"])

# Kontent
_reg("file_analysis",    "/api/files",         ["Files"])
_reg("file_upload",      "/api/upload",        ["Upload"])
_reg("export",           "/api/export",        ["Export"])
_reg("code",             "/api/code",          ["Code"])
_reg("todo",             "/api/todo",          ["Todo"])
_reg("reminders",        "/api/reminder",      ["Reminders"])

# To'lov
_reg("payments",         "/api/payments",      ["Payments"])

# Admin (oddiy)
_reg("admin",            "/api/admin",         ["Admin"])
_reg("admin_stats",      "/api/admin-stats",   ["AdminStats"])
_reg("dashboard",        "/api/dashboard",     ["Dashboard"])

# Dasturchi-admin va health (yangi)
_reg("dev_admin",        "/api/dev",           ["Developer"])
_reg("health",           "/api/health",        ["Health"])

print("✅ Barcha routerlar yuklandi\n")


# ── Asosiy endpointlar ────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    return {
        "status":  "ok",
        "app":     "Alone AI",
        "version": "2.0.0",
        "docs":    "/api/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Load balancer uchun sodda health check."""
    return {"status": "healthy", "version": "2.0.0"}


# ── Global xato tutgich ───────────────────────────────────────
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code = 404,
        content     = {"detail": "So'ralgan manzil topilmadi"}
    )


@app.exception_handler(500)
async def server_error_handler(request: Request, exc):
    print(f"🔴 Server xato: {request.url.path} — {exc}")
    # Xatoni audit log ga yozish
    try:
        from core.audit_log import log_action
        log_action(
            action  = "server_error",
            ip      = request.client.host,
            details = f"{request.url.path}: {str(exc)[:200]}",
            status  = "failed",
        )
    except Exception:
        pass
    return JSONResponse(
        status_code = 500,
        content     = {"detail": "Server xatosi. Iltimos qayta urinib ko'ring."}
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    print(f"🔴 Kutilmagan xato: {type(exc).__name__}: {exc}")
    return JSONResponse(
        status_code = 500,
        content     = {"detail": "Ichki server xatosi"}
    )