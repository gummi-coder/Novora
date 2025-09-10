"""
Manager Dashboard Data Contracts with Team-Scoped Access
"""
from fastapi import APIRouter, HTTPException, Depends, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, date

from app.core.database import get_db
from app.api.deps import get_current_user
from app.core.min_n_guard import (
    enforce_min_n, safe_aggregate_response, get_safe_team_list
)
from app.core.privacy import validate_team_access
from app.models.base import User, Team, Survey
from app.models.advanced import UserTeam
from app.models.responses import NumericResponse, Comment
from app.models.summaries import (
    ParticipationSummary, DriverSummary, SentimentSummary,
    OrgDriverTrends, ReportsCache, CommentNLP
)
from app.models.advanced import DashboardAlert
from app.services.summary_service import SummaryService
from app.services.alert_evaluator import AlertEvaluator
from app.services.audit_service import AuditService
from app.services.cache_service import cache_service

router = APIRouter()

# Manager Overview KPIs
@router.get("/overview/kpis")
async def get_manager_overview_kpis(
    team_id: str = Query(..., description="Team ID"),
    survey_id: Optional[str] = Query(None, description="Survey ID (defaults to latest)"),
    period: str = Query("last", description="Period: last, current, previous"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get manager overview KPIs for their team with min-n enforcement"""
    try:
        # Validate team access
        if not validate_team_access(current_user.id, team_id, db):
            raise HTTPException(status_code=403, detail="Access denied to team data")
        
        # Get survey ID
        if not survey_id:
            survey = db.query(Survey).join(NumericResponse).filter(
                NumericResponse.team_id == team_id
            ).order_by(desc(Survey.created_at)).first()
            if not survey:
                raise HTTPException(status_code=404, detail="No surveys found for team")
            survey_id = str(survey.id)
        
        # Check min-n requirement
        try:
            enforce_min_n(current_user.company_id, team_id, survey_id, db)
        except:
            return {
                "team_id": team_id,
                "survey_id": survey_id,
                "team_avg_score": 0,
                "team_enps": 0,
                "participation": 0,
                "active_alerts": 0,
                "safe": False,
                "message": "Not enough responses to show data safely"
            }
        
        # Get team data
        participation = db.query(ParticipationSummary).filter(
            ParticipationSummary.survey_id == survey_id,
            ParticipationSummary.team_id == team_id
        ).first()
        
        drivers = db.query(DriverSummary).filter(
            DriverSummary.survey_id == survey_id,
            DriverSummary.team_id == team_id
        ).all()
        
        # Calculate team average score
        total_scores = 0
        total_responses = 0
        team_enps = 0
        
        for driver in drivers:
            response_count = db.query(NumericResponse).filter(
                NumericResponse.survey_id == survey_id,
                NumericResponse.team_id == team_id,
                NumericResponse.driver_id == driver.driver_id
            ).count()
            
            if response_count > 0:
                total_scores += driver.avg_score * response_count
                total_responses += response_count
                
                # Calculate eNPS for this driver
                driver_enps = driver.promoters_pct - driver.detractors_pct
                team_enps += driver_enps * response_count
        
        team_avg_score = total_scores / total_responses if total_responses > 0 else 0
        team_enps = team_enps / total_responses if total_responses > 0 else 0
        
        # Get active alerts
        active_alerts = db.query(DashboardAlert).filter(
            DashboardAlert.team_id == team_id,
            DashboardAlert.status.in_(["open", "acknowledged"])
        ).count()
        
        return {
            "team_id": team_id,
            "survey_id": survey_id,
            "team_avg_score": round(team_avg_score, 1),
            "team_enps": round(team_enps, 1),
            "participation": round(participation.participation_pct, 1) if participation else 0,
            "active_alerts": active_alerts,
            "total_responses": total_responses,
            "safe": True,
            "message": None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving manager KPIs: {str(e)}")

@router.get("/overview/trend")
async def get_manager_overview_trend(
    team_id: str = Query(..., description="Team ID"),
    months: int = Query(6, description="Number of months to include"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get manager overview trend data for their team"""
    try:
        # Validate team access
        if not validate_team_access(current_user.id, team_id, db):
            raise HTTPException(status_code=403, detail="Access denied to team data")
        
        # Get surveys for the last N months
        cutoff_date = datetime.utcnow() - timedelta(days=30 * months)
        surveys = db.query(Survey).join(NumericResponse).filter(
            NumericResponse.team_id == team_id,
            Survey.created_at >= cutoff_date,
            Survey.status.in_(["active", "closed"])
        ).order_by(Survey.created_at).all()
        
        trend_data = []
        
        for survey in surveys:
            # Check min-n for this survey
            try:
                enforce_min_n(current_user.company_id, team_id, str(survey.id), db)
            except:
                continue
            
            # Get participation data
            participation = db.query(ParticipationSummary).filter(
                ParticipationSummary.survey_id == survey.id,
                ParticipationSummary.team_id == team_id
            ).first()
            
            if not participation:
                continue
            
            # Calculate average score
            drivers = db.query(DriverSummary).filter(
                DriverSummary.survey_id == survey.id,
                DriverSummary.team_id == team_id
            ).all()
            
            total_scores = 0
            total_responses = 0
            
            for driver in drivers:
                response_count = db.query(NumericResponse).filter(
                    NumericResponse.survey_id == survey.id,
                    NumericResponse.team_id == team_id,
                    NumericResponse.driver_id == driver.driver_id
                ).count()
                
                if response_count > 0:
                    total_scores += driver.avg_score * response_count
                    total_responses += response_count
            
            avg_score = total_scores / total_responses if total_responses > 0 else 0
            
            trend_data.append({
                "month": survey.created_at.strftime("%Y-%m"),
                "survey_id": str(survey.id),
                "avg_score": round(avg_score, 1),
                "participation": round(participation.participation_pct, 1),
                "total_responses": total_responses
            })
        
        return {
            "team_id": team_id,
            "trend_data": trend_data,
            "months": months,
            "safe": len(trend_data) > 0,
            "message": None if len(trend_data) > 0 else "No sufficient data for trend analysis"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving trend data: {str(e)}")

# Manager Team Trends - Missing Endpoints
@router.get("/trend/overall")
async def get_manager_trend_overall(
    team_id: str = Query(..., description="Team ID"),
    months: int = Query(6, description="Number of months to include"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Get overall team trend for manager"""
    try:
        # Validate team access
        if not validate_team_access(current_user.id, team_id, db):
            raise HTTPException(status_code=403, detail="Access denied to team data")
        
        # Get trends from org_driver_trends
        cutoff_date = datetime.utcnow() - timedelta(days=30 * months)
        trends = db.query(OrgDriverTrends).filter(
            OrgDriverTrends.team_id == team_id,
            OrgDriverTrends.period_month >= cutoff_date.date()
        ).order_by(OrgDriverTrends.period_month).all()
        
        # Group by month and calculate overall average
        monthly_data = {}
        for trend in trends:
            month_key = trend.period_month.strftime("%Y-%m")
            if month_key not in monthly_data:
                monthly_data[month_key] = {"scores": [], "count": 0}
            
            monthly_data[month_key]["scores"].append(trend.avg_score)
            monthly_data[month_key]["count"] += 1
        
        trend_data = []
        for month, data in monthly_data.items():
            avg_score = sum(data["scores"]) / len(data["scores"]) if data["scores"] else 0
            trend_data.append({
                "month": month,
                "avg_score": round(avg_score, 1),
                "drivers_count": data["count"]
            })
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=current_user.company_id,
            action_type="manager_trend_overall_accessed",
            resource_type="dashboard",
            resource_id="manager_trend_overall",
            description=f"Manager accessed overall trend for team {team_id}",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "team_id": team_id,
            "trend_data": trend_data,
            "months": months,
            "safe": len(trend_data) > 0,
            "message": None if len(trend_data) > 0 else "No sufficient data for trend analysis"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving overall trend: {str(e)}")

@router.get("/trend/drivers")
async def get_manager_trend_drivers(
    team_id: str = Query(..., description="Team ID"),
    months: int = Query(6, description="Number of months to include"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Get driver trends for manager"""
    try:
        # Validate team access
        if not validate_team_access(current_user.id, team_id, db):
            raise HTTPException(status_code=403, detail="Access denied to team data")
        
        # Get trends from org_driver_trends
        cutoff_date = datetime.utcnow() - timedelta(days=30 * months)
        trends = db.query(OrgDriverTrends).filter(
            OrgDriverTrends.team_id == team_id,
            OrgDriverTrends.period_month >= cutoff_date.date()
        ).order_by(OrgDriverTrends.period_month).all()
        
        # Group by driver
        driver_trends = {}
        for trend in trends:
            driver_id = str(trend.driver_id)
            if driver_id not in driver_trends:
                driver_trends[driver_id] = []
            
            driver_trends[driver_id].append({
                "month": trend.period_month.strftime("%Y-%m"),
                "avg_score": trend.avg_score
            })
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=current_user.company_id,
            action_type="manager_trend_drivers_accessed",
            resource_type="dashboard",
            resource_id="manager_trend_drivers",
            description=f"Manager accessed driver trends for team {team_id}",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "team_id": team_id,
            "driver_trends": driver_trends,
            "months": months,
            "safe": len(driver_trends) > 0,
            "message": None if len(driver_trends) > 0 else "No sufficient data for driver trends"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving driver trends: {str(e)}")

@router.get("/trend/snapshot")
async def get_manager_trend_snapshot(
    team_id: str = Query(..., description="Team ID"),
    survey_id: Optional[str] = Query(None, description="Survey ID (defaults to current)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Get current snapshot with deltas for manager"""
    try:
        # Validate team access
        if not validate_team_access(current_user.id, team_id, db):
            raise HTTPException(status_code=403, detail="Access denied to team data")
        
        # Get survey ID
        if not survey_id:
            survey = db.query(Survey).join(NumericResponse).filter(
                NumericResponse.team_id == team_id
            ).order_by(desc(Survey.created_at)).first()
            if not survey:
                raise HTTPException(status_code=404, detail="No surveys found for team")
            survey_id = str(survey.id)
        
        # Check min-n requirement
        try:
            enforce_min_n(current_user.company_id, team_id, survey_id, db)
        except:
            return {
                "team_id": team_id,
                "survey_id": survey_id,
                "drivers": [],
                "safe": False,
                "message": "Not enough responses to show data safely"
            }
        
        # Get driver data
        drivers = db.query(DriverSummary).filter(
            DriverSummary.survey_id == survey_id,
            DriverSummary.team_id == team_id
        ).all()
        
        driver_data = []
        for driver in drivers:
            driver_data.append({
                "driver_id": str(driver.driver_id),
                "avg_score": round(driver.avg_score, 1),
                "detractors_pct": round(driver.detractors_pct, 1),
                "passives_pct": round(driver.passives_pct, 1),
                "promoters_pct": round(driver.promoters_pct, 1),
                "delta_vs_prev": round(driver.delta_vs_prev, 1) if driver.delta_vs_prev else 0
            })
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=current_user.company_id,
            action_type="manager_trend_snapshot_accessed",
            resource_type="dashboard",
            resource_id="manager_trend_snapshot",
            description=f"Manager accessed trend snapshot for team {team_id}",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "team_id": team_id,
            "survey_id": survey_id,
            "drivers": driver_data,
            "safe": True,
            "message": None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving snapshot: {str(e)}")

# Manager Feedback Endpoints
@router.get("/feedback/distribution")
async def get_manager_feedback_distribution(
    team_id: str = Query(..., description="Team ID"),
    survey_id: Optional[str] = Query(None, description="Survey ID (defaults to current)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Get feedback distribution for manager's team"""
    try:
        # Validate team access
        if not validate_team_access(current_user.id, team_id, db):
            raise HTTPException(status_code=403, detail="Access denied to team data")
        
        # Get survey ID
        if not survey_id:
            survey = db.query(Survey).join(NumericResponse).filter(
                NumericResponse.team_id == team_id
            ).order_by(desc(Survey.created_at)).first()
            if not survey:
                raise HTTPException(status_code=404, detail="No surveys found for team")
            survey_id = str(survey.id)
        
        # Check min-n requirement
        try:
            enforce_min_n(current_user.company_id, team_id, survey_id, db)
        except:
            return {
                "team_id": team_id,
                "survey_id": survey_id,
                "drivers": [],
                "safe": False,
                "message": "Not enough responses to show data safely"
            }
        
        # Get driver data
        drivers = db.query(DriverSummary).filter(
            DriverSummary.survey_id == survey_id,
            DriverSummary.team_id == team_id
        ).all()
        
        driver_data = []
        for driver in drivers:
            driver_data.append({
                "driver_id": str(driver.driver_id),
                "avg_score": round(driver.avg_score, 1),
                "distribution": {
                    "detractors": round(driver.detractors_pct, 1),
                    "passives": round(driver.passives_pct, 1),
                    "promoters": round(driver.promoters_pct, 1)
                },
                "delta_vs_prev": round(driver.delta_vs_prev, 1) if driver.delta_vs_prev else 0
            })
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=current_user.company_id,
            action_type="manager_feedback_distribution_accessed",
            resource_type="dashboard",
            resource_id="manager_feedback_distribution",
            description=f"Manager accessed feedback distribution for team {team_id}",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "team_id": team_id,
            "survey_id": survey_id,
            "drivers": driver_data,
            "safe": True,
            "message": None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving feedback distribution: {str(e)}")

@router.get("/feedback/sentiment")
async def get_manager_feedback_sentiment(
    team_id: str = Query(..., description="Team ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Get sentiment summary for manager's team"""
    try:
        # Validate team access
        if not validate_team_access(current_user.id, team_id, db):
            raise HTTPException(status_code=403, detail="Access denied to team data")
        
        # Get latest survey
        survey = db.query(Survey).join(NumericResponse).filter(
            NumericResponse.team_id == team_id
        ).order_by(desc(Survey.created_at)).first()
        
        if not survey:
            raise HTTPException(status_code=404, detail="No surveys found for team")
        
        # Check min-n requirement
        try:
            enforce_min_n(current_user.company_id, team_id, str(survey.id), db)
        except:
            return {
                "team_id": team_id,
                "sentiment": None,
                "safe": False,
                "message": "Not enough responses to show data safely"
            }
        
        # Get sentiment data
        sentiment = db.query(SentimentSummary).filter(
            SentimentSummary.survey_id == survey.id,
            SentimentSummary.team_id == team_id
        ).first()
        
        if not sentiment:
            return {
                "team_id": team_id,
                "sentiment": None,
                "safe": True,
                "message": "No sentiment data available"
            }
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=current_user.company_id,
            action_type="manager_feedback_sentiment_accessed",
            resource_type="dashboard",
            resource_id="manager_feedback_sentiment",
            description=f"Manager accessed feedback sentiment for team {team_id}",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "team_id": team_id,
            "sentiment": {
                "positive": round(sentiment.pos_pct, 1),
                "negative": round(sentiment.neg_pct, 1),
                "neutral": round(sentiment.neu_pct, 1),
                "delta_vs_prev": round(sentiment.delta_vs_prev, 1) if sentiment.delta_vs_prev else 0
            },
            "safe": True,
            "message": None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving sentiment: {str(e)}")

@router.get("/feedback/themes")
async def get_manager_feedback_themes(
    team_id: str = Query(..., description="Team ID"),
    survey_id: Optional[str] = Query(None, description="Survey ID (defaults to current)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Get feedback themes for manager's team"""
    try:
        # Validate team access
        if not validate_team_access(current_user.id, team_id, db):
            raise HTTPException(status_code=403, detail="Access denied to team data")
        
        # Get survey ID
        if not survey_id:
            survey = db.query(Survey).join(NumericResponse).filter(
                NumericResponse.team_id == team_id
            ).order_by(desc(Survey.created_at)).first()
            if not survey:
                raise HTTPException(status_code=404, detail="No surveys found for team")
            survey_id = str(survey.id)
        
        # Check min-n requirement
        try:
            enforce_min_n(current_user.company_id, team_id, survey_id, db)
        except:
            return {
                "team_id": team_id,
                "survey_id": survey_id,
                "themes": [],
                "safe": False,
                "message": "Not enough responses to show data safely"
            }
        
        # Get comments with NLP analysis
        comments_with_nlp = db.query(Comment, CommentNLP).join(CommentNLP).filter(
            Comment.survey_id == survey_id,
            Comment.team_id == team_id
        ).all()
        
        # Aggregate themes
        theme_counts = {}
        sentiment_by_theme = {}
        
        for comment, nlp in comments_with_nlp:
            if nlp.themes:
                for theme in nlp.themes:
                    if theme not in theme_counts:
                        theme_counts[theme] = 0
                        sentiment_by_theme[theme] = {"positive": 0, "negative": 0, "neutral": 0}
                    
                    theme_counts[theme] += 1
                    
                    if nlp.sentiment == '+':
                        sentiment_by_theme[theme]["positive"] += 1
                    elif nlp.sentiment == '-':
                        sentiment_by_theme[theme]["negative"] += 1
                    else:
                        sentiment_by_theme[theme]["neutral"] += 1
        
        # Format themes data
        themes_data = []
        for theme, count in theme_counts.items():
            sentiment_data = sentiment_by_theme[theme]
            total = sum(sentiment_data.values())
            
            themes_data.append({
                "theme": theme,
                "count": count,
                "sentiment_breakdown": {
                    "positive": round(sentiment_data["positive"] / total * 100, 1) if total > 0 else 0,
                    "negative": round(sentiment_data["negative"] / total * 100, 1) if total > 0 else 0,
                    "neutral": round(sentiment_data["neutral"] / total * 100, 1) if total > 0 else 0
                }
            })
        
        # Sort by count
        themes_data.sort(key=lambda x: x["count"], reverse=True)
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=current_user.company_id,
            action_type="manager_feedback_themes_accessed",
            resource_type="dashboard",
            resource_id="manager_feedback_themes",
            description=f"Manager accessed feedback themes for team {team_id}",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "team_id": team_id,
            "survey_id": survey_id,
            "themes": themes_data,
            "total_comments": len(comments_with_nlp),
            "safe": True,
            "message": None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving feedback themes: {str(e)}")

# Manager Engagement Endpoints
@router.get("/engagement/kpis")
async def get_manager_engagement_kpis(
    team_id: str = Query(..., description="Team ID"),
    survey_id: Optional[str] = Query(None, description="Survey ID (defaults to current)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Get engagement KPIs for manager's team"""
    try:
        # Validate team access
        if not validate_team_access(current_user.id, team_id, db):
            raise HTTPException(status_code=403, detail="Access denied to team data")
        
        # Get survey ID
        if not survey_id:
            survey = db.query(Survey).join(NumericResponse).filter(
                NumericResponse.team_id == team_id
            ).order_by(desc(Survey.created_at)).first()
            if not survey:
                raise HTTPException(status_code=404, detail="No surveys found for team")
            survey_id = str(survey.id)
        
        # Check min-n requirement
        try:
            enforce_min_n(current_user.company_id, team_id, survey_id, db)
        except:
            return {
                "team_id": team_id,
                "survey_id": survey_id,
                "total_employees": 0,
                "total_responses": 0,
                "participation_rate": 0,
                "avg_response_time": 0,
                "safe": False,
                "message": "Not enough responses to show data safely"
            }
        
        # Get participation data
        participation = db.query(ParticipationSummary).filter(
            ParticipationSummary.survey_id == survey_id,
            ParticipationSummary.team_id == team_id
        ).first()
        
        if not participation:
            return {
                "team_id": team_id,
                "survey_id": survey_id,
                "total_employees": 0,
                "total_responses": 0,
                "participation_rate": 0,
                "avg_response_time": 0,
                "safe": True,
                "message": "No participation data available"
            }
        
        # Calculate average response time (mock data for now)
        avg_response_time = 2.5  # days
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=current_user.company_id,
            action_type="manager_engagement_kpis_accessed",
            resource_type="dashboard",
            resource_id="manager_engagement_kpis",
            description=f"Manager accessed engagement KPIs for team {team_id}",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "team_id": team_id,
            "survey_id": survey_id,
            "total_employees": participation.team_size,
            "total_responses": participation.respondents,
            "participation_rate": round(participation.participation_pct, 1),
            "avg_response_time": avg_response_time,
            "delta_pct": round(participation.delta_pct, 1) if participation.delta_pct else 0,
            "safe": True,
            "message": None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving engagement KPIs: {str(e)}")

@router.get("/engagement/trend")
async def get_manager_engagement_trend(
    team_id: str = Query(..., description="Team ID"),
    months: int = Query(6, description="Number of months to include"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Get engagement trend for manager's team"""
    try:
        # Validate team access
        if not validate_team_access(current_user.id, team_id, db):
            raise HTTPException(status_code=403, detail="Access denied to team data")
        
        # Get surveys for the last N months
        cutoff_date = datetime.utcnow() - timedelta(days=30 * months)
        surveys = db.query(Survey).join(NumericResponse).filter(
            NumericResponse.team_id == team_id,
            Survey.created_at >= cutoff_date,
            Survey.status.in_(["active", "closed"])
        ).order_by(Survey.created_at).all()
        
        trend_data = []
        
        for survey in surveys:
            # Check min-n for this survey
            try:
                enforce_min_n(current_user.company_id, team_id, str(survey.id), db)
            except:
                continue
            
            # Get participation data
            participation = db.query(ParticipationSummary).filter(
                ParticipationSummary.survey_id == survey.id,
                ParticipationSummary.team_id == team_id
            ).first()
            
            if not participation:
                continue
            
            trend_data.append({
                "month": survey.created_at.strftime("%Y-%m"),
                "survey_id": str(survey.id),
                "participation_rate": round(participation.participation_pct, 1),
                "total_responses": participation.respondents,
                "team_size": participation.team_size
            })
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=current_user.company_id,
            action_type="manager_engagement_trend_accessed",
            resource_type="dashboard",
            resource_id="manager_engagement_trend",
            description=f"Manager accessed engagement trend for team {team_id}",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "team_id": team_id,
            "trend_data": trend_data,
            "months": months,
            "safe": len(trend_data) > 0,
            "message": None if len(trend_data) > 0 else "No sufficient data for trend analysis"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving engagement trend: {str(e)}")

# Manager Reports Endpoints
@router.get("/reports/digest")
async def get_manager_reports_digest(
    team_id: str = Query(..., description="Team ID"),
    period: str = Query(..., description="Period in YYYY-MM format"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Get reports digest for manager's team"""
    try:
        # Validate team access
        if not validate_team_access(current_user.id, team_id, db):
            raise HTTPException(status_code=403, detail="Access denied to team data")
        
        # Parse period
        try:
            period_start = datetime.strptime(period, "%Y-%m").date()
            period_end = (period_start.replace(month=period_start.month + 1) - timedelta(days=1)) if period_start.month < 12 else period_start.replace(year=period_start.year + 1, month=1) - timedelta(days=1)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid period format. Use YYYY-MM")
        
        # Get cached report
        summary_service = SummaryService(db)
        scope = f"team:{team_id}"
        cached_report = summary_service.get_reports_cache(
            current_user.company_id, scope, period_start, period_end
        )
        
        if not cached_report:
            # Build digest on the fly
            digest_data = build_team_digest_data(
                current_user.company_id, team_id, period_start, period_end, db
            )
            
            # Cache the digest
            summary_service.cache_report_data(
                current_user.company_id, scope, period_start, period_end, digest_data
            )
            
            # Log audit
            audit_service = AuditService(db)
            audit_service.log_action(
                user_id=current_user.id,
                org_id=current_user.company_id,
                action_type="manager_reports_digest_accessed",
                resource_type="dashboard",
                resource_id="manager_reports_digest",
                description=f"Manager accessed reports digest for team {team_id}, period {period}",
                ip_address=request.client.host if request else None,
                user_agent=request.headers.get("user-agent") if request else None
            )
            
            return {
                "team_id": team_id,
                "period": period,
                "data": digest_data,
                "cached": False,
                "safe": True,
                "message": None
            }
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=current_user.company_id,
            action_type="manager_reports_digest_accessed",
            resource_type="dashboard",
            resource_id="manager_reports_digest",
            description=f"Manager accessed cached reports digest for team {team_id}, period {period}",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "team_id": team_id,
            "period": period,
            "data": cached_report.payload_json,
            "cached": True,
            "created_at": cached_report.created_at.isoformat(),
            "safe": True,
            "message": None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving reports digest: {str(e)}")

def build_team_digest_data(org_id: str, team_id: str, period_start: date, period_end: date, db: Session) -> Dict[str, Any]:
    """Build team digest data for reports"""
    # Get surveys in period for this team
    surveys = db.query(Survey).join(NumericResponse).filter(
        NumericResponse.team_id == team_id,
        Survey.created_at >= period_start,
        Survey.created_at <= period_end,
        Survey.status.in_(["active", "closed"])
    ).all()
    
    if not surveys:
        return {"error": "No surveys found in period for team"}
    
    # Get latest survey for detailed data
    latest_survey = max(surveys, key=lambda s: s.created_at)
    
    # Check min-n for latest survey
    try:
        from app.core.min_n_guard import enforce_min_n
        enforce_min_n(org_id, team_id, str(latest_survey.id), db)
    except:
        return {"error": "Not enough responses for safe reporting"}
    
    # Get team data
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        return {"error": "Team not found"}
    
    participation = db.query(ParticipationSummary).filter(
        ParticipationSummary.survey_id == latest_survey.id,
        ParticipationSummary.team_id == team_id
    ).first()
    
    # Get driver data
    drivers = db.query(DriverSummary).filter(
        DriverSummary.survey_id == latest_survey.id,
        DriverSummary.team_id == team_id
    ).all()
    
    # Get sentiment data
    sentiment = db.query(SentimentSummary).filter(
        SentimentSummary.survey_id == latest_survey.id,
        SentimentSummary.team_id == team_id
    ).first()
    
    # Build digest
    digest = {
        "period": f"{period_start.strftime('%Y-%m')}",
        "team_id": str(team_id),
        "team_name": team.name,
        "survey_count": len(surveys),
        "latest_survey": {
            "id": str(latest_survey.id),
            "title": latest_survey.title,
            "created_at": latest_survey.created_at.isoformat()
        },
        "participation": {
            "respondents": participation.respondents if participation else 0,
            "team_size": participation.team_size if participation else 0,
            "participation_pct": participation.participation_pct if participation else 0
        },
        "drivers": [
            {
                "driver_id": str(d.driver_id),
                "avg_score": d.avg_score,
                "detractors_pct": d.detractors_pct,
                "promoters_pct": d.promoters_pct
            }
            for d in drivers
        ],
        "sentiment": {
            "positive": sentiment.pos_pct if sentiment else 0,
            "negative": sentiment.neg_pct if sentiment else 0,
            "neutral": sentiment.neu_pct if sentiment else 0
        } if sentiment else None
    }
    
    return digest
