"""
routers/settings_router.py — Foydalanuvchi sozlamalari
Frontend: /api/settings/
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from core.jwt import get_current_user
from database import get_db
from settings import PLANS

router = APIRouter()

class SettingsUpdate(BaseModel):
    name:           Optional[str]   = None
    birthday:       Optional[str]   = None
    profession:     Optional[str]   = None
    avatar:         Optional[str]   = None
    theme:          Optional[str]   = None
    language:       Optional[str]   = None
    animations:     Optional[bool]  = None
    compact_mode:   Optional[bool]  = None
    ai_style:       Optional[str]   = None
    temperature:    Optional[float] = None
    memory_enabled: Optional[bool]  = None
    auto_voice:     Optional[bool]  = None
    web_search:     Optional[bool]  = None

EXTRA_COLS = {
    "birthday":     "TEXT DEFAULT \'\'" ,
    "profession":   "TEXT DEFAULT \'\'" ,
    "avatar":       "TEXT DEFAULT \'🧑\'",
    "animations":   "INTEGER DEFAULT 1" ,
    "compact_mode": "INTEGER DEFAULT 0" ,
    "temperature":  "REAL DEFAULT 0.7"  ,
    "memory_enabled":"INTEGER DEFAULT 1",
    "auto_voice":   "INTEGER DEFAULT 0" ,
    "web_search":   "INTEGER DEFAULT 0" ,
}
BOOL_COLS = {"animations","compact_mode","memory_enabled","auto_voice","web_search"}

def _migrate(conn):
    cols = {r[1] for r in conn.execute("PRAGMA table_info(settings)").fetchall()}
    for col, td in EXTRA_COLS.items():
        if col not in cols:
            conn.execute(f"ALTER TABLE settings ADD COLUMN {col} {td}")

def _load(conn, user_id) -> dict:
    _migrate(conn)
    cols = [r[1] for r in conn.execute("PRAGMA table_info(settings)").fetchall()]
    row  = conn.execute(f"SELECT {', '.join(cols)} FROM settings WHERE user_id=?", (user_id,)).fetchone()
    if not row:
        return {"name":"Foydalanuvchi","theme":"dark","language":"uz","ai_style":"friendly",
                "avatar":"🧑","temperature":0.7,"memory_enabled":True,"auto_voice":False,
                "web_search":False,"animations":True,"compact_mode":False}
    d = dict(zip(cols, row))
    for k in BOOL_COLS:
        if k in d: d[k] = bool(d[k])
    return d

@router.get("/")
def get_settings(user=Depends(get_current_user)):
    with get_db() as conn:
        s = _load(conn, user["id"])
        row = conn.execute("SELECT plan FROM subscriptions WHERE user_id=?", (user["id"],)).fetchone()
        s["plan"] = row["plan"] if row else "free"
    return s

@router.put("/")
def update_settings(body: SettingsUpdate, user=Depends(get_current_user)):
    with get_db() as conn:
        _migrate(conn)
        d = body.dict(exclude_none=True)
        if not d:
            return _load(conn, user["id"])
        fields = []
        vals   = []
        for k, v in d.items():
            fields.append(f"{k}=?")
            vals.append(int(v) if k in BOOL_COLS else v)
        vals.append(user["id"])
        conn.execute(f"UPDATE settings SET {', '.join(fields)} WHERE user_id=?", vals)
        s = _load(conn, user["id"])
        row = conn.execute("SELECT plan FROM subscriptions WHERE user_id=?", (user["id"],)).fetchone()
        s["plan"] = row["plan"] if row else "free"
    return s

@router.get("/plans")
def get_plans(_user=Depends(get_current_user)):
    return PLANS