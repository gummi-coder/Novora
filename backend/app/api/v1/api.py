"""
Main API router with clean FastAPI endpoints
"""
import os
from fastapi import APIRouter
from app.api.v1.endpoints import auth, surveys, responses, analytics, health, user_surveys
# Temporarily commented out for MVP - too many missing dependencies
# from app.api.v1.endpoints import admin, admin_dashboard, manager_dashboard, uploads, question_bank, exports, alerts, cache_management, missing_endpoints, survey_management, employee_management, settings_management, export_management
# Temporarily commented out due to missing dependencies
# from app.api.v1.endpoints import nlp_management
# Temporarily commented out settings due to missing schemas
# from app.api.v1.endpoints import settings

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

# Core MVP endpoints (always available)
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(surveys.router, prefix="/surveys", tags=["Surveys"])
api_router.include_router(responses.router, prefix="/responses", tags=["Responses"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(analytics.router, prefix="/dashboard", tags=["Dashboard"])
# api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])  # Temporarily disabled
api_router.include_router(health.router, tags=["Health & Monitoring"])
api_router.include_router(user_surveys.router, prefix="/user", tags=["User Surveys"])

# Feature-gated endpoints - Temporarily disabled for MVP
# if os.getenv("FEATURE_ADMIN", "false") == "true":
#     api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
#     api_router.include_router(admin_dashboard.router, prefix="/admin", tags=["Admin Dashboard"])
#     api_router.include_router(manager_dashboard.router, prefix="/manager", tags=["Manager Dashboard"])

# if os.getenv("FEATURE_ADVANCED", "false") == "true":
#     api_router.include_router(uploads.router, prefix="/uploads", tags=["File Uploads"])
#     api_router.include_router(question_bank.router, prefix="/question-bank", tags=["Question Bank"])
#     api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
#     api_router.include_router(cache_management.router, prefix="/cache", tags=["Cache Management"])
#     
#     # Include new management endpoints
#     api_router.include_router(survey_management.router, prefix="/surveys", tags=["Survey Management"])
#     api_router.include_router(employee_management.router, prefix="/employees", tags=["Employee & Team Management"])
#     api_router.include_router(settings_management.router, prefix="/settings", tags=["Settings Management"])

# if os.getenv("FEATURE_EXPORTS", "false") == "true":
#     api_router.include_router(exports.router, prefix="/exports", tags=["Exports"])
#     api_router.include_router(export_management.router, prefix="/exports", tags=["Export & Integration"])

# if os.getenv("FEATURE_INTEGRATIONS", "false") == "true":
#     # Include new integration endpoints
#     from app.api.v1.endpoints.integration_endpoints import router as integration_router
#     api_router.include_router(integration_router, prefix="/integrations", tags=["Integrations"])

# if os.getenv("FEATURE_NLP_SENTIMENT", "false") == "true":
#     api_router.include_router(nlp_management.router, prefix="/nlp", tags=["NLP Management"])

# if os.getenv("FEATURE_AUTOPILOT", "false") == "true":
#     # Import and include auto-pilot router
#     from app.api.v1.auto_pilot import router as auto_pilot_router
#     api_router.include_router(auto_pilot_router, prefix="/auto-pilot", tags=["Auto-Pilot"])

# if os.getenv("FEATURE_ADVANCED", "false") == "true":
#     # Include advanced analytics endpoints
#     from app.api.v1.endpoints.advanced_analytics_endpoints import router as advanced_analytics_router
#     api_router.include_router(advanced_analytics_router, prefix="/analytics", tags=["Advanced Analytics"])

# if os.getenv("FEATURE_PRO", "false") == "true":
#     # Import and include production management router
#     from app.api.v1.production import router as production_router
#     api_router.include_router(production_router, prefix="/production", tags=["Production Management"])

# Development/Testing endpoints (only in development)
# if os.getenv("ENVIRONMENT", "development") == "development":
#     api_router.include_router(missing_endpoints.router, tags=["Missing Endpoints - TODO"])
