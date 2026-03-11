#!/usr/bin/env python3
"""
scripts/check_project.py — Loyiha fayllarini tekshirish
Ishga tushirishdan oldin barcha muhim fayllar mavjudligini tekshiradi.
"""
import os, sys

ROOT = os.path.join(os.path.dirname(__file__), '..')

RED   = '\033[0;31m'
GREEN = '\033[0;32m'
YEL   = '\033[1;33m'
NC    = '\033[0m'
BOLD  = '\033[1m'

ok = err = warn = 0

def check(path, label, required=True):
    global ok, err, warn
    full = os.path.join(ROOT, path)
    if os.path.exists(full):
        print(f"  {GREEN}✅{NC} {label}")
        ok += 1
    elif required:
        print(f"  {RED}❌{NC} {label}  ← YO'Q: {path}")
        err += 1
    else:
        print(f"  {YEL}⚠️ {NC} {label}  ← ixtiyoriy")
        warn += 1

print(f"\n{BOLD}🔍 Alone AI — Loyiha tekshiruvi{NC}\n")

# Backend
print(f"{BOLD}Backend:{NC}")
check("backend/.env",                     ".env fayl")
check("backend/data",                     "data/ papkasi")
check("backend/app/main.py",              "main.py")
check("backend/app/config.py",            "config.py")
check("backend/app/database.py",          "database.py")
check("backend/app/deps.py",              "deps.py")
check("backend/app/requirements.txt",     "requirements.txt")

print(f"\n{BOLD}Routerlar:{NC}")
routers = [
    "auth","auth_security","chat","agent","image_router","voice",
    "settings_router","profile_security","notifications","feedback",
    "file_analysis","file_upload","export","code","todo","reminders",
    "payments","admin","admin_stats","dashboard","dev_admin","health",
]
for r in routers:
    check(f"backend/app/routers/{r}.py", r)

print(f"\n{BOLD}Core modullar:{NC}")
cores = [
    "jwt","smart_ai","system_prompt","memory_engine","cache",
    "image_gen","search","email_sender","security","monitoring",
    "model_router","premium","file_reader","chunking","tool_runner",
    "tool_selector","tools","embeddings","vector_store",
    "prompt_security","response_filter","security_log","file_security",
    "rate_limiter","audit_log","ip_blacklist","two_factor",
]
for c in cores:
    check(f"backend/app/core/{c}.py", c)

print(f"\n{BOLD}Modellar:{NC}")
for m in ["user","message","reminder","todo","payment"]:
    check(f"backend/app/models/{m}.py", m)

print(f"\n{BOLD}Frontend:{NC}")
check("frontend/package.json",            "package.json")
check("frontend/src/App.jsx",             "App.jsx")
check("frontend/src/main.jsx",            "main.jsx")
check("frontend/node_modules",            "node_modules", required=False)

print(f"\n{BOLD}Sahifalar:{NC}")
pages = [
    "Login","Register","ForgotPassword","ResetCode","NewPassword",
    "Chat","Dashboard","ImageGen","Agent","Todo","Reminder",
    "FileAnalysis","Settings","Profile","Notifications","Premium",
    "Feedback","AdminPanel","AdminStats","DevPanel","TwoFactor",
]
for p in pages:
    check(f"frontend/src/pages/{p}.jsx", p, required=(p != "TwoFactor"))

print(f"\n{BOLD}Komponentlar:{NC}")
comps = [
    "layout/Layout","layout/Sidebar","layout/Header","layout/Footer",
    "chat/ChatWindow","chat/MessageItem","chat/ChatInput",
]
for c in comps:
    check(f"frontend/src/components/{c}.jsx", c)

# Xulosa
print(f"\n{'═'*40}")
print(f"  {GREEN}✅ Mavjud:{NC} {ok}")
print(f"  {RED}❌ Yo'q:{NC}   {err}")
print(f"  {YEL}⚠️  Ixtiyoriy:{NC} {warn}")
print(f"{'═'*40}\n")

if err == 0:
    print(f"{GREEN}{BOLD}🎉 Hammasi joyida! Ishga tushirishga tayyor.{NC}\n")
    sys.exit(0)
else:
    print(f"{RED}{BOLD}⛔ {err} ta muhim fayl yetishmayapti!{NC}")
    print(f"Yuqoridagi ❌ fayllarni to'ldiring.\n")
    sys.exit(1)