"""
backend/app/core/audit_log.py — Barcha muhim amallarni qayd etish
"""
import sqlite3
import json
import time
from datetime import datetime
from typing import Optional
from config import DB_PATH


def init_audit_table():
    """Audit log jadvalini yaratish."""
    with sqlite3.connect(DB_PATH) as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS audit_log (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp   REAL    NOT NULL,
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
        """)
        db.execute("CREATE INDEX IF NOT EXISTS idx_audit_user   ON audit_log(user_id)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_audit_time   ON audit_log(timestamp)")
        db.commit()


def log_action(
    action:      str,
    user_id:     Optional[int] = None,
    ip:          Optional[str] = None,
    resource:    Optional[str] = None,
    resource_id: Optional[str] = None,
    old_value:   Optional[dict] = None,
    new_value:   Optional[dict] = None,
    status:      str = "success",
    details:     Optional[str] = None,
    user_agent:  Optional[str] = None,
):
    """Amal qayd etish."""
    try:
        with sqlite3.connect(DB_PATH) as db:
            db.execute("""
                INSERT INTO audit_log
                  (timestamp, user_id, ip, action, resource, resource_id,
                   old_value, new_value, status, details, user_agent)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                time.time(),
                user_id,
                ip,
                action,
                resource,
                str(resource_id) if resource_id else None,
                json.dumps(old_value, ensure_ascii=False) if old_value else None,
                json.dumps(new_value, ensure_ascii=False) if new_value else None,
                status,
                details,
                user_agent,
            ))
            db.commit()
    except Exception as e:
        print(f"Audit log xato: {e}")


def get_logs(
    user_id:  Optional[int] = None,
    action:   Optional[str] = None,
    status:   Optional[str] = None,
    limit:    int = 100,
    offset:   int = 0,
    days:     int = 30,
) -> list[dict]:
    """Audit loglarini olish."""
    since = time.time() - days * 86400
    query = "SELECT * FROM audit_log WHERE timestamp > ?"
    params: list = [since]

    if user_id: query += " AND user_id = ?";  params.append(user_id)
    if action:  query += " AND action = ?";   params.append(action)
    if status:  query += " AND status = ?";   params.append(status)

    query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
    params += [limit, offset]

    with sqlite3.connect(DB_PATH) as db:
        db.row_factory = sqlite3.Row
        rows = db.execute(query, params).fetchall()
        return [dict(r) for r in rows]


def get_audit_summary(days: int = 7) -> dict:
    """Qisqacha statistika."""
    since = time.time() - days * 86400
    with sqlite3.connect(DB_PATH) as db:
        total   = db.execute("SELECT COUNT(*) FROM audit_log WHERE timestamp > ?", (since,)).fetchone()[0]
        failed  = db.execute("SELECT COUNT(*) FROM audit_log WHERE timestamp > ? AND status='failed'", (since,)).fetchone()[0]
        logins  = db.execute("SELECT COUNT(*) FROM audit_log WHERE timestamp > ? AND action='login'", (since,)).fetchone()[0]
        by_act  = db.execute("""
            SELECT action, COUNT(*) as cnt FROM audit_log
            WHERE timestamp > ? GROUP BY action ORDER BY cnt DESC LIMIT 10
        """, (since,)).fetchall()
        return {
            "total":        total,
            "failed":       failed,
            "logins":       logins,
            "by_action":    [{"action": r[0], "count": r[1]} for r in by_act],
            "period_days":  days,
        }


# Tezkor yordamchi funksiyalar
def log_login(user_id: int, ip: str, success: bool, details: str = ""):
    log_action("login", user_id=user_id, ip=ip,
                status="success" if success else "failed", details=details)

def log_logout(user_id: int, ip: str):
    log_action("logout", user_id=user_id, ip=ip)

def log_register(user_id: int, ip: str, email: str):
    log_action("register", user_id=user_id, ip=ip,
                resource="user", resource_id=str(user_id), details=email)

def log_plan_change(admin_id: int, target_id: int, old_plan: str, new_plan: str):
    log_action("plan_change", user_id=admin_id,
                resource="user", resource_id=str(target_id),
                old_value={"plan": old_plan}, new_value={"plan": new_plan})

def log_user_block(admin_id: int, target_id: int, blocked: bool):
    log_action("user_block" if blocked else "user_unblock",
                user_id=admin_id, resource="user", resource_id=str(target_id))

def log_failed_login(email: str, ip: str):
    log_action("login_failed", ip=ip, status="failed", details=email)