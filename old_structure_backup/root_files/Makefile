# Novora Development Commands

.PHONY: help dev frontend backend test clean install

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start frontend development server
	@echo "🚀 Starting frontend development server..."
	cd frontend && npm run dev

frontend: dev ## Alias for dev command

backend: ## Start backend development server
	@echo "🐍 Starting backend development server..."
	cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

install: ## Install all dependencies
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install
	@echo "📦 Installing backend dependencies..."
	cd backend && pip install -r requirements.txt

test: ## Run all tests
	@echo "🧪 Running frontend tests..."
	cd frontend && npm test
	@echo "🧪 Running backend tests..."
	cd backend && pytest

clean: ## Clean build artifacts
	@echo "🧹 Cleaning build artifacts..."
	cd frontend && rm -rf dist node_modules/.cache
	cd backend && find . -type d -name "__pycache__" -exec rm -rf {} +

build: ## Build for production
	@echo "🏗️ Building frontend for production..."
	cd frontend && npm run build

status: ## Check project status
	@echo "📊 Project Status:"
	@echo "Frontend: $(shell cd frontend && npm run dev --silent 2>/dev/null && echo "✅ Running" || echo "❌ Not running")"
	@echo "Backend: $(shell curl -s http://localhost:8000/health >/dev/null 2>&1 && echo "✅ Running" || echo "❌ Not running")"
