"""
backend/app/core/logger.py
Markazlashtirilgan logging tizimi

Barcha fayllar shu yerdan import qiladi:
  from core.logger import logger, sec_logger, get_logger
"""
import os
import logging
import logging.handlers
from pathlib import Path

# ── Log papkasi ───────────────────────────────────────────────
LOG_DIR = Path(__file__).resolve().parent.parent.parent / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_FORMAT = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def _setup_logger(name: str, filename: str, level: str = LOG_LEVEL) -> logging.Logger:
    """Logger yaratish — console + fayl."""
    log = logging.getLogger(name)

    # Ikki marta handler qo'shilmasin
    if log.handlers:
        return log

    log.setLevel(getattr(logging, level, logging.INFO))

    formatter = logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT)

    # Console handler
    console = logging.StreamHandler()
    console.setFormatter(formatter)
    log.addHandler(console)

    # Fayl handler — 5MB, 3 ta backup
    try:
        file_handler = logging.handlers.RotatingFileHandler(
            LOG_DIR / filename,
            maxBytes   = 5 * 1024 * 1024,  # 5MB
            backupCount = 3,
            encoding   = "utf-8",
        )
        file_handler.setFormatter(formatter)
        log.addHandler(file_handler)
    except Exception as e:
        log.warning(f"Log fayl yaratilmadi: {e}")

    return log


# ── Asosiy loggerlar ──────────────────────────────────────────
logger     = _setup_logger("alone-ai",          "app.log")
sec_logger = _setup_logger("alone-ai.security", "security.log")
db_logger  = _setup_logger("alone-ai.db",       "db.log")
ai_logger  = _setup_logger("alone-ai.ai",       "ai.log")


def get_logger(name: str) -> logging.Logger:
    """Modul uchun logger olish."""
    return _setup_logger(f"alone-ai.{name}", "app.log")