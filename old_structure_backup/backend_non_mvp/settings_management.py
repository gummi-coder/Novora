"""
Settings Management Endpoints
Complete organization settings and configuration management
"""
from fastapi import APIRouter, HTTPException, Depends, Query, Path, Body
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
import json

from app.core.database import get_db
from app.api.deps import get_current_user, get_current_admin_user
from app.models.base import User
from app.models.settings import OrgSettings, AlertThresholds, NotificationChannels
from app.models.drivers import Driver
from app.models.questions import Question
from app.schemas.settings import (
    OrgSettingsResponse, OrgSettingsUpdate, 
    AlertThresholdsResponse, AlertThresholdsUpdate,
    NotificationChannelCreate, NotificationChannelUpdate, NotificationChannelResponse,
    DriverCreate, DriverUpdate, DriverResponse,
    QuestionCreate, QuestionUpdate, QuestionResponse
)
from app.utils.audit import audit_log

router = APIRouter()

# ============================================================================
# ORGANIZATION SETTINGS ENDPOINTS
# ============================================================================

@router.get("/settings/org", response_model=OrgSettingsResponse)
async def get_org_settings(
    org_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get organization settings
    """
    try:
        # Validate access
        if current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get settings
        settings = db.query(OrgSettings).filter(OrgSettings.org_id == org_id).first()
        if not settings:
            # Create default settings
            settings = OrgSettings(
                id=str(uuid.uuid4()),
                org_id=org_id,
                min_n=4,
                language="en",
                cadence="monthly",
                pii_masking_enabled=True,
                safe_fallback_message="Not enough responses to show data safely",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(settings)
            db.commit()
            db.refresh(settings)
        
        return OrgSettingsResponse(
            id=settings.id,
            org_id=settings.org_id,
            min_n=settings.min_n,
            language=settings.language,
            cadence=settings.cadence,
            pii_masking_enabled=settings.pii_masking_enabled,
            safe_fallback_message=settings.safe_fallback_message,
            created_at=settings.created_at,
            updated_at=settings.updated_at
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get org settings: {str(e)}")

@router.put("/settings/org", response_model=OrgSettingsResponse)
async def update_org_settings(
    org_id: str = Query(...),
    settings_data: OrgSettingsUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Update organization settings
    """
    try:
        # Validate access
        if current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get settings
        settings = db.query(OrgSettings).filter(OrgSettings.org_id == org_id).first()
        if not settings:
            # Create new settings
            settings = OrgSettings(
                id=str(uuid.uuid4()),
                org_id=org_id,
                created_at=datetime.utcnow()
            )
            db.add(settings)
        
        # Update fields
        if settings_data.min_n is not None:
            if settings_data.min_n < 1:
                raise HTTPException(status_code=400, detail="min_n must be at least 1")
            settings.min_n = settings_data.min_n
        if settings_data.language is not None:
            settings.language = settings_data.language
        if settings_data.cadence is not None:
            settings.cadence = settings_data.cadence
        if settings_data.pii_masking_enabled is not None:
            settings.pii_masking_enabled = settings_data.pii_masking_enabled
        if settings_data.safe_fallback_message is not None:
            settings.safe_fallback_message = settings_data.safe_fallback_message
        
        settings.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(settings)
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="org_settings_updated",
            resource_type="org_settings",
            resource_id=settings.id,
            details={"updated_fields": list(settings_data.dict(exclude_unset=True).keys())}
        )
        
        return OrgSettingsResponse(
            id=settings.id,
            org_id=settings.org_id,
            min_n=settings.min_n,
            language=settings.language,
            cadence=settings.cadence,
            pii_masking_enabled=settings.pii_masking_enabled,
            safe_fallback_message=settings.safe_fallback_message,
            created_at=settings.created_at,
            updated_at=settings.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update org settings: {str(e)}")

# ============================================================================
# ALERT THRESHOLDS ENDPOINTS
# ============================================================================

@router.get("/settings/alert-thresholds", response_model=List[AlertThresholdsResponse])
async def get_alert_thresholds(
    org_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get alert thresholds for organization
    """
    try:
        # Validate access
        if current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get thresholds
        thresholds = db.query(AlertThresholds).filter(AlertThresholds.org_id == org_id).all()
        
        return [
            AlertThresholdsResponse(
                id=threshold.id,
                org_id=threshold.org_id,
                alert_type=threshold.alert_type,
                threshold_value=threshold.threshold_value,
                severity=threshold.severity,
                enabled=threshold.enabled,
                created_at=threshold.created_at,
                updated_at=threshold.updated_at
            )
            for threshold in thresholds
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get alert thresholds: {str(e)}")

@router.put("/settings/alert-thresholds")
async def update_alert_thresholds(
    org_id: str = Query(...),
    thresholds_data: List[AlertThresholdsUpdate] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Update alert thresholds
    """
    try:
        # Validate access
        if current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        updated_count = 0
        
        for threshold_data in thresholds_data:
            # Get existing threshold
            threshold = db.query(AlertThresholds).filter(
                and_(
                    AlertThresholds.org_id == org_id,
                    AlertThresholds.alert_type == threshold_data.alert_type
                )
            ).first()
            
            if threshold:
                # Update existing threshold
                if threshold_data.threshold_value is not None:
                    threshold.threshold_value = threshold_data.threshold_value
                if threshold_data.severity is not None:
                    threshold.severity = threshold_data.severity
                if threshold_data.enabled is not None:
                    threshold.enabled = threshold_data.enabled
                
                threshold.updated_at = datetime.utcnow()
                updated_count += 1
            else:
                # Create new threshold
                threshold = AlertThresholds(
                    id=str(uuid.uuid4()),
                    org_id=org_id,
                    alert_type=threshold_data.alert_type,
                    threshold_value=threshold_data.threshold_value,
                    severity=threshold_data.severity,
                    enabled=threshold_data.enabled,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(threshold)
                updated_count += 1
        
        db.commit()
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="alert_thresholds_updated",
            resource_type="alert_thresholds",
            resource_id=None,
            details={"thresholds_updated": updated_count}
        )
        
        return {"message": f"Updated {updated_count} alert thresholds", "thresholds_updated": updated_count}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update alert thresholds: {str(e)}")

# ============================================================================
# NOTIFICATION CHANNELS ENDPOINTS
# ============================================================================

@router.get("/notifications/channels", response_model=List[NotificationChannelResponse])
async def get_notification_channels(
    org_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get notification channels for organization
    """
    try:
        # Validate access
        if current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get channels
        channels = db.query(NotificationChannels).filter(NotificationChannels.org_id == org_id).all()
        
        return [
            NotificationChannelResponse(
                id=channel.id,
                org_id=channel.org_id,
                channel_type=channel.channel_type,
                enabled=channel.enabled,
                config=json.loads(channel.config) if channel.config else {},
                created_at=channel.created_at,
                updated_at=channel.updated_at
            )
            for channel in channels
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get notification channels: {str(e)}")

@router.post("/notifications/channels", response_model=NotificationChannelResponse)
async def create_notification_channel(
    channel_data: NotificationChannelCreate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Create a new notification channel
    """
    try:
        # Validate access
        if current_user.org_id != channel_data.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Check if channel type already exists
        existing_channel = db.query(NotificationChannels).filter(
            and_(
                NotificationChannels.org_id == channel_data.org_id,
                NotificationChannels.channel_type == channel_data.channel_type
            )
        ).first()
        
        if existing_channel:
            raise HTTPException(status_code=409, detail="Channel type already exists")
        
        # Create channel
        channel = NotificationChannels(
            id=str(uuid.uuid4()),
            org_id=channel_data.org_id,
            channel_type=channel_data.channel_type,
            enabled=channel_data.enabled,
            config=json.dumps(channel_data.config),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(channel)
        db.commit()
        db.refresh(channel)
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="notification_channel_created",
            resource_type="notification_channel",
            resource_id=channel.id,
            details={"channel_type": channel.channel_type}
        )
        
        return NotificationChannelResponse(
            id=channel.id,
            org_id=channel.org_id,
            channel_type=channel.channel_type,
            enabled=channel.enabled,
            config=json.loads(channel.config),
            created_at=channel.created_at,
            updated_at=channel.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create notification channel: {str(e)}")

@router.put("/notifications/channels/{channel_id}", response_model=NotificationChannelResponse)
async def update_notification_channel(
    channel_id: str = Path(...),
    channel_data: NotificationChannelUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Update notification channel
    """
    try:
        # Get channel
        channel = db.query(NotificationChannels).filter(NotificationChannels.id == channel_id).first()
        if not channel:
            raise HTTPException(status_code=404, detail="Notification channel not found")
        
        # Validate access
        if current_user.org_id != channel.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Update fields
        if channel_data.enabled is not None:
            channel.enabled = channel_data.enabled
        if channel_data.config is not None:
            channel.config = json.dumps(channel_data.config)
        
        channel.updated_at = datetime.utcnow()
        db.commit()
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="notification_channel_updated",
            resource_type="notification_channel",
            resource_id=channel_id,
            details={"updated_fields": list(channel_data.dict(exclude_unset=True).keys())}
        )
        
        return NotificationChannelResponse(
            id=channel.id,
            org_id=channel.org_id,
            channel_type=channel.channel_type,
            enabled=channel.enabled,
            config=json.loads(channel.config),
            created_at=channel.created_at,
            updated_at=channel.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update notification channel: {str(e)}")

# ============================================================================
# DRIVER MANAGEMENT ENDPOINTS
# ============================================================================

@router.get("/drivers", response_model=List[DriverResponse])
async def get_drivers(
    org_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get engagement drivers for organization
    """
    try:
        # Validate access
        if current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get drivers
        drivers = db.query(Driver).filter(Driver.org_id == org_id).all()
        
        return [
            DriverResponse(
                id=driver.id,
                org_id=driver.org_id,
                key=driver.key,
                label=driver.label,
                description=driver.description,
                created_at=driver.created_at,
                updated_at=driver.updated_at
            )
            for driver in drivers
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get drivers: {str(e)}")

@router.post("/drivers", response_model=DriverResponse)
async def create_driver(
    driver_data: DriverCreate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Create a new engagement driver
    """
    try:
        # Validate access
        if current_user.org_id != driver_data.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Check if driver key already exists
        existing_driver = db.query(Driver).filter(
            and_(
                Driver.org_id == driver_data.org_id,
                Driver.key == driver_data.key
            )
        ).first()
        
        if existing_driver:
            raise HTTPException(status_code=409, detail="Driver with this key already exists")
        
        # Create driver
        driver = Driver(
            id=str(uuid.uuid4()),
            org_id=driver_data.org_id,
            key=driver_data.key,
            label=driver_data.label,
            description=driver_data.description,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(driver)
        db.commit()
        db.refresh(driver)
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="driver_created",
            resource_type="driver",
            resource_id=driver.id,
            details={"driver_key": driver.key}
        )
        
        return DriverResponse(
            id=driver.id,
            org_id=driver.org_id,
            key=driver.key,
            label=driver.label,
            description=driver.description,
            created_at=driver.created_at,
            updated_at=driver.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create driver: {str(e)}")

@router.put("/drivers/{driver_id}", response_model=DriverResponse)
async def update_driver(
    driver_id: str = Path(...),
    driver_data: DriverUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Update engagement driver
    """
    try:
        # Get driver
        driver = db.query(Driver).filter(Driver.id == driver_id).first()
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")
        
        # Validate access
        if current_user.org_id != driver.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Update fields
        if driver_data.label is not None:
            driver.label = driver_data.label
        if driver_data.description is not None:
            driver.description = driver_data.description
        
        driver.updated_at = datetime.utcnow()
        db.commit()
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="driver_updated",
            resource_type="driver",
            resource_id=driver_id,
            details={"updated_fields": list(driver_data.dict(exclude_unset=True).keys())}
        )
        
        return DriverResponse(
            id=driver.id,
            org_id=driver.org_id,
            key=driver.key,
            label=driver.label,
            description=driver.description,
            created_at=driver.created_at,
            updated_at=driver.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update driver: {str(e)}")

# ============================================================================
# QUESTION MANAGEMENT ENDPOINTS
# ============================================================================

@router.get("/questions", response_model=List[QuestionResponse])
async def get_questions(
    driver_id: Optional[str] = Query(None),
    org_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get questions for drivers
    """
    try:
        # Validate access
        if current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Build query
        query = db.query(Question).join(Driver).filter(Driver.org_id == org_id)
        
        # Apply driver filter
        if driver_id:
            query = query.filter(Question.driver_id == driver_id)
        
        # Get questions
        questions = query.all()
        
        return [
            QuestionResponse(
                id=question.id,
                driver_id=question.driver_id,
                text=question.text,
                type=question.type,
                required=question.required,
                created_at=question.created_at,
                updated_at=question.updated_at
            )
            for question in questions
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get questions: {str(e)}")

@router.post("/questions", response_model=QuestionResponse)
async def create_question(
    question_data: QuestionCreate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Create a new question
    """
    try:
        # Validate driver exists and user has access
        driver = db.query(Driver).filter(Driver.id == question_data.driver_id).first()
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")
        
        if current_user.org_id != driver.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Create question
        question = Question(
            id=str(uuid.uuid4()),
            driver_id=question_data.driver_id,
            text=question_data.text,
            type=question_data.type,
            required=question_data.required,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(question)
        db.commit()
        db.refresh(question)
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="question_created",
            resource_type="question",
            resource_id=question.id,
            details={"driver_id": question.driver_id}
        )
        
        return QuestionResponse(
            id=question.id,
            driver_id=question.driver_id,
            text=question.text,
            type=question.type,
            required=question.required,
            created_at=question.created_at,
            updated_at=question.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create question: {str(e)}")

@router.put("/questions/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: str = Path(...),
    question_data: QuestionUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Update question
    """
    try:
        # Get question
        question = db.query(Question).filter(Question.id == question_id).first()
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        # Validate access through driver
        driver = db.query(Driver).filter(Driver.id == question.driver_id).first()
        if current_user.org_id != driver.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Update fields
        if question_data.text is not None:
            question.text = question_data.text
        if question_data.type is not None:
            question.type = question_data.type
        if question_data.required is not None:
            question.required = question_data.required
        
        question.updated_at = datetime.utcnow()
        db.commit()
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="question_updated",
            resource_type="question",
            resource_id=question_id,
            details={"updated_fields": list(question_data.dict(exclude_unset=True).keys())}
        )
        
        return QuestionResponse(
            id=question.id,
            driver_id=question.driver_id,
            text=question.text,
            type=question.type,
            required=question.required,
            created_at=question.created_at,
            updated_at=question.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update question: {str(e)}")
