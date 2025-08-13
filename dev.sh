#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Starting Novora Development Environment..."

# Start backend
echo "📡 Starting backend server..."
make dev-be &
BE_PID=$!

# Wait for backend to start
sleep 2

# Seed the database
echo "🌱 Seeding database..."
make seed

# Start frontend
echo "🎨 Starting frontend server..."
npm run dev:connected &
FE_PID=$!

# Wait a moment for services to start
sleep 3

# Run smoke test
echo "🧪 Running smoke test..."
curl -sf http://localhost:8000/api/v1/health
echo "✅ Smoke test passed"

echo ""
echo "🎉 Development environment ready!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait
