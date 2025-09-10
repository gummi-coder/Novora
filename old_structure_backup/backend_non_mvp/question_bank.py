"""
Question Bank API endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.advanced import Metric, QuestionBank
from app.models.base import User
from app.api.deps import get_current_user

router = APIRouter()

# Public endpoints for survey builder (no authentication required)
@router.get("/public/metrics")
def get_metrics_public(
    db: Session = Depends(get_db),
    include_core_only: bool = Query(False, description="Only return core metrics")
):
    """Get all metrics (public endpoint for survey builder)"""
    query = db.query(Metric).order_by(Metric.display_order)
    
    if include_core_only:
        query = query.filter(Metric.is_core == True)
    
    metrics = query.all()
    return [
        {
            "id": metric.id,
            "name": metric.name,
            "category": metric.category,
            "description": metric.description,
            "is_core": metric.is_core,
            "display_order": metric.display_order
        }
        for metric in metrics
    ]

@router.get("/public/questions")
def get_questions_public(
    db: Session = Depends(get_db),
    metric_id: Optional[int] = Query(None, description="Filter by metric ID"),
    category: Optional[str] = Query(None, description="Filter by metric category"),
    active_only: bool = Query(True, description="Only return active questions"),
    language: str = Query('en', description="Language for question text")
):
    """Get questions with optional filtering (public endpoint for survey builder)"""
    query = db.query(QuestionBank).join(Metric)
    
    if metric_id:
        query = query.filter(QuestionBank.metric_id == metric_id)
    
    if category:
        query = query.filter(Metric.category == category)
    
    if active_only:
        query = query.filter(QuestionBank.active == True)
    
    questions = query.order_by(Metric.display_order, QuestionBank.variation_order).all()
    
    return [
        {
            "id": q.id,
            "metric_id": q.metric_id,
            "metric_name": q.metric.name,
            "metric_category": q.metric.category,
            "question_text": q.get_question_text(language),
            "variation_order": q.variation_order,
            "sensitive": q.sensitive,
            "reverse_scored": q.reverse_scored,
            "active": q.active
        }
        for q in questions
    ]

# Original authenticated endpoints
@router.get("/metrics")
def get_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    include_core_only: bool = Query(False, description="Only return core metrics")
):
    """Get all metrics"""
    query = db.query(Metric).order_by(Metric.display_order)
    
    if include_core_only:
        query = query.filter(Metric.is_core == True)
    
    metrics = query.all()
    return [
        {
            "id": metric.id,
            "name": metric.name,
            "category": metric.category,
            "description": metric.description,
            "is_core": metric.is_core,
            "display_order": metric.display_order
        }
        for metric in metrics
    ]

@router.get("/metrics/{metric_id}")
def get_metric(
    metric_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific metric with its questions"""
    metric = db.query(Metric).filter(Metric.id == metric_id).first()
    if not metric:
        raise HTTPException(status_code=404, detail="Metric not found")
    
    questions = db.query(QuestionBank).filter(
        QuestionBank.metric_id == metric_id,
        QuestionBank.active == True
    ).order_by(QuestionBank.variation_order).all()
    
    return {
        "id": metric.id,
        "name": metric.name,
        "category": metric.category,
        "description": metric.description,
        "is_core": metric.is_core,
        "display_order": metric.display_order,
        "questions": [
            {
                "id": q.id,
                "question_text": q.get_question_text('en'),
                "variation_order": q.variation_order,
                "sensitive": q.sensitive,
                "reverse_scored": q.reverse_scored
            }
            for q in questions
        ]
    }

@router.get("/questions")
def get_questions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    metric_id: Optional[int] = Query(None, description="Filter by metric ID"),
    category: Optional[str] = Query(None, description="Filter by metric category"),
    active_only: bool = Query(True, description="Only return active questions"),
    language: str = Query('en', description="Language for question text")
):
    """Get questions with optional filtering"""
    query = db.query(QuestionBank).join(Metric)
    
    if metric_id:
        query = query.filter(QuestionBank.metric_id == metric_id)
    
    if category:
        query = query.filter(Metric.category == category)
    
    if active_only:
        query = query.filter(QuestionBank.active == True)
    
    questions = query.order_by(Metric.display_order, QuestionBank.variation_order).all()
    
    return [
        {
            "id": q.id,
            "metric_id": q.metric_id,
            "metric_name": q.metric.name,
            "metric_category": q.metric.category,
            "question_text": q.get_question_text(language),
            "variation_order": q.variation_order,
            "sensitive": q.sensitive,
            "reverse_scored": q.reverse_scored,
            "active": q.active
        }
        for q in questions
    ]

@router.get("/questions/random")
def get_random_questions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    metric_ids: List[int] = Query(..., description="List of metric IDs to get questions from"),
    count_per_metric: int = Query(1, description="Number of questions per metric"),
    exclude_questions: List[int] = Query([], description="Question IDs to exclude")
):
    """Get random questions for specified metrics (for auto-pilot rotation)"""
    import random
    
    questions = []
    for metric_id in metric_ids:
        metric_questions = db.query(QuestionBank).filter(
            QuestionBank.metric_id == metric_id,
            QuestionBank.active == True,
            ~QuestionBank.id.in_(exclude_questions)
        ).all()
        
        if metric_questions:
            # Randomly select questions
            selected = random.sample(metric_questions, min(count_per_metric, len(metric_questions)))
            questions.extend(selected)
    
    return [
        {
            "id": q.id,
            "metric_id": q.metric_id,
            "metric_name": q.metric.name,
            "metric_category": q.metric.category,
            "question_text": q.get_question_text('en'),
            "variation_order": q.variation_order,
            "sensitive": q.sensitive,
            "reverse_scored": q.reverse_scored
        }
        for q in questions
    ]

@router.get("/questions/{question_id}")
def get_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    language: str = Query('en', description="Language for question text")
):
    """Get a specific question"""
    question = db.query(QuestionBank).filter(QuestionBank.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return {
        "id": question.id,
        "metric_id": question.metric_id,
        "metric_name": question.metric.name,
        "metric_category": question.metric.category,
        "question_text": question.get_question_text(language),
        "variation_order": question.variation_order,
        "sensitive": question.sensitive,
        "reverse_scored": question.reverse_scored,
        "active": question.active
    }

# Admin endpoints (for managing the question bank)
@router.post("/admin/metrics")
def create_metric(
    metric_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new metric (admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    metric = Metric(**metric_data)
    db.add(metric)
    db.commit()
    db.refresh(metric)
    
    return {
        "id": metric.id,
        "name": metric.name,
        "category": metric.category,
        "description": metric.description,
        "is_core": metric.is_core,
        "display_order": metric.display_order
    }

@router.post("/admin/questions")
def create_question(
    question_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new question (admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    question = QuestionBank(**question_data)
    db.add(question)
    db.commit()
    db.refresh(question)
    
    return {
        "id": question.id,
        "metric_id": question.metric_id,
        "question_text": question.get_question_text('en'),
        "variation_order": question.variation_order,
        "sensitive": question.sensitive,
        "reverse_scored": question.reverse_scored,
        "active": question.active
    }

@router.put("/admin/questions/{question_id}")
def update_question(
    question_id: int,
    question_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a question (admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    question = db.query(QuestionBank).filter(QuestionBank.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    for key, value in question_data.items():
        if hasattr(question, key):
            setattr(question, key, value)
    
    db.commit()
    db.refresh(question)
    
    return {
        "id": question.id,
        "metric_id": question.metric_id,
        "question_text": question.get_question_text('en'),
        "variation_order": question.variation_order,
        "sensitive": question.sensitive,
        "reverse_scored": question.reverse_scored,
        "active": question.active
    }

@router.delete("/admin/questions/{question_id}")
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a question (admin only) - actually just deactivates it"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    question = db.query(QuestionBank).filter(QuestionBank.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    question.active = False
    db.commit()
    
    return {"message": "Question deactivated successfully"}
