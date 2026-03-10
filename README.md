# 🤖 Alone AI

> Aqlli AI yordamchi — chat, ovoz, rasm, agent va ko'p narsa

## 🚀 Tez boshlash

```bash
# 1. Klonlash
git clone https://github.com/yourname/alone-ai.git
cd alone-ai

# 2. .env yaratish
cp backend/.env.example backend/.env
# .env faylini tahrirlang

# 3. DB yaratish
python scripts/seed_db.py

# 4. Ishga tushirish
bash scripts/start-dev.sh
```

## 📁 Struktura

```
alone-ai/
├── backend/app/     # FastAPI backend
├── frontend/src/    # React frontend
├── infra/           # Docker, Nginx
└── scripts/         # Yordamchi skriptlar
```

## ⚙️ .env Kalitlar

| Kalit | Maqsad |
|-------|--------|
| `GROQ_API_KEY` | AI chat + STT |
| `ELEVENLABS_API_KEY` | Realistik TTS |
| `HUGGINGFACE_API_KEY` | Rasm generatsiya |
| `TAVILY_API_KEY` | Veb qidiruv |
| `STRIPE_SECRET_KEY` | To'lovlar |
| `JWT_SECRET` | Token |
| `EMAIL_USER/PASS` | Email |

## 🌐 API

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`
- API docs: `http://localhost:8000/docs`

## 📦 Planlar

| Plan | Narx | Xabar/kun | Rasm/kun |
|------|------|-----------|----------|
| Free | Bepul | 50 | 3 |
| Pro | 49,000 UZS | 500 | 20 |
| Premium | 99,000 UZS | ∞ | ∞ |

## 🛠️ Texnologiyalar

**Backend:** FastAPI, SQLite, Groq AI, Edge TTS, ElevenLabs

**Frontend:** React, Vite, Zustand, TailwindCSS, Framer Motion