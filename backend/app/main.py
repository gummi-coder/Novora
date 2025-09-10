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

    # Try to include the full API router, fallback to basic health if it fails
    try:
        from app.api.v1.api import api_router
        app.include_router(api_router, prefix="/api/v1")
        logger.info("Full API router loaded successfully")
    except Exception as e:
        logger.warning(f"Failed to load full API router: {e}")
        logger.info("Using basic health endpoints only")

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

    return app

# Create the FastAPI app
app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )