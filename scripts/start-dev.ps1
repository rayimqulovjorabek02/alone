#!/bin/bash
# scripts/start-dev.sh — Alone AI development ishga tushirish

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo ""
echo -e "${PURPLE}=================================${NC}"
echo -e "${PURPLE}      Alone AI Dev Server        ${NC}"
echo -e "${PURPLE}=================================${NC}"
echo ""

# Loyiha papkasiga otish
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"
echo -e "${BLUE}Papka: $PROJECT_ROOT${NC}"

# .env tekshirish
if [ ! -f "backend/.env" ]; then
echo -e "${YELLOW}backend/.env topilmadi...${NC}"
if [ -f "backend/.env.example" ]; then
cp "backend/.env.example" "backend/.env"
echo -e "${YELLOW}backend/.env yaratildi. Toldiringen!${NC}"
fi
fi

# Python tekshirish
if ! command -v python3 > /dev/null 2>&1; then
echo -e "${RED}Python3 topilmadi!${NC}"
exit 1
fi

# Virtual environment
echo ""
echo -e "${BLUE}Python muhiti tekshirilmoqda...${NC}"

if [ ! -d "backend/venv" ]; then
echo -e "${YELLOW}Virtual environment yaratilmoqda...${NC}"
python3 -m venv backend/venv
fi

source backend/venv/bin/activate
echo -e "${GREEN}Virtual environment faol${NC}"

# Backend kutubxonalar
echo ""
echo -e "${BLUE}Backend kutubxonalar ornatilmoqda...${NC}"
pip install -r backend/app/requirements.txt -q --no-warn-script-location
echo -e "${GREEN}Backend kutubxonalar tayyor${NC}"

# Database init
echo ""
echo -e "${BLUE}Database tekshirilmoqda...${NC}"
mkdir -p backend/data

python3 backend/app/db_init.py
echo -e "${GREEN}Database tayyor${NC}"

# Node.js tekshirish
echo ""
echo -e "${BLUE}Node.js tekshirilmoqda...${NC}"

if ! command -v node > /dev/null 2>&1; then
echo -e "${RED}Node.js topilmadi! https://nodejs.org${NC}"
exit 1
fi

echo -e "${GREEN}Node.js $(node -v)${NC}"

if [ ! -d "frontend/node_modules" ]; then
echo -e "${YELLOW}npm install bajarilmoqda...${NC}"
cd frontend
npm install
cd "$PROJECT_ROOT"
fi

echo -e "${GREEN}Frontend tayyor${NC}"

# Backend ishga tushirish
echo ""
echo -e "${BLUE}Backend port 8000 da ishga tushirilmoqda...${NC}"

cd backend/app
uvicorn main:app --reload --host 0.0.0.0 --port 8000 --log-level info &
BACKEND_PID=$!
cd "$PROJECT_ROOT"

# Backend tayyor bolishini kutish
echo -e "${YELLOW}Backend tayyor bolishi kutilmoqda...${NC}"
COUNTER=0
READY=0

while [ $COUNTER -lt 15 ]; do
sleep 1
COUNTER=$((COUNTER + 1))
if curl -sf "http://localhost:8000/health" > /dev/null 2>&1; then
READY=1
break
fi
done

if [ $READY -eq 1 ]; then
echo -e "${GREEN}Backend tayyor!${NC}"
else
echo -e "${YELLOW}Backend hali ishga tushmagan, davom etilmoqda...${NC}"
fi

# Frontend ishga tushirish
echo ""
echo -e "${BLUE}Frontend port 5173 da ishga tushirilmoqda...${NC}"

cd frontend
npm run dev -- --host &
FRONTEND_PID=$!
cd "$PROJECT_ROOT"

sleep 2

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  Alone AI muvaffaqiyatli ishga tushdi${NC}"
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  Frontend : http://localhost:5173    ${NC}"
echo -e "${GREEN}  Backend  : http://localhost:8000    ${NC}"
echo -e "${GREEN}  API Docs : http://localhost:8000/api/docs ${NC}"
echo -e "${GREEN}  Toxtatish: Ctrl+C                   ${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

# Tozalash
cleanup() {
    echo ""
    echo -e "${YELLOW}Serverlar toxtatilmoqda...${NC}"
    kill "$BACKEND_PID" 2>/dev/null
    kill "$FRONTEND_PID" 2>/dev/null
    echo -e "${GREEN}Toxtatildi. Xayr!${NC}"
    exit 0
}

trap cleanup INT TERM
wait