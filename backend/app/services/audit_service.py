"""
Simplified Audit Service for MVP
"""
import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class AuditService:
    """Simplified audit service for MVP"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def log_action(self, user_id: str, action: str, resource_type: str, resource_id: str = None, details: Dict[str, Any] = None):
        """Log a general action (simplified for MVP)"""
        try:
            logger.info(f"Audit: {action} on {resource_type} {resource_id} by user {user_id}")
        except Exception as e:
            logger.error(f"Failed to log audit action: {str(e)}")
    
    def log_survey_submission(self, survey_id: str, user_id: str = None, details: Dict[str, Any] = None):
        """Log survey submission (simplified for MVP)"""
        try:
            logger.info(f"Survey submitted: {survey_id} by {user_id or 'anonymous'}")
        except Exception as e:
            logger.error(f"Failed to log survey submission: {str(e)}")
