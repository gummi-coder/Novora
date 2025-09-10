from typing import List, Dict, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
import logging

from app.models.summaries import (
    ParticipationSummary, DriverSummary, SentimentSummary, 
    OrgDriverTrends, ReportsCache, CommentNLP
)
from app.models.responses import NumericResponse, Comment
from app.models.base import Survey, Team, User

logger = logging.getLogger(__name__)

class SummaryService:
    """Service for managing pre-aggregated summary data"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_participation_summary(self, survey_id: str, team_id: str) -> Optional[ParticipationSummary]:
        """Get participation summary for a team and survey"""
        return self.db.query(ParticipationSummary).filter(
            ParticipationSummary.survey_id == survey_id,
            ParticipationSummary.team_id == team_id
        ).first()
    
    def get_driver_summary(self, survey_id: str, team_id: str, driver_id: str) -> Optional[DriverSummary]:
        """Get driver summary for a team, survey, and driver"""
        return self.db.query(DriverSummary).filter(
            DriverSummary.survey_id == survey_id,
            DriverSummary.team_id == team_id,
            DriverSummary.driver_id == driver_id
        ).first()
    
    def get_sentiment_summary(self, survey_id: str, team_id: str) -> Optional[SentimentSummary]:
        """Get sentiment summary for a team and survey"""
        return self.db.query(SentimentSummary).filter(
            SentimentSummary.survey_id == survey_id,
            SentimentSummary.team_id == team_id
        ).first()
    
    def get_org_driver_trends(self, team_id: str, driver_id: str, months: int = 12) -> List[OrgDriverTrends]:
        """Get organization driver trends for the last N months"""
        cutoff_date = date.today().replace(day=1)  # First day of current month
        for _ in range(months - 1):
            if cutoff_date.month == 1:
                cutoff_date = cutoff_date.replace(year=cutoff_date.year - 1, month=12)
            else:
                cutoff_date = cutoff_date.replace(month=cutoff_date.month - 1)
        
        return self.db.query(OrgDriverTrends).filter(
            OrgDriverTrends.team_id == team_id,
            OrgDriverTrends.driver_id == driver_id,
            OrgDriverTrends.period_month >= cutoff_date
        ).order_by(OrgDriverTrends.period_month).all()
    
    def get_reports_cache(self, org_id: str, scope: str, period_start: date, period_end: date) -> Optional[ReportsCache]:
        """Get cached report data"""
        return self.db.query(ReportsCache).filter(
            ReportsCache.org_id == org_id,
            ReportsCache.scope == scope,
            ReportsCache.period_start == period_start,
            ReportsCache.period_end == period_end
        ).first()
    
    def cache_report_data(self, org_id: str, scope: str, period_start: date, period_end: date, payload: Dict) -> ReportsCache:
        """Cache report data"""
        # Remove existing cache entry if it exists
        existing = self.get_reports_cache(org_id, scope, period_start, period_end)
        if existing:
            self.db.delete(existing)
        
        # Create new cache entry
        cache_entry = ReportsCache(
            org_id=org_id,
            scope=scope,
            period_start=period_start,
            period_end=period_end,
            payload_json=payload
        )
        
        self.db.add(cache_entry)
        self.db.commit()
        self.db.refresh(cache_entry)
        
        return cache_entry
    
    def get_comment_nlp(self, comment_id: str) -> Optional[CommentNLP]:
        """Get NLP analysis for a comment"""
        return self.db.query(CommentNLP).filter(
            CommentNLP.comment_id == comment_id
        ).first()
    
    def process_comment_nlp(self, comment_id: str, sentiment: str, themes: List[str] = None, pii_masked: bool = True) -> CommentNLP:
        """Process and store NLP analysis for a comment"""
        # Remove existing NLP entry if it exists
        existing = self.get_comment_nlp(comment_id)
        if existing:
            self.db.delete(existing)
        
        # Create new NLP entry
        nlp_entry = CommentNLP(
            comment_id=comment_id,
            sentiment=sentiment,
            themes=themes or [],
            pii_masked=pii_masked
        )
        
        self.db.add(nlp_entry)
        self.db.commit()
        self.db.refresh(nlp_entry)
        
        return nlp_entry
    
    def get_team_summaries(self, team_id: str, survey_id: str) -> Dict:
        """Get all summaries for a team and survey"""
        participation = self.get_participation_summary(survey_id, team_id)
        sentiment = self.get_sentiment_summary(survey_id, team_id)
        drivers = self.db.query(DriverSummary).filter(
            DriverSummary.survey_id == survey_id,
            DriverSummary.team_id == team_id
        ).all()
        
        return {
            "participation": participation,
            "sentiment": sentiment,
            "drivers": drivers
        }
    
    def get_org_summaries(self, org_id: str, survey_id: str) -> Dict:
        """Get all summaries for an organization and survey"""
        participation = self.db.query(ParticipationSummary).filter(
            ParticipationSummary.org_id == org_id,
            ParticipationSummary.survey_id == survey_id
        ).all()
        
        sentiment = self.db.query(SentimentSummary).filter(
            SentimentSummary.org_id == org_id,
            SentimentSummary.survey_id == survey_id
        ).all()
        
        drivers = self.db.query(DriverSummary).filter(
            DriverSummary.org_id == org_id,
            DriverSummary.survey_id == survey_id
        ).all()
        
        return {
            "participation": participation,
            "sentiment": sentiment,
            "drivers": drivers
        }
    
    def invalidate_summaries(self, survey_id: str, team_id: str = None):
        """Invalidate summary data for a survey (and optionally specific team)"""
        if team_id:
            # Invalidate specific team summaries
            self.db.query(ParticipationSummary).filter(
                ParticipationSummary.survey_id == survey_id,
                ParticipationSummary.team_id == team_id
            ).delete()
            
            self.db.query(SentimentSummary).filter(
                SentimentSummary.survey_id == survey_id,
                SentimentSummary.team_id == team_id
            ).delete()
            
            self.db.query(DriverSummary).filter(
                DriverSummary.survey_id == survey_id,
                DriverSummary.team_id == team_id
            ).delete()
        else:
            # Invalidate all team summaries for this survey
            self.db.query(ParticipationSummary).filter(
                ParticipationSummary.survey_id == survey_id
            ).delete()
            
            self.db.query(SentimentSummary).filter(
                SentimentSummary.survey_id == survey_id
            ).delete()
            
            self.db.query(DriverSummary).filter(
                DriverSummary.survey_id == survey_id
            ).delete()
        
        self.db.commit()
        logger.info(f"Invalidated summaries for survey {survey_id}" + (f", team {team_id}" if team_id else ""))
