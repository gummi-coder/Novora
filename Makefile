.PHONY: seed dev-be dev-fe dev-full smoke-test

# Seed the database with sample data
seed:
	cd backend && source venv/bin/activate && python scripts/seed_base.py

# Start backend development server
dev-be:
	cd backend && source venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start frontend development server (connected mode)
dev-fe:
	cd frontend && npm run dev:connected

# Start frontend development server (mock mode)
dev-fe-mock:
	cd frontend && npm run dev:mock

# Start both frontend and backend
dev-full:
	@echo "Starting full development environment..."
	@make dev-be &
	@sleep 2
	@make seed
	@make dev-fe

# Run smoke test
smoke-test:
	@echo "Running smoke test..."
	@curl -sf http://localhost:8000/api/v1/health
	@echo "✅ Smoke test passed"

# Start development environment with smoke test
dev:
	@echo "Starting development environment..."
	@make dev-be &
	@BE_PID=$$!
	@sleep 2
	@make seed
	@npm run dev:connected &
	@FE_PID=$$!
	@make smoke-test
	@wait

# Install dependencies
install:
	@echo "Installing backend dependencies..."
	@cd backend && source venv/bin/activate && pip install -r requirements/base.txt
	@echo "Installing frontend dependencies..."
	@cd frontend && npm install

# Setup development environment
setup:
	@echo "Setting up development environment..."
	@make install
	@make seed
	@echo "✅ Development environment ready"

# Clean up
clean:
	@echo "Cleaning up..."
	@cd backend && rm -f novora.db
	@cd frontend && rm -rf dist node_modules/.vite
	@echo "✅ Cleanup complete"
