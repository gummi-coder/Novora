"""
Audit Service for Comprehensive Logging
Handles audit logging for all system actions
"""
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.advanced import AuditLog

logger = logging.getLogger(__name__)

def audit_log(
    db: Session,
    user_id: str,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
) -> None:
    """
    Log an audit event
    
    Args:
        db: Database session
        user_id: ID of the user performing the action
        action: Action being performed (e.g., 'survey_created', 'user_updated')
        resource_type: Type of resource being acted upon (e.g., 'survey', 'user')
        resource_id: ID of the resource being acted upon
        details: Additional details about the action
    """
    try:
        audit_entry = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details or {},
            timestamp=datetime.utcnow()
        )
        
        db.add(audit_entry)
        db.commit()
        
        logger.info(f"Audit log: {action} on {resource_type} {resource_id} by user {user_id}")
        
    except Exception as e:
        logger.error(f"Failed to create audit log: {str(e)}")
        db.rollback()
        # Don't raise the exception to avoid breaking the main operation

class AuditService:
    """Audit Service for comprehensive logging"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def log_action(self, user_id: str, action: str, resource_type: str, resource_id: str = None, details: Dict[str, Any] = None):
        """Log a general action"""
        audit_log(
            db=self.db,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details
        )
    
    def log_survey_submission(self, survey_id: str, user_id: str = None, details: Dict[str, Any] = None):
        """Log survey submission"""
        audit_log(
            db=self.db,
            user_id=user_id or "anonymous",
            action="survey_submitted",
            resource_type="survey",
            resource_id=survey_id,
            details=details
        )
    
    def log_alert_acknowledgment(self, user_id: str, alert_id: str, details: Dict[str, Any] = None):
        """Log alert acknowledgment"""
        audit_log(
            db=self.db,
            user_id=user_id,
            action="alert_acknowledged",
            resource_type="alert",
            resource_id=alert_id,
            details=details
        )
    
    def log_alert_resolution(self, user_id: str, alert_id: str, details: Dict[str, Any] = None):
        """Log alert resolution"""
        audit_log(
            db=self.db,
            user_id=user_id,
            action="alert_resolved",
            resource_type="alert",
            resource_id=alert_id,
            details=details
        )
