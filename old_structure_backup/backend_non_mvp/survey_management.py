"""
Survey Management Endpoints
Complete survey creation, token generation, and delivery functionality
"""
from fastapi import APIRouter, HTTPException, Depends, Query, Path, Body, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import uuid
import json

from app.core.database import get_db
from app.api.deps import get_current_user, get_current_admin_user
from app.models.base import User, Survey, SurveyToken
from app.models.advanced import Team
# from app.models.employees import Employee  # Temporarily commented out
# from app.models.drivers import Driver  # Temporarily commented out
from app.models.questions import Question
from app.schemas.surveys import SurveyCreate, SurveyUpdate, SurveyResponse, TokenDeliveryConfig
from app.services.email import EmailService
from app.services.token_generator import TokenGenerator
from app.utils.audit import audit_log
from app.core.config import settings

router = APIRouter()

@router.post("/surveys/create", response_model=SurveyResponse)
async def create_survey(
    survey_data: SurveyCreate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    background_tasks: BackgroundTasks = None
):
    """
    Create a new survey with questions and configuration
    """
    try:
        # Validate organization access
        if current_user.role != "admin" or current_user.org_id != survey_data.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Create survey
        survey = Survey(
            id=str(uuid.uuid4()),
            org_id=survey_data.org_id,
            creator_id=current_user.id,
            name=survey_data.name,
            description=survey_data.description,
            opens_at=survey_data.opens_at,
            closes_at=survey_data.closes_at,
            status="draft",
            question_set_json=json.dumps(survey_data.question_set),
            settings_json=json.dumps(survey_data.settings),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(survey)
        db.commit()
        db.refresh(survey)
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="survey_created",
            resource_type="survey",
            resource_id=survey.id,
            details={"survey_name": survey.name}
        )
        
        return SurveyResponse(
            id=survey.id,
            org_id=survey.org_id,
            name=survey.name,
            description=survey.description,
            status=survey.status,
            opens_at=survey.opens_at,
            closes_at=survey.closes_at,
            created_at=survey.created_at,
            updated_at=survey.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create survey: {str(e)}")

@router.get("/surveys/{survey_id}/tokens/generate")
async def generate_survey_tokens(
    survey_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Generate tokens for all employees in the survey
    """
    try:
        # Get survey
        survey = db.query(Survey).filter(Survey.id == survey_id).first()
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        # Validate access
        if current_user.org_id != survey.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get all active employees for the organization
        employees = db.query(Employee).filter(
            and_(
                Employee.org_id == survey.org_id,
                Employee.status == "active"
            )
        ).all()
        
        if not employees:
            raise HTTPException(status_code=400, detail="No active employees found")
        
        # Generate tokens
        token_generator = TokenGenerator()
        tokens_created = 0
        
        for employee in employees:
            # Check if token already exists
            existing_token = db.query(SurveyToken).filter(
                and_(
                    SurveyToken.survey_id == survey_id,
                    SurveyToken.employee_id == employee.id
                )
            ).first()
            
            if not existing_token:
                token = SurveyToken(
                    id=str(uuid.uuid4()),
                    token=token_generator.generate_token(),
                    survey_id=survey_id,
                    employee_id=employee.id,
                    team_id=employee.team_id,
                    used=False,
                    created_at=datetime.utcnow()
                )
                db.add(token)
                tokens_created += 1
        
        db.commit()
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="tokens_generated",
            resource_type="survey",
            resource_id=survey_id,
            details={"tokens_created": tokens_created, "total_employees": len(employees)}
        )
        
        return {
            "message": f"Generated {tokens_created} tokens for {len(employees)} employees",
            "survey_id": survey_id,
            "tokens_created": tokens_created,
            "total_employees": len(employees)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to generate tokens: {str(e)}")

@router.post("/surveys/{survey_id}/tokens/deliver")
async def deliver_survey_tokens(
    survey_id: str = Path(...),
    delivery_config: TokenDeliveryConfig = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    background_tasks: BackgroundTasks = None
):
    """
    Deliver survey tokens via email/Slack/Teams
    """
    try:
        # Get survey
        survey = db.query(Survey).filter(Survey.id == survey_id).first()
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        # Validate access
        if current_user.org_id != survey.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get all tokens for the survey
        tokens = db.query(SurveyToken).filter(
            and_(
                SurveyToken.survey_id == survey_id,
                SurveyToken.used == False
            )
        ).all()
        
        if not tokens:
            raise HTTPException(status_code=400, detail="No unused tokens found")
        
        # Get employees for tokens
        employee_ids = [token.employee_id for token in tokens]
        employees = db.query(Employee).filter(Employee.id.in_(employee_ids)).all()
        employee_map = {emp.id: emp for emp in employees}
        
        # Initialize email service
        email_service = EmailService()
        emails_sent = 0
        
        # Send emails
        for token in tokens:
            employee = employee_map.get(token.employee_id)
            if employee and employee.email:
                try:
                    # Create survey URL
                    survey_url = f"{settings.FRONTEND_URL}/survey/{token.token}"
                    
                    # Send email
                    email_service.send_survey_invitation(
                        to_email=employee.email,
                        employee_name=employee.name or "Team Member",
                        survey_name=survey.name,
                        survey_url=survey_url,
                        opens_at=survey.opens_at,
                        closes_at=survey.closes_at,
                        org_name=delivery_config.org_name
                    )
                    emails_sent += 1
                    
                except Exception as e:
                    # Log error but continue with other emails
                    print(f"Failed to send email to {employee.email}: {str(e)}")
        
        # Update survey status if needed
        if survey.status == "draft":
            survey.status = "active"
            survey.updated_at = datetime.utcnow()
            db.commit()
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="tokens_delivered",
            resource_type="survey",
            resource_id=survey_id,
            details={
                "emails_sent": emails_sent,
                "total_tokens": len(tokens),
                "delivery_method": "email"
            }
        )
        
        return {
            "message": f"Delivered {emails_sent} survey invitations",
            "survey_id": survey_id,
            "emails_sent": emails_sent,
            "total_tokens": len(tokens),
            "delivery_method": "email"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to deliver tokens: {str(e)}")

@router.get("/surveys/{survey_id}/tokens/status")
async def get_survey_token_status(
    survey_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get token delivery and usage status for a survey
    """
    try:
        # Get survey
        survey = db.query(Survey).filter(Survey.id == survey_id).first()
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        # Validate access
        if current_user.org_id != survey.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get token statistics
        total_tokens = db.query(SurveyToken).filter(SurveyToken.survey_id == survey_id).count()
        used_tokens = db.query(SurveyToken).filter(
            and_(
                SurveyToken.survey_id == survey_id,
                SurveyToken.used == True
            )
        ).count()
        unused_tokens = total_tokens - used_tokens
        
        # Get team breakdown
        team_stats = db.query(
            SurveyToken.team_id,
            db.func.count(SurveyToken.id).label('total'),
            db.func.sum(db.case([(SurveyToken.used == True, 1)], else_=0)).label('used')
        ).filter(SurveyToken.survey_id == survey_id).group_by(SurveyToken.team_id).all()
        
        return {
            "survey_id": survey_id,
            "survey_name": survey.name,
            "survey_status": survey.status,
            "total_tokens": total_tokens,
            "used_tokens": used_tokens,
            "unused_tokens": unused_tokens,
            "participation_rate": (used_tokens / total_tokens * 100) if total_tokens > 0 else 0,
            "team_breakdown": [
                {
                    "team_id": stat.team_id,
                    "total_tokens": stat.total,
                    "used_tokens": stat.used,
                    "participation_rate": (stat.used / stat.total * 100) if stat.total > 0 else 0
                }
                for stat in team_stats
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get token status: {str(e)}")

@router.put("/surveys/{survey_id}")
async def update_survey(
    survey_id: str = Path(...),
    survey_data: SurveyUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Update survey details
    """
    try:
        # Get survey
        survey = db.query(Survey).filter(Survey.id == survey_id).first()
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        # Validate access
        if current_user.org_id != survey.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Update fields
        if survey_data.name is not None:
            survey.name = survey_data.name
        if survey_data.description is not None:
            survey.description = survey_data.description
        if survey_data.opens_at is not None:
            survey.opens_at = survey_data.opens_at
        if survey_data.closes_at is not None:
            survey.closes_at = survey_data.closes_at
        if survey_data.status is not None:
            survey.status = survey_data.status
        if survey_data.question_set is not None:
            survey.question_set_json = json.dumps(survey_data.question_set)
        if survey_data.settings is not None:
            survey.settings_json = json.dumps(survey_data.settings)
        
        survey.updated_at = datetime.utcnow()
        db.commit()
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="survey_updated",
            resource_type="survey",
            resource_id=survey_id,
            details={"updated_fields": list(survey_data.dict(exclude_unset=True).keys())}
        )
        
        return {"message": "Survey updated successfully", "survey_id": survey_id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update survey: {str(e)}")

@router.delete("/surveys/{survey_id}")
async def delete_survey(
    survey_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Delete survey (soft delete)
    """
    try:
        # Get survey
        survey = db.query(Survey).filter(Survey.id == survey_id).first()
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        # Validate access
        if current_user.org_id != survey.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Soft delete
        survey.status = "deleted"
        survey.updated_at = datetime.utcnow()
        db.commit()
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="survey_deleted",
            resource_type="survey",
            resource_id=survey_id,
            details={"survey_name": survey.name}
        )
        
        return {"message": "Survey deleted successfully", "survey_id": survey_id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete survey: {str(e)}")
