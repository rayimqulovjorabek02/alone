#!/bin/bash
# scripts/start-dev.sh — Development ishga tushirish

echo "🚀 Alone AI Dev Server..."

# Backend
echo "📦 Backend..."
cd backend/app
pip install -r requirements.txt -q
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Frontend
echo "🎨 Frontend..."
cd ../../frontend
npm install -q
npm run dev &
FRONTEND_PID=$!

echo "✅ Backend: http://localhost:8000"
echo "✅ Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait