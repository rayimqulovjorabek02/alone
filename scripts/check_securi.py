#!/usr/bin/env python3
"""
scripts/check_security.py
Loyiha xavfsizligini tekshirish skripti
Ishlatish: python scripts/check_security.py
"""
import os
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
BACKEND = ROOT / "backend"

PASS = "✅"
WARN = "⚠️ "
FAIL = "❌"

issues = []
warnings = []

print("=" * 55)
print("  Alone AI — Xavfsizlik tekshiruvi")
print("=" * 55)

# 1. .env mavjudligi
env_file = BACKEND / ".env"
if env_file.exists():
    print(f"{PASS} .env fayl mavjud")
    env = dict(
        line.split("=", 1)
        for line in env_file.read_text(encoding="utf-8-sig").splitlines()
        if "=" in line and not line.startswith("#")
    )
else:
    print(f"{FAIL} .env fayl topilmadi! .env.example dan nusxa oling.")
    sys.exit(1)

# 2. JWT_SECRET kuchi
jwt = env.get("JWT_SECRET", "")
weak = {"alone-ai-secret-CHANGE-THIS", "your-super-secret-key-change-this", "secret", ""}
if not jwt or jwt in weak:
    issues.append(".env: JWT_SECRET bo'sh yoki zaif (openssl rand -hex 32)")
elif len(jwt) < 32:
    warnings.append(f".env: JWT_SECRET qisqa ({len(jwt)} belgi, kamida 32 kerak)")
else:
    print(f"{PASS} JWT_SECRET: {len(jwt)} belgi ({PASS if len(jwt) >= 64 else WARN + 'kamida 64 tavsiya'})")

# 3. AI kalitlar
groq = env.get("GROQ_API_KEY", "")
gemini = env.get("GEMINI_API_KEY", "")
openai_ = env.get("OPENAI_API_KEY", "")
if not groq and not gemini and not openai_:
    issues.append(".env: AI API key(lar) yo'q!")
else:
    active = [k for k, v in {"GROQ": groq, "GEMINI": gemini, "OPENAI": openai_}.items() if v]
    print(f"{PASS} AI kalitlar: {', '.join(active)}")

# 4. DB_PATH
db_path = env.get("DB_PATH", "")
if "Users" in db_path or "\\" in db_path:
    warnings.append(f".env: DB_PATH Windows absolut yo'li! ./data/alone.db ishlating")
else:
    print(f"{PASS} DB_PATH: {db_path or '(default)'}")

# 5. EMAIL parol App Password ekanligini tekshirish
email_pass = env.get("EMAIL_PASS", "")
if email_pass and " " not in email_pass and len(email_pass) < 12 and email_pass.isalpha() is False:
    warnings.append(".env: EMAIL_PASS Gmail App Password emas ko'rinadi (16 harfli parol oling)")

# 6. DEBUG holati
if env.get("DEBUG", "false").lower() == "true":
    warnings.append(".env: DEBUG=true — production da o'chiring!")
else:
    print(f"{PASS} DEBUG=false")

# 7. .gitignore tekshiruv
gitignore = ROOT / ".gitignore"
if gitignore.exists():
    content = gitignore.read_text()
    if ".env" in content:
        print(f"{PASS} .gitignore: .env ignore qilingan")
    else:
        issues.append(".gitignore: .env qo'shing!")
else:
    issues.append(".gitignore fayl topilmadi!")

# 8. .env git history da yo'qligini tekshirish
import subprocess
result = subprocess.run(
    ["git", "log", "--all", "--full-history", "--", "backend/.env"],
    cwd=ROOT, capture_output=True, text=True
)
if result.stdout.strip():
    issues.append("GIT: backend/.env git tarixida topildi! Kalitlarni almashtiring!")
else:
    print(f"{PASS} .env git tarixida yo'q")

# Natijalar
print()
if warnings:
    print("Ogohlantirishlar:")
    for w in warnings:
        print(f"  {WARN} {w}")

if issues:
    print("\nMuammolar (darhol tuzating):")
    for i in issues:
        print(f"  {FAIL} {i}")
    print()
    sys.exit(1)
else:
    print(f"\n{PASS} Asosiy xavfsizlik tekshiruvlari muvaffaqiyatli!")