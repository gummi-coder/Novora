"""
Main API router with clean FastAPI endpoints
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, surveys, responses, analytics, admin, uploads, question_bank

api_router = APIRouter()

# Health check
@api_router.get("/health")
async def health_check():
    from app.core.config import settings
    from app.core.database import check_database_connection, check_redis_connection
    
    try:
        # Check database connection
        db_status = check_database_connection()
        
        # Check Redis connection
        redis_status = check_redis_connection()
        
        return {
            "status": "healthy" if db_status and redis_status else "degraded",
            "environment": settings.ENVIRONMENT,
            "version": settings.VERSION,
            "services": {
                "database": "connected" if db_status else "disconnected",
                "redis": "connected" if redis_status else "disconnected",
            },
            "timestamp": "2024-12-19T10:00:00Z"
        }
    except Exception as e:
        return {
            "status": "error",
            "environment": settings.ENVIRONMENT,
            "version": settings.VERSION,
            "error": str(e),
            "timestamp": "2024-12-19T10:00:00Z"
        }

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(surveys.router, prefix="/surveys", tags=["Surveys"])
api_router.include_router(responses.router, prefix="/responses", tags=["Responses"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(analytics.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["File Uploads"])
api_router.include_router(question_bank.router, prefix="/question-bank", tags=["Question Bank"])

# Import and include auto-pilot router
from app.api.v1.auto_pilot import router as auto_pilot_router
api_router.include_router(auto_pilot_router, prefix="/auto-pilot", tags=["Auto-Pilot"])

# Import and include production management router
from app.api.v1.production import router as production_router
api_router.include_router(production_router, prefix="/production", tags=["Production Management"])
