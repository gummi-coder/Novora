"""
Survey management endpoints for FastAPI
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.base import Survey, Question, User, Response, Answer
from app.api.deps import get_current_user

router = APIRouter()

class QuestionCreate(BaseModel):
    text: str
    type: str  # text, multiple_choice, rating, etc.
    required: bool = False
    order: int = 0
    options: Optional[dict] = None
    allow_comments: bool = False

class SurveyCreate(BaseModel):
    title: str
    description: Optional[str] = None
    is_anonymous: bool = True
    allow_comments: bool = False
    reminder_frequency: Optional[str] = None
    category: str = "general"
    questions: List[QuestionCreate] = []

class SurveyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None  # draft, active, closed
    is_anonymous: Optional[bool] = None
    allow_comments: Optional[bool] = None
    reminder_frequency: Optional[str] = None
    category: Optional[str] = None

class SurveyResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    creator_id: int
    status: str
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    is_anonymous: bool
    allow_comments: bool
    reminder_frequency: Optional[str]
    category: str
    created_at: datetime
    updated_at: datetime
    questions: List[dict] = []
    response_count: int = 0

    class Config:
        from_attributes = True

class AnswerSubmit(BaseModel):
    question_id: int
    value: str
    comment: Optional[str] = None

class ResponseSubmit(BaseModel):
    answers: List[AnswerSubmit]
    completed: bool = True

@router.get("/", response_model=List[SurveyResponse])
async def get_surveys(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all surveys for the current user"""
    surveys = db.query(Survey).filter(
        Survey.creator_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return [survey.to_dict() for survey in surveys]

@router.post("/", response_model=SurveyResponse)
async def create_survey(
    survey_data: SurveyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new survey"""
    # Create survey
    survey = Survey(
        title=survey_data.title,
        description=survey_data.description,
        creator_id=current_user.id,
        is_anonymous=survey_data.is_anonymous,
        allow_comments=survey_data.allow_comments,
        reminder_frequency=survey_data.reminder_frequency,
        category=survey_data.category,
        status="draft"
    )
    
    db.add(survey)
    db.commit()
    db.refresh(survey)
    
    # Create questions
    for i, question_data in enumerate(survey_data.questions):
        question = Question(
            survey_id=survey.id,
            text=question_data.text,
            type=question_data.type,
            required=question_data.required,
            order=question_data.order or i,
            options=question_data.options,
            allow_comments=question_data.allow_comments
        )
        db.add(question)
    
    db.commit()
    db.refresh(survey)
    
    return survey.to_dict()

@router.get("/{survey_id}", response_model=SurveyResponse)
async def get_survey(
    survey_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific survey by ID"""
    survey = db.query(Survey).filter(
        Survey.id == survey_id,
        Survey.creator_id == current_user.id
    ).first()
    
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    # Get questions for the survey
    questions = db.query(Question).filter(
        Question.survey_id == survey_id
    ).order_by(Question.order).all()
    
    # Get response count
    response_count = db.query(Response).filter(
        Response.survey_id == survey_id
    ).count()
    
    survey_dict = survey.to_dict()
    survey_dict['questions'] = [question.to_dict() for question in questions]
    survey_dict['response_count'] = response_count
    
    return survey_dict

@router.get("/{survey_id}/public")
async def get_survey_public(
    survey_id: int,
    db: Session = Depends(get_db)
):
    """Get a survey for public response (no authentication required)"""
    survey = db.query(Survey).filter(
        Survey.id == survey_id,
        Survey.status == "active"  # Only active surveys can be responded to
    ).first()
    
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found or not active")
    
    # Get questions for the survey
    questions = db.query(Question).filter(
        Question.survey_id == survey_id
    ).order_by(Question.order).all()
    
    return {
        "id": survey.id,
        "title": survey.title,
        "description": survey.description,
        "is_anonymous": survey.is_anonymous,
        "allow_comments": survey.allow_comments,
        "questions": [question.to_dict() for question in questions]
    }

@router.post("/{survey_id}/responses")
async def submit_survey_response(
    survey_id: int,
    response_data: ResponseSubmit,
    db: Session = Depends(get_db)
):
    """Submit a survey response (no authentication required)"""
    # Check if survey exists and is active
    survey = db.query(Survey).filter(
        Survey.id == survey_id,
        Survey.status == "active"
    ).first()
    
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found or not active")
    
    # Create response
    response = Response(
        survey_id=survey_id,
        user_id=None,  # Anonymous response
        completed=response_data.completed
    )
    
    db.add(response)
    db.commit()
    db.refresh(response)
    
    # Create answers
    for answer_data in response_data.answers:
        answer = Answer(
            response_id=response.id,
            question_id=answer_data.question_id,
            value=answer_data.value,
            comment=answer_data.comment
        )
        db.add(answer)
    
    db.commit()
    
    return {
        "message": "Response submitted successfully",
        "response_id": response.id
    }

@router.put("/{survey_id}", response_model=SurveyResponse)
async def update_survey(
    survey_id: int,
    survey_data: SurveyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a survey"""
    survey = db.query(Survey).filter(
        Survey.id == survey_id,
        Survey.creator_id == current_user.id
    ).first()
    
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )
    
    # Update fields
    update_data = survey_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(survey, field, value)
    
    survey.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(survey)
    
    return survey.to_dict()

@router.delete("/{survey_id}")
async def delete_survey(
    survey_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a survey"""
    survey = db.query(Survey).filter(
        Survey.id == survey_id,
        Survey.creator_id == current_user.id
    ).first()
    
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )
    
    db.delete(survey)
    db.commit()
    
    return {"message": f"Survey {survey_id} deleted successfully"}

@router.post("/{survey_id}/activate")
async def activate_survey(
    survey_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Activate a survey (change status from draft to active)"""
    survey = db.query(Survey).filter(
        Survey.id == survey_id,
        Survey.creator_id == current_user.id
    ).first()
    
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )
    
    if survey.status != "draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft surveys can be activated"
        )
    
    survey.status = "active"
    survey.start_date = datetime.utcnow()
    survey.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": f"Survey {survey_id} activated successfully"}

@router.post("/{survey_id}/close")
async def close_survey(
    survey_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Close a survey (change status to closed)"""
    survey = db.query(Survey).filter(
        Survey.id == survey_id,
        Survey.creator_id == current_user.id
    ).first()
    
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )
    
    if survey.status not in ["draft", "active"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Survey is already closed"
        )
    
    survey.status = "closed"
    survey.end_date = datetime.utcnow()
    survey.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": f"Survey {survey_id} closed successfully"}
