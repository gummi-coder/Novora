"""
Main API router with clean FastAPI endpoints
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, surveys, responses, analytics, admin, uploads, question_bank

api_router = APIRouter()

# Health check
@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "message": "Novora Survey Platform API - FastAPI Version",
        "version": "1.0.0"
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
