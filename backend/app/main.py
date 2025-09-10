"""
FastAPI application entry point for Novora Survey Platform MVP
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    app = FastAPI(
        title="Novora MVP Survey Platform API",
        description="Backend API for MVP survey management platform",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all origins for MVP
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health check endpoint
    @app.get("/health")
    async def health_check():
        """Basic health check endpoint"""
        return {
            "status": "healthy",
            "environment": "production",
            "version": "1.0.0",
            "message": "Novora MVP API is running"
        }

    # API health check endpoint
    @app.get("/api/v1/health")
    async def api_health_check():
        """API health check endpoint"""
        return {
            "status": "healthy",
            "api_version": "v1",
            "message": "Novora MVP API v1 is running"
        }

    # Root endpoint
    @app.get("/")
    async def root():
        """Root endpoint"""
        return {
            "message": "Welcome to Novora MVP API",
            "docs": "/docs",
            "health": "/health"
        }

    return app

# Create the FastAPI app
app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )