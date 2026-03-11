"""
backend/app/routers/health.py — Server health check endpoint
"""
import os
import time
import sqlite3
import psutil
from fastapi import APIRouter, Depends
from core.jwt import get_current_user
from config import DB_PATH

router = APIRouter(prefix="/api/health", tags=["health"])

START_TIME = time.time()


def _db_ok() -> bool:
    try:
        with sqlite3.connect(DB_PATH, timeout=3) as db:
            db.execute("SELECT 1")
        return True
    except Exception:
        return False


def _disk_info() -> dict:
    try:
        stat = os.statvfs('/')
        total = stat.f_blocks * stat.f_frsize
        free  = stat.f_bfree  * stat.f_frsize
        used  = total - free
        return {
            "total_gb": round(total / 1e9, 1),
            "used_gb":  round(used  / 1e9, 1),
            "free_gb":  round(free  / 1e9, 1),
            "percent":  round(used / total * 100, 1),
        }
    except Exception:
        return {}


@router.get("")
async def health_check():
    """Ommaviy health check — load balancer uchun."""
    db_ok = _db_ok()
    return {
        "status":   "ok" if db_ok else "degraded",
        "db":       "ok" if db_ok else "error",
        "uptime_s": int(time.time() - START_TIME),
        "version":  "2.0.0",
    }


@router.get("/detailed")
async def detailed_health(user=Depends(get_current_user)):
    """Batafsil holat — faqat adminlar uchun."""
    if not user.get("is_admin"):
        return {"status": "ok"}

    db_ok = _db_ok()

    try:
        mem  = psutil.virtual_memory()
        cpu  = psutil.cpu_percent(interval=0.1)
        disk = _disk_info()
    except Exception:
        mem  = None
        cpu  = None
        disk = {}

    # DB hajmi
    try:
        db_size_mb = round(os.path.getsize(DB_PATH) / 1e6, 2)
    except Exception:
        db_size_mb = 0

    return {
        "status":   "ok" if db_ok else "degraded",
        "uptime_s": int(time.time() - START_TIME),
        "version":  "2.0.0",
        "db": {
            "status":  "ok" if db_ok else "error",
            "size_mb": db_size_mb,
        },
        "memory": {
            "total_mb":   round(mem.total   / 1e6) if mem else None,
            "used_mb":    round(mem.used    / 1e6) if mem else None,
            "percent":    mem.percent              if mem else None,
        },
        "cpu_percent": cpu,
        "disk":        disk,
    }


@router.get("/ping")
async def ping():
    return {"pong": True, "ts": time.time()}