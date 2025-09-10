#!/bin/bash

# Novora Survey Platform - Development Server Startup Script

echo "🚀 Starting Novora Survey Platform Development Servers..."

# Function to check if a port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
}

# Function to start backend server
start_backend() {
    echo "📡 Starting Backend Server (FastAPI)..."
    cd backend
    source venv/bin/activate
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    echo "✅ Backend server started (PID: $BACKEND_PID)"
    cd ..
}

# Function to start frontend server
start_frontend() {
    echo "🎨 Starting Frontend Server (React/Vite)..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend server started (PID: $FRONTEND_PID)"
    cd ..
}

# Check if ports are available
if check_port 8000; then
    echo "⚠️  Port 8000 is already in use. Backend server may already be running."
else
    start_backend
fi

if check_port 3000; then
    echo "⚠️  Port 3000 is already in use. Frontend server may already be running."
else
    start_frontend
fi

echo ""
echo "🌐 Servers are starting up..."
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop servers
wait
