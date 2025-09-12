"""
Simplified Summary Service for MVP
"""
import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class SummaryService:
    """Simplified service for MVP survey summaries"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_survey_summary(self, survey_id: str) -> Dict[str, Any]:
        """Get basic survey summary for MVP"""
        try:
            # For MVP, return basic summary data
            return {
                "survey_id": survey_id,
                "total_responses": 0,
                "average_score": 0.0,
                "status": "collecting"
            }
        except Exception as e:
            logger.error(f"Error getting survey summary: {str(e)}")
            return {
                "survey_id": survey_id,
                "total_responses": 0,
                "average_score": 0.0,
                "status": "error"
            }
