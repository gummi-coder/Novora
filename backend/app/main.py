"""
FastAPI application entry point for Novora Survey Platform
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import check_database_connection, check_redis_connection
from app.core.monitoring import monitoring_config, metrics_collector, health_checker, performance_monitor, log_request
from app.api.v1.api import api_router
import logging
import time

logger = logging.getLogger(__name__)

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for FastAPI application"""
    # Startup
    logger.info(f"Starting Novora API in {settings.ENVIRONMENT} mode")
    
    # Check initial health
    try:
        db_status = check_database_connection()
        redis_status = check_redis_connection()
        
        logger.info(f"Database connection: {'OK' if db_status else 'FAILED'}")
        logger.info(f"Redis connection: {'OK' if redis_status else 'FAILED'}")
        
        if not db_status:
            logger.error("Database connection failed on startup")
        if not redis_status:
            logger.warning("Redis connection failed on startup (optional)")
            
    except Exception as e:
        logger.error(f"Startup health check failed: {e}")
    
    # Start the auto-pilot scheduler in the background
    try:
        from app.services.auto_pilot_scheduler import auto_pilot_scheduler
        import asyncio
        asyncio.create_task(auto_pilot_scheduler.start())
        logger.info("Auto-pilot scheduler started")
    except Exception as e:
        logger.error(f"Failed to start auto-pilot scheduler: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Novora API")

def create_app() -> FastAPI:
    app = FastAPI(
        title="Novora Survey Platform API",
        description="Backend API for comprehensive survey management platform",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan
    )

    # CORS middleware with environment-aware configuration
    cors_origins = settings.BACKEND_CORS_ORIGINS
    
    # Add environment-specific origins
    if settings.is_development:
        cors_origins.extend([
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
        ])
    elif settings.is_production:
        # In production, only allow specific domains
        cors_origins = [
            "https://novora.com",
            "https://www.novora.com",
            "https://app.novora.com",
        ]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=[
            "Accept",
            "Accept-Language",
            "Content-Language",
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "X-App-Version",
            "X-Environment",
        ],
        expose_headers=["X-Total-Count", "X-Page-Count"],
        max_age=86400,  # 24 hours
    )

    # Include API router
    app.include_router(api_router, prefix="/api/v1")
    
    # Root health check
    @app.get("/health")
    async def root_health_check():
        """Basic health check endpoint"""
        return {
            "status": "healthy",
            "environment": settings.ENVIRONMENT,
            "version": settings.VERSION,
            "timestamp": "2024-12-19T10:00:00Z"
        }
    
    # Request monitoring middleware
    @app.middleware("http")
    async def monitor_requests(request: Request, call_next):
        """Monitor and log all HTTP requests"""
        start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Calculate response time
        response_time = time.time() - start_time
        
        # Log request details
        log_request(request, response_time, response.status_code)
        
        # Add performance headers
        response.headers["X-Response-Time"] = str(response_time)
        response.headers["X-Request-ID"] = str(hash(str(request.url)))
        
        return response
    
    @app.get("/api/v1/health/redis")
    async def redis_health_check():
        """Redis-specific health check"""
        try:
            redis_status = check_redis_connection()
            return {
                "status": "connected" if redis_status else "disconnected",
                "service": "redis",
                "timestamp": "2024-12-19T10:00:00Z"
            }
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            return {
                "status": "error",
                "service": "redis",
                "error": str(e),
                "timestamp": "2024-12-19T10:00:00Z"
            }
    
    # Error handlers
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request, exc):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.detail,
                "status_code": exc.status_code,
                "timestamp": "2024-12-19T10:00:00Z"
            }
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request, exc):
        logger.error(f"Unhandled exception: {exc}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "status_code": 500,
                "timestamp": "2024-12-19T10:00:00Z"
            }
        )
    

    
    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
