from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.base import User, Survey, Response
from app.api.deps import get_current_user
from pydantic import BaseModel
from typing import List, Optional
import secrets
import string

router = APIRouter()

class UserSurveyToken(BaseModel):
    user_id: int
    survey_id: int
    token: str
    is_used: bool = False
    created_at: str

class SurveyResponse(BaseModel):
    survey_id: int
    score: int
    comment: Optional[str] = None

@router.get("/surveys/user/{user_id}")
async def get_user_surveys(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all surveys for a specific user"""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this user's surveys")
    
    # Get user's surveys
    surveys = db.query(Survey).filter(Survey.user_id == user_id).all()
    
    return {
        "user_id": user_id,
        "surveys": [
            {
                "id": survey.id,
                "title": survey.title,
                "created_at": survey.created_at.isoformat(),
                "status": "active" if survey.is_active else "completed",
                "response_count": db.query(Response).filter(Response.survey_id == survey.id).count()
            }
            for survey in surveys
        ]
    }

@router.post("/surveys/{survey_id}/generate-token")
async def generate_survey_token(
    survey_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a unique token for a user's survey"""
    # Verify survey belongs to user
    survey = db.query(Survey).filter(
        Survey.id == survey_id,
        Survey.user_id == current_user.id
    ).first()
    
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    # Generate unique token: userId_surveyId_randomString
    random_string = ''.join(secrets.choices(string.ascii_letters + string.digits, k=12))
    token = f"{current_user.id}_{survey_id}_{random_string}"
    
    # Store token in survey (you might want a separate tokens table)
    survey.survey_token = token
    db.commit()
    
    from app.core.config import settings
    
    return {
        "survey_id": survey_id,
        "token": token,
        "survey_link": f"{settings.FRONTEND_URL}/survey/{token}",
        "expires_at": None  # Tokens don't expire for MVP
    }

@router.get("/survey/{token}")
async def get_survey_by_token(
    token: str,
    db: Session = Depends(get_db)
):
    """Get survey details by token (for anonymous access)"""
    # Parse token to get user_id and survey_id
    try:
        parts = token.split('_')
        if len(parts) != 3:
            raise HTTPException(status_code=400, detail="Invalid token format")
        
        user_id = int(parts[0])
        survey_id = int(parts[1])
        
        # Get survey
        survey = db.query(Survey).filter(
            Survey.id == survey_id,
            Survey.user_id == user_id,
            Survey.token == token
        ).first()
        
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        return {
            "survey_id": survey.id,
            "title": survey.title,
            "questions": survey.questions,  # You'll need to implement this
            "is_active": survey.is_active
        }
        
    except (ValueError, IndexError):
        raise HTTPException(status_code=400, detail="Invalid token format")

@router.post("/survey/{token}/respond")
async def submit_survey_response(
    token: str,
    response: SurveyResponse,
    db: Session = Depends(get_db)
):
    """Submit a survey response using token"""
    # Parse token to get user_id and survey_id
    try:
        parts = token.split('_')
        if len(parts) != 3:
            raise HTTPException(status_code=400, detail="Invalid token format")
        
        user_id = int(parts[0])
        survey_id = int(parts[1])
        
        # Verify survey exists and is active
        survey = db.query(Survey).filter(
            Survey.id == survey_id,
            Survey.user_id == user_id,
            Survey.token == token,
            Survey.is_active == True
        ).first()
        
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found or inactive")
        
        # Check if user already responded (optional - for MVP you might allow multiple responses)
        existing_response = db.query(Response).filter(
            Response.survey_id == survey_id,
            Response.token == token
        ).first()
        
        if existing_response:
            raise HTTPException(status_code=400, detail="Response already submitted")
        
        # Check submission limit based on company size
        current_submissions = db.query(Response).filter(
            Response.survey_id == survey_id
        ).count()
        
        if current_submissions >= survey.max_submissions:
            raise HTTPException(
                status_code=429, 
                detail=f"Survey is closed. Maximum submissions ({survey.max_submissions}) reached for company size of {survey.company_size} employees."
            )
        
        # Create new response
        new_response = Response(
            survey_id=survey_id,
            score=response.score,
            comment=response.comment,
            token=token,
            is_anonymous=True
        )
        
        db.add(new_response)
        db.commit()
        
        return {
            "message": "Response submitted successfully",
            "response_id": new_response.id
        }
        
    except (ValueError, IndexError):
        raise HTTPException(status_code=400, detail="Invalid token format")
