"""
Admin Dashboard Data Contracts with Min-n Guard and RBAC
"""
from fastapi import APIRouter, HTTPException, Depends, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, date

from app.core.database import get_db
from app.api.deps import get_current_user
from app.core.min_n_guard import (
    enforce_min_n, safe_aggregate_response, filter_unsafe_teams,
    get_safe_team_list, detect_hotspots, detect_recurring_risks
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
from app.services.audit_service import AuditService
from app.services.cache_service import cache_service

router = APIRouter()

# Admin Overview KPIs
@router.get("/overview/kpis")
async def get_admin_overview_kpis(
    org_id: str = Query(..., description="Organization ID"),
    period: str = Query("last", description="Period: last, current, previous"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Get admin overview KPIs with min-n enforcement"""
    try:
        # Admin access validation
        if current_user.role != 'admin' or current_user.company_id != org_id:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Check cache first
        cached_data = cache_service.get_kpis_cache(org_id, None, "latest")
        if cached_data:
            return cached_data
        
        # Get latest survey
        survey = db.query(Survey).filter(
            Survey.creator_id == org_id,
            Survey.status.in_(["active", "closed"])
        ).order_by(desc(Survey.created_at)).first()
        
        if not survey:
            return {
                "org_id": org_id,
                "company_enps": 0,
                "avg_score": 0,
                "participation": 0,
                "active_alerts": 0,
                "total_teams": 0,
                "safe_teams_count": 0,
                "unsafe_teams_count": 0,
                "safe": False,
                "message": "No surveys found"
            }
        
        # Get safe teams list
        safe_teams, unsafe_teams = get_safe_team_list(org_id, str(survey.id), db)
        
        if not safe_teams:
            return {
                "org_id": org_id,
                "company_enps": 0,
                "avg_score": 0,
                "participation": 0,
                "active_alerts": 0,
                "total_teams": len(safe_teams) + len(unsafe_teams),
                "safe_teams_count": 0,
                "unsafe_teams_count": len(unsafe_teams),
                "safe": False,
                "message": "Not enough responses to show data safely"
            }
        
        # Calculate KPIs from safe teams only
        total_enps = 0
        total_score = 0
        total_participation = 0
        team_count = 0
        
        for team_id in safe_teams:
            try:
                # Get participation data
                participation = db.query(ParticipationSummary).filter(
                    ParticipationSummary.survey_id == str(survey.id),
                    ParticipationSummary.team_id == team_id
                ).first()
                
                if participation:
                    total_participation += participation.participation_pct
                    team_count += 1
                
                # Get driver data for eNPS and avg score
                drivers = db.query(DriverSummary).filter(
                    DriverSummary.survey_id == str(survey.id),
                    DriverSummary.team_id == team_id
                ).all()
                
                for driver in drivers:
                    # Calculate eNPS
                    driver_enps = driver.promoters_pct - driver.detractors_pct
                    total_enps += driver_enps
                    total_score += driver.avg_score
                
            except Exception as e:
                logger.error(f"Error processing team {team_id}: {str(e)}")
                continue
        
        # Calculate averages
        avg_enps = total_enps / len(safe_teams) if safe_teams else 0
        avg_score = total_score / len(safe_teams) if safe_teams else 0
        avg_participation = total_participation / team_count if team_count > 0 else 0
        
        # Get active alerts
        active_alerts = db.query(DashboardAlert).filter(
            DashboardAlert.org_id == org_id,
            DashboardAlert.status.in_(["open", "acknowledged"])
        ).count()
        
        # Prepare response data
        response_data = {
            "org_id": org_id,
            "survey_id": str(survey.id),
            "company_enps": round(avg_enps, 1),
            "avg_score": round(avg_score, 1),
            "participation": round(avg_participation, 1),
            "active_alerts": active_alerts,
            "total_teams": len(safe_teams) + len(unsafe_teams),
            "safe_teams_count": len(safe_teams),
            "unsafe_teams_count": len(unsafe_teams),
            "safe": True,
            "message": None
        }
        
        # Cache the response
        cache_service.set_kpis_cache(org_id, None, str(survey.id), response_data)
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=org_id,
            action_type="admin_overview_accessed",
            resource_type="dashboard",
            resource_id="overview_kpis",
            description="Admin accessed overview KPIs",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return response_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving admin KPIs: {str(e)}")

@router.get("/overview/trend")
async def get_admin_overview_trend(
    org_id: str = Query(..., description="Organization ID"),
    months: int = Query(6, description="Number of months to include"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Get admin overview trend data with min-n enforcement"""
    try:
        # Admin access validation
        if current_user.role != 'admin' or current_user.company_id != org_id:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Get surveys for the last N months
        cutoff_date = datetime.utcnow() - timedelta(days=30 * months)
        surveys = db.query(Survey).filter(
            Survey.creator_id == org_id,
            Survey.created_at >= cutoff_date,
            Survey.status.in_(["active", "closed"])
        ).order_by(Survey.created_at).all()
        
        trend_data = []
        
        for survey in surveys:
            # Get safe teams for this survey
            safe_teams, unsafe_teams = get_safe_team_list(org_id, str(survey.id), db)
            
            if not safe_teams:
                continue
            
            # Calculate averages from safe teams
            total_enps = 0
            total_score = 0
            total_participation = 0
            team_count = 0
            
            for team_id in safe_teams:
                try:
                    # Get participation data
                    participation = db.query(ParticipationSummary).filter(
                        ParticipationSummary.survey_id == str(survey.id),
                        ParticipationSummary.team_id == team_id
                    ).first()
                    
                    if participation:
                        total_participation += participation.participation_pct
                        team_count += 1
                    
                    # Get driver data
                    drivers = db.query(DriverSummary).filter(
                        DriverSummary.survey_id == str(survey.id),
                        DriverSummary.team_id == team_id
                    ).all()
                    
                    for driver in drivers:
                        driver_enps = driver.promoters_pct - driver.detractors_pct
                        total_enps += driver_enps
                        total_score += driver.avg_score
                        
                except Exception as e:
                    continue
            
            if team_count > 0:
                avg_enps = total_enps / len(safe_teams)
                avg_score = total_score / len(safe_teams)
                avg_participation = total_participation / team_count
                
                trend_data.append({
                    "month": survey.created_at.strftime("%Y-%m"),
                    "survey_id": str(survey.id),
                    "company_enps": round(avg_enps, 1),
                    "avg_score": round(avg_score, 1),
                    "participation": round(avg_participation, 1),
                    "safe_teams_count": len(safe_teams),
                    "unsafe_teams_count": len(unsafe_teams)
                })
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=org_id,
            action_type="admin_trend_accessed",
            resource_type="dashboard",
            resource_id="overview_trend",
            description="Admin accessed overview trend data",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "org_id": org_id,
            "trend_data": trend_data,
            "months": months,
            "safe": len(trend_data) > 0,
            "message": None if len(trend_data) > 0 else "No sufficient data for trend analysis"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving trend data: {str(e)}")

# Admin Team Trends
@router.get("/trends/heatmap")
async def get_team_trends_heatmap(
    org_id: str = Query(..., description="Organization ID"),
    survey_id: Optional[str] = Query(None, description="Survey ID (defaults to current)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Get team trends heatmap with min-n enforcement"""
    try:
        # Admin access validation
        if current_user.role != 'admin' or current_user.company_id != org_id:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Get survey ID
        if not survey_id:
            survey = db.query(Survey).filter(
                Survey.creator_id == org_id,
                Survey.status.in_(["active", "closed"])
            ).order_by(desc(Survey.created_at)).first()
            
            if not survey:
                raise HTTPException(status_code=404, detail="No surveys found")
            survey_id = str(survey.id)
        
        # Get safe teams
        safe_teams, unsafe_teams = get_safe_team_list(org_id, survey_id, db)
        
        # Get all teams for this org
        all_teams = db.query(Team).filter(Team.org_id == org_id).all()
        
        heatmap_data = []
        
        for team in all_teams:
            team_id = str(team.id)
            is_safe = team_id in safe_teams
            
            if is_safe:
                # Get driver data for safe teams
                drivers = db.query(DriverSummary).filter(
                    DriverSummary.survey_id == survey_id,
                    DriverSummary.team_id == team_id
                ).all()
                
                driver_scores = {}
                for driver in drivers:
                    driver_scores[str(driver.driver_id)] = {
                        "avg_score": round(driver.avg_score, 1),
                        "delta_vs_prev": round(driver.delta_vs_prev, 1) if driver.delta_vs_prev else 0
                    }
                
                heatmap_data.append({
                    "team_id": team_id,
                    "team_name": team.name,
                    "safe": True,
                    "driver_scores": driver_scores
                })
            else:
                # Include unsafe teams with no data
                heatmap_data.append({
                    "team_id": team_id,
                    "team_name": team.name,
                    "safe": False,
                    "driver_scores": {},
                    "message": "Not enough responses to show data safely"
                })
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=org_id,
            action_type="admin_heatmap_accessed",
            resource_type="dashboard",
            resource_id="trends_heatmap",
            description="Admin accessed team trends heatmap",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "org_id": org_id,
            "survey_id": survey_id,
            "heatmap_data": heatmap_data,
            "safe_teams_count": len(safe_teams),
            "unsafe_teams_count": len(unsafe_teams),
            "total_teams": len(all_teams),
            "safe": len(safe_teams) > 0,
            "message": None if len(safe_teams) > 0 else "No teams have sufficient responses"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving heatmap: {str(e)}")

# Admin Feedback
@router.get("/feedback/themes")
async def get_feedback_themes(
    org_id: str = Query(..., description="Organization ID"),
    survey_id: Optional[str] = Query(None, description="Survey ID (defaults to current)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Get feedback themes with min-n enforcement"""
    try:
        # Admin access validation
        if current_user.role != 'admin' or current_user.company_id != org_id:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Get survey ID
        if not survey_id:
            survey = db.query(Survey).filter(
                Survey.creator_id == org_id,
                Survey.status.in_(["active", "closed"])
            ).order_by(desc(Survey.created_at)).first()
            
            if not survey:
                raise HTTPException(status_code=404, detail="No surveys found")
            survey_id = str(survey.id)
        
        # Get safe teams
        safe_teams, unsafe_teams = get_safe_team_list(org_id, survey_id, db)
        
        if not safe_teams:
            return {
                "org_id": org_id,
                "survey_id": survey_id,
                "themes": [],
                "total_comments": 0,
                "safe": False,
                "message": "Not enough responses to show data safely"
            }
        
        # Get comments with NLP analysis for safe teams
        comments_with_nlp = db.query(Comment, CommentNLP).join(CommentNLP).filter(
            Comment.survey_id == survey_id,
            Comment.team_id.in_(safe_teams)
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
            org_id=org_id,
            action_type="admin_themes_accessed",
            resource_type="dashboard",
            resource_id="feedback_themes",
            description="Admin accessed feedback themes",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "org_id": org_id,
            "survey_id": survey_id,
            "themes": themes_data,
            "total_comments": len(comments_with_nlp),
            "safe_teams_count": len(safe_teams),
            "unsafe_teams_count": len(unsafe_teams),
            "safe": True,
            "message": None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving feedback themes: {str(e)}")

# Admin Engagement
@router.get("/engagement/kpis")
async def get_engagement_kpis(
    org_id: str = Query(..., description="Organization ID"),
    survey_id: Optional[str] = Query(None, description="Survey ID (defaults to current)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Get engagement KPIs with min-n enforcement"""
    try:
        # Admin access validation
        if current_user.role != 'admin' or current_user.company_id != org_id:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Get survey ID
        if not survey_id:
            survey = db.query(Survey).filter(
                Survey.creator_id == org_id,
                Survey.status.in_(["active", "closed"])
            ).order_by(desc(Survey.created_at)).first()
            
            if not survey:
                raise HTTPException(status_code=404, detail="No surveys found")
            survey_id = str(survey.id)
        
        # Get safe teams
        safe_teams, unsafe_teams = get_safe_team_list(org_id, survey_id, db)
        
        if not safe_teams:
            return {
                "org_id": org_id,
                "survey_id": survey_id,
                "total_employees": 0,
                "total_responses": 0,
                "participation_rate": 0,
                "safe": False,
                "message": "Not enough responses to show data safely"
            }
        
        # Calculate engagement KPIs from safe teams
        total_employees = 0
        total_responses = 0
        
        for team_id in safe_teams:
            participation = db.query(ParticipationSummary).filter(
                ParticipationSummary.survey_id == survey_id,
                ParticipationSummary.team_id == team_id
            ).first()
            
            if participation:
                total_employees += participation.team_size
                total_responses += participation.respondents
        
        participation_rate = (total_responses / total_employees * 100) if total_employees > 0 else 0
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=org_id,
            action_type="admin_engagement_accessed",
            resource_type="dashboard",
            resource_id="engagement_kpis",
            description="Admin accessed engagement KPIs",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "org_id": org_id,
            "survey_id": survey_id,
            "total_employees": total_employees,
            "total_responses": total_responses,
            "participation_rate": round(participation_rate, 1),
            "safe_teams_count": len(safe_teams),
            "unsafe_teams_count": len(unsafe_teams),
            "safe": True,
            "message": None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving engagement KPIs: {str(e)}")

@router.get("/engagement/by-team")
async def get_engagement_by_team(
    org_id: str = Query(..., description="Organization ID"),
    survey_id: Optional[str] = Query(None, description="Survey ID (defaults to current)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Get engagement by team with min-n enforcement"""
    try:
        # Admin access validation
        if current_user.role != 'admin' or current_user.company_id != org_id:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Get survey ID
        if not survey_id:
            survey = db.query(Survey).filter(
                Survey.creator_id == org_id,
                Survey.status.in_(["active", "closed"])
            ).order_by(desc(Survey.created_at)).first()
            
            if not survey:
                raise HTTPException(status_code=404, detail="No surveys found")
            survey_id = str(survey.id)
        
        # Get safe teams
        safe_teams, unsafe_teams = get_safe_team_list(org_id, survey_id, db)
        
        # Get all teams for this org
        all_teams = db.query(Team).filter(Team.org_id == org_id).all()
        
        team_data = []
        
        for team in all_teams:
            team_id = str(team.id)
            is_safe = team_id in safe_teams
            
            if is_safe:
                participation = db.query(ParticipationSummary).filter(
                    ParticipationSummary.survey_id == survey_id,
                    ParticipationSummary.team_id == team_id
                ).first()
                
                if participation:
                    team_data.append({
                        "team_id": team_id,
                        "team_name": team.name,
                        "total_employees": participation.team_size,
                        "total_responses": participation.respondents,
                        "participation_rate": round(participation.participation_pct, 1),
                        "delta_pct": round(participation.delta_pct, 1) if participation.delta_pct else 0,
                        "safe": True
                    })
            else:
                team_data.append({
                    "team_id": team_id,
                    "team_name": team.name,
                    "total_employees": 0,
                    "total_responses": 0,
                    "participation_rate": 0,
                    "delta_pct": 0,
                    "safe": False,
                    "message": "Not enough responses to show data safely"
                })
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=org_id,
            action_type="admin_engagement_by_team_accessed",
            resource_type="dashboard",
            resource_id="engagement_by_team",
            description="Admin accessed engagement by team",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "org_id": org_id,
            "survey_id": survey_id,
            "teams": team_data,
            "safe_teams_count": len(safe_teams),
            "unsafe_teams_count": len(unsafe_teams),
            "total_teams": len(all_teams),
            "safe": len(safe_teams) > 0,
            "message": None if len(safe_teams) > 0 else "No teams have sufficient responses"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving engagement by team: {str(e)}")

# Admin Reports
@router.get("/reports/digest")
async def get_reports_digest(
    org_id: str = Query(..., description="Organization ID"),
    period: str = Query(..., description="Period in YYYY-MM format"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Get reports digest with min-n enforcement"""
    try:
        # Admin access validation
        if current_user.role != 'admin' or current_user.company_id != org_id:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Parse period
        try:
            period_start = datetime.strptime(period, "%Y-%m").date()
            period_end = (period_start.replace(month=period_start.month + 1) - timedelta(days=1)) if period_start.month < 12 else period_start.replace(year=period_start.year + 1, month=1) - timedelta(days=1)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid period format. Use YYYY-MM")
        
        # Get cached report
        summary_service = SummaryService(db)
        cached_report = summary_service.get_reports_cache(
            org_id, "org", period_start, period_end
        )
        
        if not cached_report:
            # Build digest on the fly
            digest_data = build_org_digest_data(org_id, period_start, period_end, db)
            
            # Cache the digest
            summary_service.cache_report_data(
                org_id, "org", period_start, period_end, digest_data
            )
            
            # Log audit
            audit_service = AuditService(db)
            audit_service.log_action(
                user_id=current_user.id,
                org_id=org_id,
                action_type="admin_reports_digest_accessed",
                resource_type="dashboard",
                resource_id="reports_digest",
                description=f"Admin accessed reports digest for period {period}",
                ip_address=request.client.host if request else None,
                user_agent=request.headers.get("user-agent") if request else None
            )
            
            return {
                "org_id": org_id,
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
            org_id=org_id,
            action_type="admin_reports_digest_accessed",
            resource_type="dashboard",
            resource_id="reports_digest",
            description=f"Admin accessed cached reports digest for period {period}",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "org_id": org_id,
            "period": period,
            "data": cached_report.payload_json,
            "cached": True,
            "created_at": cached_report.created_at.isoformat(),
            "safe": True,
            "message": None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving reports digest: {str(e)}")

def build_org_digest_data(org_id: str, period_start: date, period_end: date, db: Session) -> Dict[str, Any]:
    """Build organization digest data for reports"""
    # Get surveys in period
    surveys = db.query(Survey).filter(
        Survey.creator_id == org_id,
        Survey.created_at >= period_start,
        Survey.created_at <= period_end,
        Survey.status.in_(["active", "closed"])
    ).all()
    
    if not surveys:
        return {"error": "No surveys found in period"}
    
    # Get latest survey for detailed data
    latest_survey = max(surveys, key=lambda s: s.created_at)
    
    # Get safe teams for latest survey
    safe_teams, unsafe_teams = get_safe_team_list(org_id, str(latest_survey.id), db)
    
    if not safe_teams:
        return {"error": "Not enough responses for safe reporting"}
    
    # Calculate org-wide metrics from safe teams
    total_employees = 0
    total_responses = 0
    total_enps = 0
    total_score = 0
    team_count = 0
    
    for team_id in safe_teams:
        participation = db.query(ParticipationSummary).filter(
            ParticipationSummary.survey_id == str(latest_survey.id),
            ParticipationSummary.team_id == team_id
        ).first()
        
        if participation:
            total_employees += participation.team_size
            total_responses += participation.respondents
            team_count += 1
        
        drivers = db.query(DriverSummary).filter(
            DriverSummary.survey_id == str(latest_survey.id),
            DriverSummary.team_id == team_id
        ).all()
        
        for driver in drivers:
            driver_enps = driver.promoters_pct - driver.detractors_pct
            total_enps += driver_enps
            total_score += driver.avg_score
    
    # Calculate averages
    avg_enps = total_enps / len(safe_teams) if safe_teams else 0
    avg_score = total_score / len(safe_teams) if safe_teams else 0
    participation_rate = (total_responses / total_employees * 100) if total_employees > 0 else 0
    
    # Build digest
    digest = {
        "period": f"{period_start.strftime('%Y-%m')}",
        "org_id": org_id,
        "survey_count": len(surveys),
        "latest_survey": {
            "id": str(latest_survey.id),
            "title": latest_survey.title,
            "created_at": latest_survey.created_at.isoformat()
        },
        "metrics": {
            "total_employees": total_employees,
            "total_responses": total_responses,
            "participation_rate": round(participation_rate, 1),
            "company_enps": round(avg_enps, 1),
            "avg_score": round(avg_score, 1)
        },
        "teams": {
            "safe_teams_count": len(safe_teams),
            "unsafe_teams_count": len(unsafe_teams),
            "total_teams": len(safe_teams) + len(unsafe_teams)
        }
    }
    
    return digest
