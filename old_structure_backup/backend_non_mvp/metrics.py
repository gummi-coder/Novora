"""
Metrics calculation service for Novora
"""
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
import math

from app.models.base import Survey, Response, Question, Answer
from app.models.advanced import TeamAnalytics, DashboardAlert


def calculate_enps(responses: List[int]) -> int:
    """
    Calculate Employee Net Promoter Score (eNPS).

    Args:
        responses (list[int]): List of survey responses, each from 0–10.

    Returns:
        int: eNPS score ranging from -100 to +100.
    """
    if not responses:
        return 0  # Avoid division by zero

    total = len(responses)
    promoters = sum(1 for r in responses if r >= 9)
    detractors = sum(1 for r in responses if r <= 6)

    promoter_pct = promoters / total * 100
    detractor_pct = detractors / total * 100

    return round(promoter_pct - detractor_pct)


def get_enps_breakdown(responses: List[int]) -> Dict[str, float]:
    """
    Get eNPS breakdown (promoters, passives, detractors percentages).
    
    Args:
        responses (list[int]): List of survey responses, each from 0–10.
        
    Returns:
        dict: Breakdown with promoter_pct, passive_pct, detractor_pct
    """
    if not responses:
        return {"promoter_pct": 0, "passive_pct": 0, "detractor_pct": 0}
    
    total = len(responses)
    promoters = sum(1 for r in responses if r >= 9)
    detractors = sum(1 for r in responses if r <= 6)
    passives = total - promoters - detractors
    
    return {
        "promoter_pct": round((promoters / total) * 100, 1),
        "passive_pct": round((passives / total) * 100, 1),
        "detractor_pct": round((detractors / total) * 100, 1)
    }


def get_enps_status(enps_score: int) -> Tuple[str, str]:
    """
    Get eNPS status and color based on score.
    
    Args:
        enps_score (int): eNPS score from -100 to +100
        
    Returns:
        tuple: (status, color_class)
    """
    if enps_score >= 30:
        return "Excellent", "text-green-600 bg-green-100"
    elif enps_score >= 0:
        return "Good", "text-yellow-600 bg-yellow-100"
    else:
        return "Needs Improvement", "text-red-600 bg-red-100"


def calculate_survey_enps(db: Session, survey_id: int) -> Optional[Dict]:
    """
    Calculate eNPS for a specific survey.
    
    Args:
        db (Session): Database session
        survey_id (int): Survey ID
        
    Returns:
        dict: eNPS data with score, breakdown, and metadata
    """
    # Get all eNPS questions for this survey
    enps_questions = db.query(Question).filter(
        Question.survey_id == survey_id,
        Question.category == 'enps'
    ).all()
    
    if not enps_questions:
        return None
    
    # Get all responses for eNPS questions
    responses = []
    for question in enps_questions:
        answers = db.query(Answer).filter(
            Answer.question_id == question.id,
            Answer.value.isnot(None)
        ).all()
        
        for answer in answers:
            try:
                score = int(float(answer.value))
                if 0 <= score <= 10:
                    responses.append(score)
            except (ValueError, TypeError):
                continue
    
    if not responses:
        return None
    
    # Calculate eNPS
    enps_score = calculate_enps(responses)
    breakdown = get_enps_breakdown(responses)
    status, color_class = get_enps_status(enps_score)
    
    return {
        "score": enps_score,
        "breakdown": breakdown,
        "status": status,
        "color_class": color_class,
        "response_count": len(responses),
        "question_count": len(enps_questions)
    }


def calculate_team_enps(db: Session, team_id: int, days_back: int = 90) -> Optional[Dict]:
    """
    Calculate eNPS for a team over a time period.
    
    Args:
        db (Session): Database session
        team_id (int): Team ID
        days_back (int): Number of days to look back
        
    Returns:
        dict: Team eNPS data with current and trend information
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days_back)
    
    # Get all surveys for this team in the time period
    surveys = db.query(Survey).filter(
        Survey.team_id == team_id,
        Survey.created_at >= cutoff_date
    ).all()
    
    if not surveys:
        return None
    
    # Calculate eNPS for each survey
    survey_enps_scores = []
    all_responses = []
    
    for survey in surveys:
        enps_data = calculate_survey_enps(db, survey.id)
        if enps_data:
            survey_enps_scores.append({
                "survey_id": survey.id,
                "score": enps_data["score"],
                "date": survey.created_at,
                "response_count": enps_data["response_count"]
            })
            # Collect all responses for overall calculation
            # (This would need to be implemented based on your data structure)
    
    if not survey_enps_scores:
        return None
    
    # Calculate current eNPS (average of recent surveys)
    current_enps = sum(s["score"] for s in survey_enps_scores) / len(survey_enps_scores)
    
    # Calculate trend (compare first half vs second half of period)
    mid_point = len(survey_enps_scores) // 2
    if mid_point > 0:
        first_half = survey_enps_scores[:mid_point]
        second_half = survey_enps_scores[mid_point:]
        
        first_avg = sum(s["score"] for s in first_half) / len(first_half)
        second_avg = sum(s["score"] for s in second_half) / len(second_half)
        trend = second_avg - first_avg
    else:
        trend = 0
    
    status, color_class = get_enps_status(round(current_enps))
    
    return {
        "current_score": round(current_enps),
        "trend": round(trend, 1),
        "trend_direction": "up" if trend > 0 else "down" if trend < 0 else "stable",
        "status": status,
        "color_class": color_class,
        "survey_count": len(survey_enps_scores),
        "total_responses": sum(s["response_count"] for s in survey_enps_scores),
        "survey_scores": survey_enps_scores
    }


def check_enps_alerts(db: Session, team_id: int, current_enps: int) -> List[str]:
    """
    Check for eNPS alerts based on score changes.
    
    Args:
        db (Session): Database session
        team_id (int): Team ID
        current_enps (int): Current eNPS score
        
    Returns:
        list: List of alert messages
    """
    alerts = []
    
    # Get previous eNPS score (from last month)
    last_month = datetime.utcnow() - timedelta(days=30)
    previous_analytics = db.query(TeamAnalytics).filter(
        TeamAnalytics.team_id == team_id,
        TeamAnalytics.calculated_at >= last_month
    ).order_by(TeamAnalytics.calculated_at.desc()).first()
    
    if previous_analytics and hasattr(previous_analytics, 'enps_score'):
        previous_enps = previous_analytics.enps_score
        enps_change = current_enps - previous_enps
        
        # Alert for significant drops
        if enps_change <= -10:
            alerts.append(f"eNPS dropped by {abs(enps_change)} points (from {previous_enps} to {current_enps})")
        
        # Alert for very low scores
        if current_enps < -20:
            alerts.append(f"eNPS is critically low at {current_enps}")
    
    return alerts


def store_enps_analytics(db: Session, team_id: int, enps_data: Dict):
    """
    Store eNPS analytics in the database.
    
    Args:
        db (Session): Database session
        team_id (int): Team ID
        enps_data (dict): eNPS calculation results
    """
    # Create or update team analytics
    analytics = TeamAnalytics(
        team_id=team_id,
        survey_id=None,  # This would be set if calculating for specific survey
        avg_score=enps_data["current_score"] / 10,  # Convert to 0-10 scale
        score_change=enps_data["trend"] / 10,  # Convert to 0-10 scale
        response_count=enps_data["total_responses"],
        calculated_at=datetime.utcnow(),
        # eNPS-specific fields
        enps_score=enps_data["current_score"],
        enps_promoter_pct=enps_data.get("breakdown", {}).get("promoter_pct", 0),
        enps_passive_pct=enps_data.get("breakdown", {}).get("passive_pct", 0),
        enps_detractor_pct=enps_data.get("breakdown", {}).get("detractor_pct", 0),
        enps_response_count=enps_data["total_responses"]
    )
    
    db.add(analytics)
    db.commit()
    
    # Check for alerts
    alerts = check_enps_alerts(db, team_id, enps_data["current_score"])
    
    # Create dashboard alerts if needed
    for alert_message in alerts:
        alert = DashboardAlert(
            company_id=team_id,  # This would need to be the actual company ID
            alert_type="enps_drop",
            message=alert_message,
            severity="medium" if "critically low" in alert_message else "high",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(alert)
    
    db.commit()
