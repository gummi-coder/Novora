#!/bin/bash

# Novora Localhost Startup Script
echo "🚀 Starting Novora Survey Platform..."

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Check if ports are available
echo "🔍 Checking ports..."
if ! check_port 8000; then
    echo "❌ Port 8000 (backend) is already in use. Please stop the existing server first."
    exit 1
fi

if ! check_port 3000; then
    echo "❌ Port 3000 (frontend) is already in use. Please stop the existing server first."
    exit 1
fi

echo "✅ Ports are available"

# Start backend server
echo "🔧 Starting backend server..."
cd backend
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/lib/python*/site-packages/fastapi" ]; then
    echo "📦 Installing backend dependencies..."
    pip install -r requirements/base.txt
    pip install PyJWT
fi

# Create test users if they don't exist
if [ ! -f "novora.db" ]; then
    echo "👤 Creating test users..."
    python create_simple_users.py
fi

# Start backend in background
echo "🚀 Starting backend server on http://localhost:8000"
nohup python simple_auth_server.py > server.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Test backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend failed to start"
    exit 1
fi

# Start frontend server
echo "🎨 Starting frontend server..."
cd ../frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend in background
echo "🚀 Starting frontend server on http://localhost:3000"
nohup npm run dev > client.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 10

# Test frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend failed to start"
    exit 1
fi

# Save PIDs for later cleanup
echo $BACKEND_PID > .backend_pid
echo $FRONTEND_PID > .frontend_pid

echo ""
echo "🎉 Novora Survey Platform is now running!"
echo ""
echo "📍 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🔐 Login Credentials:"
echo "   Admin: admin@novora.com / admin123"
echo "   Manager: manager@novora.com / manager123"
echo "   Owner: owner@novora.com / owner123"
echo ""
echo "📝 Logs:"
echo "   Backend: backend/server.log"
echo "   Frontend: frontend/client.log"
echo ""
echo "🛑 To stop servers: ./stop_localhost.sh"
echo ""

# Keep script running
wait
