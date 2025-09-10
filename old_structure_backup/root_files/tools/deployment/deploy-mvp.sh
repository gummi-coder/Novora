#!/bin/bash

# MVP Deployment Script
# Deploys the MVP-AOBI build profile

set -e

echo "🚀 Deploying Novora MVP..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
MVP_ENV="mvp"

echo -e "${YELLOW}📦 Building MVP Frontend...${NC}"
cd "$FRONTEND_DIR"

# Check if .env.mvp exists
if [ ! -f ".env.mvp" ]; then
    echo -e "${RED}❌ .env.mvp not found in frontend directory${NC}"
    exit 1
fi

# Build MVP frontend
echo "Building with MVP profile..."
npm run build:mvp

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend MVP build successful${NC}"
else
    echo -e "${RED}❌ Frontend MVP build failed${NC}"
    exit 1
fi

cd ..

echo -e "${YELLOW}🔧 Building MVP Backend...${NC}"
cd "$BACKEND_DIR"

# Check if .env.mvp exists
if [ ! -f ".env.mvp" ]; then
    echo -e "${RED}❌ .env.mvp not found in backend directory${NC}"
    exit 1
fi

# Load MVP environment
export $(cat .env.mvp | xargs)

# Start backend with MVP profile
echo "Starting backend with MVP profile..."
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Test backend health
echo "Testing backend health..."
curl -f http://localhost:8000/api/v1/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

cd ..

echo -e "${YELLOW}🧪 Running MVP Smoke Test...${NC}"
python3 ../testing/mvp-smoke-test.py

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ MVP smoke test passed${NC}"
else
    echo -e "${RED}❌ MVP smoke test failed${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo -e "${GREEN}🎉 MVP Deployment Successful!${NC}"
echo ""
echo "📊 MVP Features Enabled:"
echo "  ✅ Basic Survey Creation"
echo "  ✅ Survey Response Collection"
echo "  ✅ Dashboard Analytics"
echo "  ✅ Alert System"
echo "  ✅ ENPS Integration"
echo ""
echo "🚫 MVP Features Disabled:"
echo "  ❌ Advanced Analytics"
echo "  ❌ Photo Surveys"
echo "  ❌ Auto-Pilot"
echo "  ❌ Admin Dashboard"
echo "  ❌ Export Features"
echo "  ❌ Integrations"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "To stop the backend: kill $BACKEND_PID"
