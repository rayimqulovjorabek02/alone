"""
backend/app/main.py — Alone AI FastAPI Backend
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="Alone AI API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://aloneai.uz"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _reg(module_name, prefix, tags):
    try:
        import importlib
        mod = importlib.import_module(f'routers.{module_name}')
        app.include_router(mod.router, prefix=prefix, tags=tags)
        print(f"✅ {prefix}")
    except Exception as e:
        print(f"⚠️  {prefix} yuklanmadi: {e}")

# Auth
_reg('auth',             '/api/auth',         ['Auth'])
_reg('auth_security',    '/api/auth',         ['Auth'])

# Chat
_reg('chat',             '/api/chat',         ['Chat'])
_reg('agent',            '/api/agent',        ['Agent'])

# Media
_reg('image',            '/api/image',        ['Image'])
_reg('voice',            '/api/voice',        ['Voice'])

# Foydalanuvchi
_reg('settings_router',  '/api/settings',     ['Settings'])
_reg('profile_security', '/api/profile',      ['Profile'])
_reg('notifications',    '/api/notifications',['Notifications'])
_reg('feedback',         '/api/feedback',     ['Feedback'])

# Kontent
_reg('file_analysis',    '/api/files',        ['Files'])
_reg('file_upload',      '/api/upload',       ['Upload'])
_reg('export',           '/api/export',       ['Export'])
_reg('code',             '/api/code',         ['Code'])
_reg('todo',             '/api/todo',         ['Todo'])
_reg('reminders',        '/api/reminder',     ['Reminders'])

# To'lov
_reg('payments',         '/api/payments',     ['Payments'])

# Admin
_reg('admin',            '/api/admin',        ['Admin'])
_reg('admin_stats',      '/api/admin-stats',  ['AdminStats'])
_reg('dashboard',        '/api/dashboard',    ['Dashboard'])

@app.get("/")
async def root():
    return {"status": "ok", "app": "Alone AI", "version": "2.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}