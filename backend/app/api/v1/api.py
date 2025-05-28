"""
Main API router with all migrated endpoints
"""
from fastapi import APIRouter

# Import migrated endpoints
try:
    from app.api.v1.endpoints import auth
    auth_available = True
except ImportError:
    auth_available = False

try:
    from app.api.v1.endpoints import surveys
    surveys_available = True
except ImportError:
    surveys_available = False

try:
    from app.api.v1.endpoints import responses
    responses_available = True
except ImportError:
    responses_available = False

try:
    from app.api.v1.endpoints import analytics
    analytics_available = True
except ImportError:
    analytics_available = False

api_router = APIRouter()

# Health check
@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "message": "Novora Survey Platform API",
        "endpoints": {
            "auth": auth_available,
            "surveys": surveys_available, 
            "responses": responses_available,
            "analytics": analytics_available
        }
    }

# Include available routers
if auth_available:
    api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])

if surveys_available:
    api_router.include_router(surveys.router, prefix="/surveys", tags=["surveys"])

if responses_available:
    api_router.include_router(responses.router, prefix="/responses", tags=["responses"])

if analytics_available:
    api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
