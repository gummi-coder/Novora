"""
Universal Min-n Enforcement with Hotspot Detection and Safe Aggregates
"""
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from datetime import datetime, timedelta
import logging

from app.models.summaries import (
    ParticipationSummary, DriverSummary, SentimentSummary,
    OrgDriverTrends, CommentNLP
)
from app.models.responses import NumericResponse, Comment
from app.models.advanced import DashboardAlert
from app.core.privacy import get_org_privacy_settings

logger = logging.getLogger(__name__)

class MinNGuard(Exception):
    """Custom exception for min-n violations"""
    pass

def enforce_min_n(
    org_id: str, 
    team_id: str, 
    survey_id: str, 
    db: Session,
    required: Optional[int] = None
) -> bool:
    """Universal min-n enforcement - check before exposing any aggregates"""
    try:
        privacy_settings = get_org_privacy_settings(org_id, db)
        min_n = required or privacy_settings.min_n
        
        participation = db.query(ParticipationSummary).filter(
            ParticipationSummary.survey_id == survey_id,
            ParticipationSummary.team_id == team_id
        ).first()
        
        if not participation:
            raise MinNGuard(f"No participation data found for survey {survey_id}, team {team_id}")
        
        respondents = participation.respondents
        if respondents is None or respondents < min_n:
            raise MinNGuard(
                f"Not enough responses to show data safely. "
                f"Required: {min_n}, Actual: {respondents or 0}"
            )
        
        return True
        
    except MinNGuard:
        raise
    except Exception as e:
        logger.error(f"Error enforcing min-n: {str(e)}")
        raise MinNGuard("Error checking response count")

def safe_aggregate_response(
    org_id: str,
    team_id: str,
    survey_id: str,
    db: Session,
    fallback_message: Optional[str] = None
) -> Dict[str, Any]:
    """Safe aggregate response with min-n fallback handling"""
    try:
        enforce_min_n(org_id, team_id, survey_id, db)
        
        # Get actual data
        participation = db.query(ParticipationSummary).filter(
            ParticipationSummary.survey_id == survey_id,
            ParticipationSummary.team_id == team_id
        ).first()
        
        drivers = db.query(DriverSummary).filter(
            DriverSummary.survey_id == survey_id,
            DriverSummary.team_id == team_id
        ).all()
        
        sentiment = db.query(SentimentSummary).filter(
            SentimentSummary.survey_id == survey_id,
            SentimentSummary.team_id == team_id
        ).first()
        
        return {
            "safe": True,
            "message": None,
            "data": {
                "participation": participation,
                "drivers": drivers,
                "sentiment": sentiment
            }
        }
        
    except MinNGuard as e:
        privacy_settings = get_org_privacy_settings(org_id, db)
        message = fallback_message or privacy_settings.safe_fallback_message
        
        return {
            "safe": False,
            "message": str(e),
            "fallback_message": message,
            "data": None
        }

def detect_hotspots(
    org_id: str,
    team_id: str,
    survey_id: str,
    db: Session,
    score_drop_threshold: float = -1.0,
    sentiment_spike_threshold: float = 30.0
) -> List[Dict[str, Any]]:
    """Detect hotspots: drivers with significant drops or negative sentiment spikes"""
    try:
        # Check min-n first
        enforce_min_n(org_id, team_id, survey_id, db)
        
        hotspots = []
        
        # Check for score drops
        drivers = db.query(DriverSummary).filter(
            DriverSummary.survey_id == survey_id,
            DriverSummary.team_id == team_id
        ).all()
        
        for driver in drivers:
            if driver.delta_vs_prev and driver.delta_vs_prev <= score_drop_threshold:
                hotspots.append({
                    "type": "score_drop",
                    "driver_id": str(driver.driver_id),
                    "current_score": driver.avg_score,
                    "delta": driver.delta_vs_prev,
                    "severity": "high" if driver.delta_vs_prev <= -2.0 else "medium",
                    "description": f"Driver score dropped by {abs(driver.delta_vs_prev):.1f} points"
                })
        
        # Check for negative sentiment spikes
        sentiment = db.query(SentimentSummary).filter(
            SentimentSummary.survey_id == survey_id,
            SentimentSummary.team_id == team_id
        ).first()
        
        if sentiment and sentiment.neg_pct > sentiment_spike_threshold:
            hotspots.append({
                "type": "sentiment_spike",
                "driver_id": None,
                "current_score": sentiment.neg_pct,
                "delta": sentiment.delta_vs_prev,
                "severity": "high" if sentiment.neg_pct > 50.0 else "medium",
                "description": f"Negative sentiment spike: {sentiment.neg_pct:.1f}%"
            })
        
        return hotspots
        
    except MinNGuard:
        return []

def detect_recurring_risks(
    org_id: str,
    team_id: str,
    db: Session,
    consecutive_count: int = 3,
    days_back: int = 90
) -> List[Dict[str, Any]]:
    """Detect recurring risk patterns across multiple surveys"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days_back)
        
        # Get recent surveys for this team
        from app.models.base import Survey
        recent_surveys = db.query(Survey).join(NumericResponse).filter(
            NumericResponse.team_id == team_id,
            Survey.created_at >= cutoff_date,
            Survey.status.in_(["active", "closed"])
        ).order_by(desc(Survey.created_at)).limit(consecutive_count + 2).all()
        
        if len(recent_surveys) < consecutive_count:
            return []
        
        recurring_risks = []
        
        # Check for recurring low scores
        low_score_count = 0
        for survey in recent_surveys[:consecutive_count]:
            try:
                enforce_min_n(org_id, team_id, str(survey.id), db)
                
                drivers = db.query(DriverSummary).filter(
                    DriverSummary.survey_id == survey.id,
                    DriverSummary.team_id == team_id
                ).all()
                
                for driver in drivers:
                    if driver.avg_score < 6.0:  # Low score threshold
                        low_score_count += 1
                        break
                        
            except MinNGuard:
                continue
        
        if low_score_count >= consecutive_count:
            recurring_risks.append({
                "type": "recurring_low_scores",
                "description": f"Low driver scores for {consecutive_count} consecutive surveys",
                "severity": "high",
                "affected_surveys": consecutive_count
            })
        
        # Check for recurring low participation
        low_participation_count = 0
        for survey in recent_surveys[:consecutive_count]:
            try:
                enforce_min_n(org_id, team_id, str(survey.id), db)
                
                participation = db.query(ParticipationSummary).filter(
                    ParticipationSummary.survey_id == survey.id,
                    ParticipationSummary.team_id == team_id
                ).first()
                
                if participation and participation.participation_pct < 60.0:
                    low_participation_count += 1
                    
            except MinNGuard:
                continue
        
        if low_participation_count >= consecutive_count:
            recurring_risks.append({
                "type": "recurring_low_participation",
                "description": f"Low participation for {consecutive_count} consecutive surveys",
                "severity": "medium",
                "affected_surveys": consecutive_count
            })
        
        # Check for recurring negative sentiment
        neg_sentiment_count = 0
        for survey in recent_surveys[:consecutive_count]:
            try:
                enforce_min_n(org_id, team_id, str(survey.id), db)
                
                sentiment = db.query(SentimentSummary).filter(
                    SentimentSummary.survey_id == survey.id,
                    SentimentSummary.team_id == team_id
                ).first()
                
                if sentiment and sentiment.neg_pct > 30.0:
                    neg_sentiment_count += 1
                    
            except MinNGuard:
                continue
        
        if neg_sentiment_count >= consecutive_count:
            recurring_risks.append({
                "type": "recurring_negative_sentiment",
                "description": f"High negative sentiment for {consecutive_count} consecutive surveys",
                "severity": "high",
                "affected_surveys": consecutive_count
            })
        
        return recurring_risks
        
    except Exception as e:
        logger.error(f"Error detecting recurring risks: {str(e)}")
        return []

def get_safe_team_list(
    org_id: str,
    survey_id: str,
    db: Session
) -> Tuple[List[str], List[str]]:
    """Get lists of safe and unsafe teams for a survey"""
    try:
        # Get all teams that participated in this survey
        participations = db.query(ParticipationSummary).filter(
            ParticipationSummary.survey_id == survey_id
        ).all()
        
        privacy_settings = get_org_privacy_settings(org_id, db)
        min_n = privacy_settings.min_n
        
        safe_teams = []
        unsafe_teams = []
        
        for participation in participations:
            if participation.respondents and participation.respondents >= min_n:
                safe_teams.append(str(participation.team_id))
            else:
                unsafe_teams.append(str(participation.team_id))
        
        return safe_teams, unsafe_teams
        
    except Exception as e:
        logger.error(f"Error getting safe team list: {str(e)}")
        return [], []

def filter_unsafe_teams(
    org_id: str,
    survey_id: str,
    team_data: List[Dict[str, Any]],
    db: Session
) -> Dict[str, Any]:
    """Filter out unsafe teams and return safe data with metadata"""
    try:
        safe_teams, unsafe_teams = get_safe_team_list(org_id, survey_id, db)
        
        # Filter data to only include safe teams
        safe_data = [
            item for item in team_data 
            if str(item.get("team_id")) in safe_teams
        ]
        
        return {
            "data": safe_data,
            "safe_teams_count": len(safe_teams),
            "unsafe_teams_count": len(unsafe_teams),
            "total_teams": len(safe_teams) + len(unsafe_teams),
            "unsafe_teams": unsafe_teams,
            "message": f"Cannot show data for {len(unsafe_teams)} teams due to insufficient responses" if unsafe_teams else None
        }
        
    except Exception as e:
        logger.error(f"Error filtering unsafe teams: {str(e)}")
        return {
            "data": [],
            "safe_teams_count": 0,
            "unsafe_teams_count": 0,
            "total_teams": 0,
            "unsafe_teams": [],
            "message": "Error filtering team data"
        }

def validate_export_safety(
    org_id: str,
    survey_id: str,
    team_ids: List[str],
    db: Session
) -> Dict[str, Any]:
    """Validate export safety for specified teams"""
    try:
        safe_teams, unsafe_teams = get_safe_team_list(org_id, survey_id, db)
        
        # Check if all requested teams are safe
        requested_unsafe = [tid for tid in team_ids if tid in unsafe_teams]
        
        return {
            "safe": len(requested_unsafe) == 0,
            "safe_teams": [tid for tid in team_ids if tid in safe_teams],
            "unsafe_teams": requested_unsafe,
            "message": f"Cannot export {len(requested_unsafe)} teams due to insufficient responses" if requested_unsafe else None
        }
        
    except Exception as e:
        logger.error(f"Error validating export safety: {str(e)}")
        return {
            "safe": False,
            "safe_teams": [],
            "unsafe_teams": team_ids,
            "message": "Error validating export safety"
        }

def safe_response_count(
    org_id: str,
    team_id: str,
    survey_id: str,
    db: Session
) -> Dict[str, Any]:
    """Get safe response count information"""
    try:
        privacy_settings = get_org_privacy_settings(org_id, db)
        min_n = privacy_settings.min_n
        
        participation = db.query(ParticipationSummary).filter(
            ParticipationSummary.survey_id == survey_id,
            ParticipationSummary.team_id == team_id
        ).first()
        
        if not participation:
            return {
                "safe": False,
                "actual_count": 0,
                "required_count": min_n,
                "message": "No participation data found"
            }
        
        actual_count = participation.respondents or 0
        safe = actual_count >= min_n
        
        return {
            "safe": safe,
            "actual_count": actual_count,
            "required_count": min_n,
            "team_size": participation.team_size,
            "participation_pct": participation.participation_pct,
            "message": f"Not enough responses ({actual_count}/{min_n})" if not safe else None
        }
        
    except Exception as e:
        logger.error(f"Error getting safe response count: {str(e)}")
        return {
            "safe": False,
            "actual_count": 0,
            "required_count": 4,  # Default
            "message": "Error checking response count"
        }

def safe_percentage(
    numerator: int,
    denominator: int,
    min_n: int = 4
) -> Optional[float]:
    """Calculate safe percentage with min-n check"""
    if denominator < min_n:
        return None
    
    if denominator == 0:
        return 0.0
    
    return (numerator / denominator) * 100
