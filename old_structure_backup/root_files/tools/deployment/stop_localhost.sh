#!/bin/bash

# Novora Localhost Stop Script
echo "🛑 Stopping Novora Survey Platform..."

# Stop backend server
if [ -f ".backend_pid" ]; then
    BACKEND_PID=$(cat .backend_pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "🛑 Stopping backend server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        rm .backend_pid
    else
        echo "ℹ️  Backend server not running"
    fi
else
    echo "ℹ️  No backend PID file found"
fi

# Stop frontend server
if [ -f ".frontend_pid" ]; then
    FRONTEND_PID=$(cat .frontend_pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "🛑 Stopping frontend server (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        rm .frontend_pid
    else
        echo "ℹ️  Frontend server not running"
    fi
else
    echo "ℹ️  No frontend PID file found"
fi

# Kill any remaining processes on the ports
echo "🧹 Cleaning up any remaining processes..."

# Kill processes on port 8000
PIDS_8000=$(lsof -ti:8000 2>/dev/null)
if [ ! -z "$PIDS_8000" ]; then
    echo "🛑 Killing processes on port 8000: $PIDS_8000"
    kill -9 $PIDS_8000
fi

# Kill processes on port 3000
PIDS_3000=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$PIDS_3000" ]; then
    echo "🛑 Killing processes on port 3000: $PIDS_3000"
    kill -9 $PIDS_3000
fi

echo "✅ All servers stopped"
echo ""
echo "📝 To start again: ./start_localhost.sh"
