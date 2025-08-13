from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.base import User
from app.models.advanced import AutoPilotPlan, AutoPilotSurvey, QuestionBank
from app.schemas.auto_pilot import (
    AutoPilotPlanCreate,
    AutoPilotPlanUpdate,
    AutoPilotPlanResponse,
    AutoPilotSurveyResponse,
    AutoPilotMetricsResponse,
    AutoPilotActivityResponse,
    ReminderSettingsUpdate
)
from app.services.auto_pilot_scheduler import auto_pilot_scheduler


router = APIRouter()

# Auto-Pilot Plan Management
@router.post("/plans", response_model=AutoPilotPlanResponse)
async def create_auto_pilot_plan(
    plan_data: AutoPilotPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new auto-pilot plan"""
    try:
        # Create the plan
        plan = AutoPilotPlan(
            name=plan_data.name,
            description=plan_data.description,
            frequency=plan_data.frequency,
            start_date=plan_data.start_date,
            end_date=plan_data.end_date,
            is_active=plan_data.is_active,
            question_rotation=plan_data.question_rotation,
            reminder_settings=plan_data.reminder_settings.dict(),
            distribution_channels=plan_data.distribution_channels,
            target_audience=plan_data.target_audience,
            max_responses=plan_data.max_responses,
            company_id=current_user.company_id,
            created_by=current_user.id
        )
        
        db.add(plan)
        db.commit()
        db.refresh(plan)
        
        return AutoPilotPlanResponse.from_orm(plan)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create auto-pilot plan: {str(e)}"
        )

@router.get("/plans", response_model=List[AutoPilotPlanResponse])
async def get_auto_pilot_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all auto-pilot plans for the current user's company"""
    try:
        plans = db.query(AutoPilotPlan).filter(
            AutoPilotPlan.company_id == current_user.company_id
        ).all()
        
        return [AutoPilotPlanResponse.from_orm(plan) for plan in plans]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get auto-pilot plans: {str(e)}"
        )

@router.get("/plans/{plan_id}", response_model=AutoPilotPlanResponse)
async def get_auto_pilot_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific auto-pilot plan"""
    try:
        plan = db.query(AutoPilotPlan).filter(
            AutoPilotPlan.id == plan_id,
            AutoPilotPlan.company_id == current_user.company_id
        ).first()
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Auto-pilot plan not found"
            )
        
        return AutoPilotPlanResponse.from_orm(plan)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get auto-pilot plan: {str(e)}"
        )

@router.put("/plans/{plan_id}", response_model=AutoPilotPlanResponse)
async def update_auto_pilot_plan(
    plan_id: int,
    plan_data: AutoPilotPlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an auto-pilot plan"""
    try:
        plan = db.query(AutoPilotPlan).filter(
            AutoPilotPlan.id == plan_id,
            AutoPilotPlan.company_id == current_user.company_id
        ).first()
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Auto-pilot plan not found"
            )
        
        # Update plan fields
        for field, value in plan_data.dict(exclude_unset=True).items():
            if field == "reminder_settings":
                setattr(plan, field, value.dict())
            else:
                setattr(plan, field, value)
        
        plan.updated_at = datetime.now()
        db.commit()
        db.refresh(plan)
        
        return AutoPilotPlanResponse.from_orm(plan)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update auto-pilot plan: {str(e)}"
        )

@router.delete("/plans/{plan_id}")
async def delete_auto_pilot_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an auto-pilot plan"""
    try:
        plan = db.query(AutoPilotPlan).filter(
            AutoPilotPlan.id == plan_id,
            AutoPilotPlan.company_id == current_user.company_id
        ).first()
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Auto-pilot plan not found"
            )
        
        db.delete(plan)
        db.commit()
        
        return {"message": "Auto-pilot plan deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete auto-pilot plan: {str(e)}"
        )

@router.post("/plans/{plan_id}/activate", response_model=AutoPilotPlanResponse)
async def activate_auto_pilot_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Activate an auto-pilot plan"""
    try:
        plan = db.query(AutoPilotPlan).filter(
            AutoPilotPlan.id == plan_id,
            AutoPilotPlan.company_id == current_user.company_id
        ).first()
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Auto-pilot plan not found"
            )
        
        plan.is_active = True
        plan.updated_at = datetime.now()
        db.commit()
        db.refresh(plan)
        
        return AutoPilotPlanResponse.from_orm(plan)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to activate auto-pilot plan: {str(e)}"
        )

@router.post("/plans/{plan_id}/deactivate", response_model=AutoPilotPlanResponse)
async def deactivate_auto_pilot_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deactivate an auto-pilot plan"""
    try:
        plan = db.query(AutoPilotPlan).filter(
            AutoPilotPlan.id == plan_id,
            AutoPilotPlan.company_id == current_user.company_id
        ).first()
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Auto-pilot plan not found"
            )
        
        plan.is_active = False
        plan.updated_at = datetime.now()
        db.commit()
        db.refresh(plan)
        
        return AutoPilotPlanResponse.from_orm(plan)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to deactivate auto-pilot plan: {str(e)}"
        )

# Auto-Pilot Survey Management
@router.get("/surveys", response_model=List[AutoPilotSurveyResponse])
async def get_scheduled_surveys(
    plan_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get scheduled surveys"""
    try:
        query = db.query(AutoPilotSurvey).join(AutoPilotPlan).filter(
            AutoPilotPlan.company_id == current_user.company_id
        )
        
        if plan_id:
            query = query.filter(AutoPilotSurvey.plan_id == plan_id)
        
        surveys = query.all()
        return [AutoPilotSurveyResponse.from_orm(survey) for survey in surveys]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get scheduled surveys: {str(e)}"
        )

@router.get("/surveys/{survey_id}", response_model=AutoPilotSurveyResponse)
async def get_auto_pilot_survey(
    survey_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific auto-pilot survey"""
    try:
        survey = db.query(AutoPilotSurvey).join(AutoPilotPlan).filter(
            AutoPilotSurvey.id == survey_id,
            AutoPilotPlan.company_id == current_user.company_id
        ).first()
        
        if not survey:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Auto-pilot survey not found"
            )
        
        return AutoPilotSurveyResponse.from_orm(survey)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get auto-pilot survey: {str(e)}"
        )

@router.post("/surveys/{survey_id}/cancel")
async def cancel_auto_pilot_survey(
    survey_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel an auto-pilot survey"""
    try:
        survey = db.query(AutoPilotSurvey).join(AutoPilotPlan).filter(
            AutoPilotSurvey.id == survey_id,
            AutoPilotPlan.company_id == current_user.company_id
        ).first()
        
        if not survey:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Auto-pilot survey not found"
            )
        
        survey.status = "cancelled"
        db.commit()
        
        return {"message": "Auto-pilot survey cancelled successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel auto-pilot survey: {str(e)}"
        )

# Question Rotation
@router.get("/question-sets", response_model=List[dict])
async def get_question_sets(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get question sets for auto-pilot plans"""
    try:
        query = db.query(QuestionBank).filter(
            QuestionBank.metric.has(company_id=current_user.company_id)
        )
        
        if category:
            query = query.filter(QuestionBank.metric.has(category=category))
        
        question_sets = query.all()
        
        return [
            {
                "id": qs.id,
                "name": qs.name,
                "category": qs.category,
                "question_count": len(qs.questions),
                "questions": [
                    {
                        "id": q.id,
                        "text": q.text,
                        "category": q.category,
                        "order": q.order,
                        "required": q.required
                    }
                    for q in qs.questions
                ]
            }
            for qs in question_sets
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get question sets: {str(e)}"
        )

@router.post("/plans/{plan_id}/rotate-questions")
async def rotate_questions(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manually rotate questions for a plan"""
    try:
        plan = db.query(AutoPilotPlan).filter(
            AutoPilotPlan.id == plan_id,
            AutoPilotPlan.company_id == current_user.company_id
        ).first()
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Auto-pilot plan not found"
            )
        
        # Trigger question rotation
        await auto_pilot_scheduler.manual_trigger_survey(plan_id)
        
        return {"message": "Questions rotated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to rotate questions: {str(e)}"
        )

# Reminder System
@router.post("/surveys/{survey_id}/send-reminder")
async def send_reminder(
    survey_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manually send a reminder for a survey"""
    try:
        survey = db.query(AutoPilotSurvey).join(AutoPilotPlan).filter(
            AutoPilotSurvey.id == survey_id,
            AutoPilotPlan.company_id == current_user.company_id
        ).first()
        
        if not survey:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Auto-pilot survey not found"
            )
        
        # Trigger reminder
        await auto_pilot_scheduler.manual_trigger_reminder(survey_id)
        
        return {"message": "Reminder sent successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send reminder: {str(e)}"
        )

@router.get("/surveys/{survey_id}/reminders")
async def get_reminder_history(
    survey_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get reminder history for a survey"""
    try:
        survey = db.query(AutoPilotSurvey).join(AutoPilotPlan).filter(
            AutoPilotSurvey.id == survey_id,
            AutoPilotPlan.company_id == current_user.company_id
        ).first()
        
        if not survey:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Auto-pilot survey not found"
            )
        
        # This would typically query a reminder history table
        # For now, return basic info
        return {
            "survey_id": survey_id,
            "reminder_count": survey.reminder_count,
            "last_reminder_date": survey.last_reminder_date,
            "max_reminders": survey.max_reminders
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get reminder history: {str(e)}"
        )

@router.put("/plans/{plan_id}/reminder-settings")
async def update_reminder_settings(
    plan_id: int,
    settings: ReminderSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update reminder settings for a plan"""
    try:
        plan = db.query(AutoPilotPlan).filter(
            AutoPilotPlan.id == plan_id,
            AutoPilotPlan.company_id == current_user.company_id
        ).first()
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Auto-pilot plan not found"
            )
        
        # Update reminder settings with new structure
        current_settings = plan.reminder_settings or {}
        settings_dict = settings.dict()
        
        # Ensure reminder days are properly set
        if 'reminderDays' not in settings_dict or not settings_dict['reminderDays']:
            settings_dict['reminderDays'] = [3, 7]  # Default reminder days
        
        # Ensure auto-close days are set
        if 'autoCloseAfterDays' not in settings_dict:
            settings_dict['autoCloseAfterDays'] = 10  # Default auto-close days
        
        current_settings.update(settings_dict)
        plan.reminder_settings = current_settings
        plan.updated_at = datetime.now()
        
        db.commit()
        db.refresh(plan)
        
        return AutoPilotPlanResponse.from_orm(plan)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update reminder settings: {str(e)}"
        )

# Metrics and Analytics
@router.get("/metrics", response_model=AutoPilotMetricsResponse)
async def get_auto_pilot_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get auto-pilot metrics"""
    try:
        # Get plans for the company
        plans = db.query(AutoPilotPlan).filter(
            AutoPilotPlan.company_id == current_user.company_id
        ).all()
        
        # Get surveys for the company
        surveys = db.query(AutoPilotSurvey).join(AutoPilotPlan).filter(
            AutoPilotPlan.company_id == current_user.company_id
        ).all()
        
        # Calculate metrics
        total_surveys = len(surveys)
        active_plans = len([p for p in plans if p.is_active])
        
        # Calculate response rate (simplified)
        total_responses = sum(s.response_count for s in surveys)
        total_target = sum(s.target_count for s in surveys)
        average_response_rate = (total_responses / total_target * 100) if total_target > 0 else 0
        
        # Get next scheduled survey
        next_survey = None
        for plan in plans:
            if plan.is_active and plan.start_date <= datetime.now():
                next_date = plan.last_survey_date or plan.start_date
                if plan.frequency == "weekly":
                    next_date += timedelta(weeks=1)
                elif plan.frequency == "monthly":
                    next_date += timedelta(days=30)
                
                if not next_survey or next_date < next_survey:
                    next_survey = next_date
        
        return AutoPilotMetricsResponse(
            total_surveys=total_surveys,
            active_plans=active_plans,
            average_response_rate=round(average_response_rate, 1),
            total_responses=total_responses,
            next_scheduled_survey=next_survey,
            recent_activity=[]  # This would be populated from activity log
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get metrics: {str(e)}"
        )

@router.get("/activity", response_model=List[AutoPilotActivityResponse])
async def get_activity_log(
    plan_id: Optional[int] = None,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get activity log for auto-pilot plans"""
    try:
        # This would typically query an activity log table
        # For now, return mock data
        activities = []
        
        # Get recent surveys
        surveys = db.query(AutoPilotSurvey).join(AutoPilotPlan).filter(
            AutoPilotPlan.company_id == current_user.company_id
        ).order_by(AutoPilotSurvey.created_at.desc()).limit(limit).all()
        
        for survey in surveys:
            activities.append(AutoPilotActivityResponse(
                id=f"survey_{survey.id}",
                type="survey_sent",
                description=f"Survey '{survey.title}' sent",
                timestamp=survey.created_at,
                plan_id=survey.plan_id,
                survey_id=survey.id
            ))
        
        return activities[:limit]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get activity log: {str(e)}"
        )
