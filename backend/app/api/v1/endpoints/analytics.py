"""
Analytics endpoints for dashboard and reporting
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import random

from app.core.database import get_db
from app.models.base import Survey, User, Response, Question, Answer
from app.models.advanced import (
    Department, Team, UserDepartment, UserTeam, AnonymousComment, 
    Permission, Role, RolePermission, UserRole, BrandingConfig, 
    SSOConfig, APIKey, DashboardAlert, TeamAnalytics, SurveySchedule,
    Webhook
)
from app.api.deps import get_current_user

router = APIRouter()

class DashboardStats(BaseModel):
    totalSurveys: int
    activeSurveys: int
    totalResponses: int
    responseRate: float

class RecentActivity(BaseModel):
    id: str
    type: str
    description: str
    createdAt: str

class MoodData(BaseModel):
    currentScore: float
    previousScore: float
    trend: List[dict]
    alerts: List[dict]

class DashboardAlertResponse(BaseModel):
    type: str
    message: str
    severity: str
    createdAt: str

class TeamData(BaseModel):
    id: str
    name: str
    avgScore: float
    scoreChange: float
    responseCount: int
    comments: List[str]
    sentiment: str
    alerts: List[str]

class AnonymousComment(BaseModel):
    id: str
    text: str
    team: str
    sentiment: str
    createdAt: str
    isPinned: bool
    isFlagged: bool
    tags: List[str]

class TeamUsageSnapshot(BaseModel):
    activeTeams: dict
    surveyCompletionRate: dict
    newSignups: dict
    teamActivity: List[dict]
    topEngagedTeams: List[dict]

class SurveyActivityLog(BaseModel):
    surveys: List[dict]

class ScoreThreshold(BaseModel):
    enabled: bool
    value: float
    action: str

class CommentTags(BaseModel):
    well_being: bool
    leadership: bool
    culture: bool
    compensation: bool
    work_life_balance: bool
    career_growth: bool
    communication: bool
    other: List[str]

class PlanBillingOverview(BaseModel):
    planDetails: dict
    billingEvents: List[dict]
    trialInfo: dict
    upgradePotential: dict
    billingErrors: List[dict]

class SupportRiskFlags(BaseModel):
    teamsNeedingHelp: List[dict]
    atRiskTeams: List[dict]
    npsData: dict
    watchList: List[dict]

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard statistics"""
    # Get surveys created by current user
    total_surveys = db.query(Survey).filter(Survey.creator_id == current_user.id).count()
    
    # Get active surveys (status = 'active')
    active_surveys = db.query(Survey).filter(
        Survey.creator_id == current_user.id,
        Survey.status == 'active'
    ).count()
    
    # Get total responses for user's surveys
    total_responses = db.query(Response).join(Survey).filter(
        Survey.creator_id == current_user.id
    ).count()
    
    # Calculate response rate (responses per survey)
    response_rate = (total_responses / total_surveys * 100) if total_surveys > 0 else 0
    
    return DashboardStats(
        totalSurveys=total_surveys,
        activeSurveys=active_surveys,
        totalResponses=total_responses,
        responseRate=round(response_rate, 2)
    )

@router.get("/recent-activity", response_model=List[RecentActivity])
async def get_recent_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get recent activity for dashboard"""
    # Get recent survey responses
    recent_responses = db.query(Response).join(Survey).filter(
        Survey.creator_id == current_user.id
    ).order_by(Response.submitted_at.desc()).limit(10).all()
    
    activities = []
    for response in recent_responses:
        activities.append(RecentActivity(
            id=f"response_{response.id}",
            type="survey_response",
            description=f"New response to '{response.survey.title}'",
            createdAt=response.submitted_at.isoformat()
        ))
    
    # Get recent survey creations
    recent_surveys = db.query(Survey).filter(
        Survey.creator_id == current_user.id
    ).order_by(Survey.created_at.desc()).limit(5).all()
    
    for survey in recent_surveys:
        activities.append(RecentActivity(
            id=f"survey_{survey.id}",
            type="survey_created",
            description=f"Created survey '{survey.title}'",
            createdAt=survey.created_at.isoformat()
        ))
    
    # Sort by creation date and return top 10
    activities.sort(key=lambda x: x.createdAt, reverse=True)
    return activities[:10]

@router.get("/pulse-overview", response_model=MoodData)
async def get_pulse_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get pulse overview data including mood score and trends"""
    # For now, return mock data to avoid database query issues
    current_score = 7.3
    previous_score = 7.1

    # Generate 6-month trend data
    trend_data = []
    base_score = previous_score - 0.3
    for i in range(6):
        month_score = base_score + (i * 0.1) + random.uniform(-0.2, 0.2)
        trend_data.append({
            "month": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
            "score": round(max(5.0, min(10.0, month_score)), 1)
        })

    # Mock alerts for now
    alerts = [
        {
            "type": "mood_drop",
            "message": "Organizational mood dropped to 6.8/10",
            "severity": "warning"
        },
        {
            "type": "engagement",
            "message": "Employee engagement: +1.5% this month",
            "severity": "info"
        }
    ]

    return MoodData(
        currentScore=current_score,
        previousScore=previous_score,
        trend=trend_data,
        alerts=alerts
    )

@router.get("/dashboard-alerts", response_model=List[DashboardAlertResponse])
async def get_dashboard_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard alerts"""
    alerts = db.query(DashboardAlert).filter(
        DashboardAlert.company_id == current_user.id,
        DashboardAlert.is_active == True
    ).order_by(DashboardAlert.created_at.desc()).all()
    
    return [
        DashboardAlertResponse(
            type=alert.type,
            message=alert.message,
            severity=alert.severity,
            createdAt=alert.created_at.isoformat()
        )
        for alert in alerts
    ]

@router.get("/team-breakdown", response_model=List[TeamData])
async def get_team_breakdown(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get team breakdown data"""
    # Get teams for the current user's company
    teams = db.query(Team).join(Department).filter(
        Department.company_id == current_user.id
    ).all()
    
    team_data = []
    for team in teams:
        # Get team analytics
        analytics = db.query(TeamAnalytics).filter(
            TeamAnalytics.team_id == team.id
        ).order_by(TeamAnalytics.calculated_at.desc()).first()
        
        # Get team comments
        comments = db.query(AnonymousComment).filter(
            AnonymousComment.team_id == team.id
        ).limit(3).all()
        
        comment_texts = [comment.text for comment in comments]
        
        # Determine sentiment based on comments
        if comments:
            positive_count = sum(1 for c in comments if c.sentiment == 'positive')
            negative_count = sum(1 for c in comments if c.sentiment == 'negative')
            
            if positive_count > negative_count:
                sentiment = 'positive'
            elif negative_count > positive_count:
                sentiment = 'negative'
            else:
                sentiment = 'neutral'
        else:
            sentiment = 'neutral'
        
        # Generate alerts for low scores
        alerts = []
        if analytics and analytics.avg_score < 6.5:
            alerts.append(f"Team score below threshold: {analytics.avg_score}/10")
        
        team_data.append(TeamData(
            id=str(team.id),
            name=team.name,
            avgScore=analytics.avg_score if analytics else 7.0,
            scoreChange=analytics.score_change if analytics else 0.0,
            responseCount=analytics.response_count if analytics else 0,
            comments=comment_texts,
            sentiment=sentiment,
            alerts=alerts
        ))
    
    return team_data

@router.get("/anonymous-comments", response_model=List[AnonymousComment])
async def get_anonymous_comments(
    team: Optional[str] = None,
    sentiment: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get anonymous comments with filtering"""
    # Base query for comments from user's surveys
    query = db.query(AnonymousComment).join(Survey).filter(
        Survey.creator_id == current_user.id
    )
    
    # Apply filters
    if team:
        query = query.join(Team).filter(Team.name == team)
    
    if sentiment:
        query = query.filter(AnonymousComment.sentiment == sentiment)
    
    if start_date:
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        query = query.filter(AnonymousComment.created_at >= start_dt)
    
    if end_date:
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        query = query.filter(AnonymousComment.created_at <= end_dt)
    
    if search:
        query = query.filter(AnonymousComment.text.ilike(f"%{search}%"))
    
    comments = query.order_by(AnonymousComment.created_at.desc()).all()
    
    return [
        AnonymousComment(
            id=str(comment.id),
            text=comment.text,
            team=comment.team.name if comment.team else "Unknown",
            sentiment=comment.sentiment,
            createdAt=comment.created_at.isoformat(),
            isPinned=comment.is_pinned,
            isFlagged=comment.is_flagged,
            tags=comment.tags or []
        )
        for comment in comments
    ]

@router.post("/anonymous-comments/{comment_id}/pin")
async def pin_comment(
    comment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Pin or unpin a comment"""
    comment = db.query(AnonymousComment).join(Survey).filter(
        AnonymousComment.id == int(comment_id),
        Survey.creator_id == current_user.id
    ).first()
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment.is_pinned = not comment.is_pinned
    db.commit()
    
    return {"message": "Comment pinned" if comment.is_pinned else "Comment unpinned"}

@router.post("/anonymous-comments/{comment_id}/flag")
async def flag_comment(
    comment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Flag or unflag a comment"""
    comment = db.query(AnonymousComment).join(Survey).filter(
        AnonymousComment.id == int(comment_id),
        Survey.creator_id == current_user.id
    ).first()
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment.is_flagged = not comment.is_flagged
    db.commit()
    
    return {"message": "Comment flagged" if comment.is_flagged else "Comment unflagged"}

@router.post("/export-pdf")
async def export_dashboard_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export dashboard as PDF summary"""
    # In production, this would generate a PDF with dashboard data
    return {
        "message": "PDF export initiated",
        "download_url": "https://novora.app/exports/dashboard-2024-01-15.pdf",
        "expires_at": "2024-01-22T10:00:00Z"
    }

@router.post("/generate-shareable-link")
async def generate_shareable_link(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a read-only shareable dashboard link"""
    import secrets
    share_token = secrets.token_urlsafe(32)
    
    return {
        "message": "Shareable link generated",
        "share_url": f"https://novora.app/dashboard/share/{share_token}",
        "expires_at": "2024-02-15T10:00:00Z",
        "access_level": "read-only"
    }

@router.post("/surveys/create")
async def create_survey(
    survey_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new survey"""
    # In production, this would save to database
    return {
        "message": "Survey created successfully",
        "survey_id": "survey_" + str(random.randint(1000, 9999)),
        "title": survey_data.get("title", "New Survey"),
        "status": "draft"
    }

@router.post("/surveys/schedule")
async def schedule_survey_delivery(
    schedule_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Schedule survey delivery"""
    # In production, this would set up automated delivery
    return {
        "message": "Survey delivery scheduled",
        "delivery_date": schedule_data.get("delivery_date"),
        "reminder_enabled": schedule_data.get("reminder_enabled", False),
        "schedule_id": "schedule_" + str(random.randint(1000, 9999))
    }

# Advanced Capabilities endpoints
@router.get("/survey-logic/branching")
async def get_survey_branching_logic(
    survey_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get survey branching logic configuration"""
    # Mock branching logic data
    return {
        "survey_id": survey_id,
        "branching_rules": [
            {
                "question_id": "q1",
                "condition": "response == 'manager'",
                "next_question": "q_manager",
                "skip_questions": ["q_employee"]
            },
            {
                "question_id": "q2",
                "condition": "response == 'remote'",
                "next_question": "q_remote_work",
                "skip_questions": ["q_office"]
            }
        ]
    }

@router.post("/survey-logic/branching")
async def update_survey_branching_logic(
    survey_id: str,
    branching_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update survey branching logic"""
    return {
        "message": "Branching logic updated",
        "survey_id": survey_id,
        "rules_count": len(branching_data.get("rules", []))
    }

@router.get("/department-hierarchy")
async def get_department_hierarchy(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get company department hierarchy"""
    departments = db.query(Department).filter(
        Department.company_id == current_user.id
    ).all()
    
    def build_hierarchy(dept_list, parent_id=None):
        hierarchy = []
        for dept in dept_list:
            if dept.parent_id == parent_id:
                children = build_hierarchy(dept_list, dept.id)
                dept_data = {
                    "id": str(dept.id),
                    "name": dept.name,
                    "level": dept.level,
                    "children": children,
                    "permissions": ["view_department", "manage_teams"]  # Default permissions
                }
                hierarchy.append(dept_data)
        return hierarchy
    
    return {"departments": build_hierarchy(departments)}

@router.post("/department-hierarchy")
async def update_department_hierarchy(
    hierarchy_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update department hierarchy"""
    # In production, this would update the database
    # For now, return success message
    return {
        "message": "Department hierarchy updated",
        "departments_count": len(hierarchy_data.get("departments", []))
    }

@router.get("/permissions")
async def get_permissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get available permissions and roles"""
    # Get all permissions
    permissions = db.query(Permission).all()
    
    # Get roles for the current user's company
    roles = db.query(Role).filter(
        Role.company_id == current_user.id
    ).all()
    
    # Get user's roles
    user_roles = db.query(UserRole).filter(
        UserRole.user_id == current_user.id
    ).all()
    
    # Build permissions list
    permissions_list = []
    for perm in permissions:
        # Check if user has this permission through their roles
        has_permission = any(
            ur.role_id in [r.id for r in roles] 
            for ur in user_roles
        )
        
        permissions_list.append({
            "id": str(perm.id),
            "name": perm.name,
            "description": perm.description,
            "scope": perm.scope,
            "enabled": has_permission
        })
    
    # Build roles list
    roles_list = []
    for role in roles:
        role_permissions = db.query(RolePermission).filter(
            RolePermission.role_id == role.id
        ).all()
        
        roles_list.append({
            "id": str(role.id),
            "name": role.name,
            "permissions": [rp.permission.name for rp in role_permissions],
            "scope": role.scope
        })
    
    return {
        "permissions": permissions_list,
        "roles": roles_list
    }

@router.post("/permissions")
async def update_permissions(
    permissions_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update permissions configuration"""
    # In production, this would update user roles and permissions
    return {
        "message": "Permissions updated",
        "permissions_count": len(permissions_data.get("permissions", []))
    }

@router.get("/branding")
async def get_branding_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get branding configuration"""
    branding = db.query(BrandingConfig).filter(
        BrandingConfig.company_id == current_user.id
    ).first()
    
    if not branding:
        # Create default branding config
        branding = BrandingConfig(
            company_id=current_user.id,
            logo_url="/uploads/company-logo.png",
            primary_color="#3b82f6",
            secondary_color="#1e40af",
            email_domain="company.com",
            survey_theme="light",
            company_name=current_user.company_name or "Your Company"
        )
        db.add(branding)
        db.commit()
    
    return {
        "logo": branding.logo_url,
        "primary_color": branding.primary_color,
        "secondary_color": branding.secondary_color,
        "email_domain": branding.email_domain,
        "survey_theme": branding.survey_theme,
        "custom_css": branding.custom_css or "",
        "company_name": branding.company_name
    }

@router.post("/branding")
async def update_branding_config(
    branding_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update branding configuration"""
    branding = db.query(BrandingConfig).filter(
        BrandingConfig.company_id == current_user.id
    ).first()
    
    if not branding:
        branding = BrandingConfig(company_id=current_user.id)
        db.add(branding)
    
    # Update branding fields
    if "logo" in branding_data:
        branding.logo_url = branding_data["logo"]
    if "primary_color" in branding_data:
        branding.primary_color = branding_data["primary_color"]
    if "secondary_color" in branding_data:
        branding.secondary_color = branding_data["secondary_color"]
    if "email_domain" in branding_data:
        branding.email_domain = branding_data["email_domain"]
    if "survey_theme" in branding_data:
        branding.survey_theme = branding_data["survey_theme"]
    if "custom_css" in branding_data:
        branding.custom_css = branding_data["custom_css"]
    if "company_name" in branding_data:
        branding.company_name = branding_data["company_name"]
    
    db.commit()
    
    return {
        "message": "Branding updated",
        "logo_url": branding.logo_url,
        "theme": branding.survey_theme
    }

@router.get("/sso/config")
async def get_sso_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get SSO configuration"""
    sso_config = db.query(SSOConfig).filter(
        SSOConfig.company_id == current_user.id
    ).first()
    
    if not sso_config:
        # Create default SSO config
        sso_config = SSOConfig(
            company_id=current_user.id,
            provider="google_workspace",
            enabled=False,
            domain="company.com"
        )
        db.add(sso_config)
        db.commit()
    
    return {
        "enabled": sso_config.enabled,
        "provider": sso_config.provider,
        "domain": sso_config.domain,
        "metadata_url": sso_config.metadata_url,
        "entity_id": sso_config.entity_id
    }

@router.post("/sso/config")
async def update_sso_config(
    sso_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update SSO configuration"""
    sso_config = db.query(SSOConfig).filter(
        SSOConfig.company_id == current_user.id
    ).first()
    
    if not sso_config:
        sso_config = SSOConfig(company_id=current_user.id)
        db.add(sso_config)
    
    # Update SSO fields
    if "provider" in sso_data:
        sso_config.provider = sso_data["provider"]
    if "enabled" in sso_data:
        sso_config.enabled = sso_data["enabled"]
    if "domain" in sso_data:
        sso_config.domain = sso_data["domain"]
    if "metadata_url" in sso_data:
        sso_config.metadata_url = sso_data["metadata_url"]
    if "entity_id" in sso_data:
        sso_config.entity_id = sso_data["entity_id"]
    
    db.commit()
    
    return {
        "message": "SSO configuration updated",
        "provider": sso_config.provider,
        "enabled": sso_config.enabled
    }

@router.get("/api/keys")
async def get_api_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get API keys for data export"""
    api_keys = db.query(APIKey).filter(
        APIKey.company_id == current_user.id,
        APIKey.is_active == True
    ).all()
    
    # Get webhooks
    webhooks = db.query(Webhook).filter(
        Webhook.company_id == current_user.id,
        Webhook.is_active == True
    ).all()
    
    api_keys_list = []
    for key in api_keys:
        api_keys_list.append({
            "id": str(key.id),
            "name": key.name,
            "key": key.key_hash[:20] + "..." + "x" * 20,  # Mask the key
            "created_at": key.created_at.isoformat(),
            "last_used": key.last_used.isoformat() if key.last_used else None,
            "permissions": key.permissions or []
        })
    
    webhook_urls = [webhook.url for webhook in webhooks]
    
    return {
        "api_keys": api_keys_list,
        "webhook_urls": webhook_urls
    }

@router.post("/api/keys")
async def create_api_key(
    key_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new API key"""
    import secrets
    import hashlib
    
    api_key_value = "nov_live_" + secrets.token_urlsafe(32)
    api_key_hash = hashlib.sha256(api_key_value.encode()).hexdigest()
    
    api_key = APIKey(
        company_id=current_user.id,
        name=key_data.get("name", "New API Key"),
        key_hash=api_key_hash,
        permissions=key_data.get("permissions", [])
    )
    
    db.add(api_key)
    db.commit()
    
    return {
        "message": "API key created",
        "key": api_key_value,
        "name": api_key.name,
        "permissions": api_key.permissions
    }

@router.get("/support/contact")
async def get_support_contact():
    """Get support contact information"""
    return {
        "email": "support@novora.com",
        "phone": "+1-800-NOVORA-1",
        "hours": "24/7",
        "response_time": "< 2 hours",
        "priority_support": True,
        "dedicated_manager": True
    }

@router.get("/team-usage-snapshot", response_model=TeamUsageSnapshot)
async def get_team_usage_snapshot(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive team usage snapshot for owner dashboard"""
    
    # Calculate date ranges
    now = datetime.utcnow()
    this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)
    this_week_start = now - timedelta(days=now.weekday())
    this_week_start = this_week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Get all teams for this company
    teams = db.query(Team).join(Department).filter(
        Department.company_id == current_user.id
    ).all()
    
    # Active Teams This Month (teams with responses)
    active_teams_this_month = db.query(Team).join(Department).join(Response, Response.survey_id == Survey.id).join(Survey, Survey.creator_id == current_user.id).filter(
        Department.company_id == current_user.id,
        Response.submitted_at >= this_month_start
    ).distinct().count()
    
    active_teams_last_month = db.query(Team).join(Department).join(Response, Response.survey_id == Survey.id).join(Survey, Survey.creator_id == current_user.id).filter(
        Department.company_id == current_user.id,
        Response.submitted_at >= last_month_start,
        Response.submitted_at < this_month_start
    ).distinct().count()
    
    total_teams = len(teams)
    active_teams_change = ((active_teams_this_month - active_teams_last_month) / max(active_teams_last_month, 1)) * 100
    
    # Survey Completion Rate
    total_responses = db.query(Response).join(Survey).filter(
        Survey.creator_id == current_user.id,
        Response.submitted_at >= this_month_start
    ).count()
    
    total_surveys_sent = db.query(Survey).filter(
        Survey.creator_id == current_user.id,
        Survey.created_at >= this_month_start
    ).count()
    
    completion_rate = (total_responses / max(total_surveys_sent, 1)) * 100
    
    # Last month completion rate for comparison
    last_month_responses = db.query(Response).join(Survey).filter(
        Survey.creator_id == current_user.id,
        Response.submitted_at >= last_month_start,
        Response.submitted_at < this_month_start
    ).count()
    
    last_month_surveys = db.query(Survey).filter(
        Survey.creator_id == current_user.id,
        Survey.created_at >= last_month_start,
        Survey.created_at < this_month_start
    ).count()
    
    last_month_completion = (last_month_responses / max(last_month_surveys, 1)) * 100
    completion_change = completion_rate - last_month_completion
    
    # New Signups
    new_signups_this_week = db.query(User).filter(
        User.created_at >= this_week_start,
        User.id != current_user.id  # Exclude current user
    ).count()
    
    new_signups_this_month = db.query(User).filter(
        User.created_at >= this_month_start,
        User.id != current_user.id
    ).count()
    
    # Team Activity (last activity and engagement decay)
    team_activity = []
    for team in teams[:10]:  # Top 10 teams
        last_response = db.query(Response).join(Survey).filter(
            Survey.creator_id == current_user.id
        ).order_by(desc(Response.submitted_at)).first()
        
        if last_response:
            days_since_activity = (now - last_response.submitted_at).days
            if days_since_activity <= 3:
                status = 'active'
            elif days_since_activity <= 7:
                status = 'decaying'
            else:
                status = 'inactive'
            
            # Calculate engagement score based on recent activity
            recent_responses = db.query(Response).join(Survey).filter(
                Survey.creator_id == current_user.id,
                Response.submitted_at >= now - timedelta(days=30)
            ).count()
            
            engagement_score = min(100, (recent_responses / 10) * 100)  # Normalize to 100
            
            team_activity.append({
                "id": str(team.id),
                "name": team.name,
                "lastActivity": last_response.submitted_at.isoformat(),
                "daysSinceActivity": days_since_activity,
                "status": status,
                "engagementScore": round(engagement_score, 1)
            })
    
    # Sort by engagement score for top teams
    team_activity.sort(key=lambda x: x['engagementScore'], reverse=True)
    
    # Top Engaged Teams
    top_engaged_teams = []
    for team_data in team_activity[:5]:
        team = db.query(Team).filter(Team.id == int(team_data['id'])).first()
        if team:
            # Get survey completion rate for this team
            team_surveys = db.query(Survey).filter(Survey.team_id == team.id).count()
            team_responses = db.query(Response).join(Survey).filter(Survey.team_id == team.id).count()
            completion_rate = (team_responses / max(team_surveys, 1)) * 100
            
            # Calculate average response time
            recent_responses = db.query(Response).join(Survey).filter(
                Survey.team_id == team.id,
                Response.created_at >= now - timedelta(days=30)
            ).all()
            
            if recent_responses:
                avg_response_time = sum([
                    (r.created_at - r.survey.created_at).days 
                    for r in recent_responses if r.survey.created_at
                ]) / len(recent_responses)
            else:
                avg_response_time = 0
            
            # Determine potential (case study, referral, or both)
            if team_data['engagementScore'] > 85 and completion_rate > 80:
                potential = 'both'
            elif team_data['engagementScore'] > 80:
                potential = 'case_study'
            else:
                potential = 'referral'
            
            top_engaged_teams.append({
                "id": str(team.id),
                "name": team.name,
                "engagementScore": team_data['engagementScore'],
                "surveyCompletionRate": round(completion_rate, 1),
                "responseCount": team_responses,
                "avgResponseTime": round(avg_response_time, 1),
                "potential": potential
            })
    
    return TeamUsageSnapshot(
        activeTeams={
            "count": active_teams_this_month,
            "changePercent": round(active_teams_change, 1),
            "totalTeams": total_teams
        },
        surveyCompletionRate={
            "average": round(completion_rate, 1),
            "trend": "up" if completion_change > 0 else "down" if completion_change < 0 else "stable",
            "changePercent": round(completion_change, 1)
        },
        newSignups={
            "thisWeek": new_signups_this_week,
            "thisMonth": new_signups_this_month,
            "trend": "up" if new_signups_this_month > 0 else "stable"
        },
        teamActivity=team_activity,
        topEngagedTeams=top_engaged_teams
    )

@router.get("/survey-activity-log", response_model=SurveyActivityLog)
async def get_survey_activity_log(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive survey activity log with flags and urgent comments"""
    
    # Get all surveys for this company
    surveys = db.query(Survey).join(Team).join(Department).filter(
        Department.company_id == current_user.id
    ).order_by(Survey.created_at.desc()).limit(20).all()
    
    survey_activities = []
    
    for survey in surveys:
        # Get response data
        responses = db.query(Response).filter(Response.survey_id == survey.id).all()
        response_count = len(responses)
        
        # Calculate expected responses (based on team size or survey settings)
        team = db.query(Team).filter(Team.id == survey.team_id).first()
        expected_responses = team.member_count if team else 25
        
        # Calculate completion rate
        completion_rate = (response_count / max(expected_responses, 1)) * 100
        
        # Calculate average score
        if responses:
            total_score = 0
            score_count = 0
            for response in responses:
                answers = db.query(Answer).filter(Answer.response_id == response.id).all()
                for answer in answers:
                    if answer.question.type == 'rating':
                        try:
                            total_score += float(answer.value)
                            score_count += 1
                        except:
                            pass
            
            avg_score = total_score / max(score_count, 1)
        else:
            avg_score = 0
        
        # Calculate score delta (compare with previous similar survey)
        previous_survey = db.query(Survey).filter(
            Survey.team_id == survey.team_id,
            Survey.id != survey.id,
            Survey.created_at < survey.created_at
        ).order_by(Survey.created_at.desc()).first()
        
        score_delta = 0
        if previous_survey:
            prev_responses = db.query(Response).filter(Response.survey_id == previous_survey.id).all()
            if prev_responses:
                prev_total_score = 0
                prev_score_count = 0
                for response in prev_responses:
                    answers = db.query(Answer).filter(Answer.response_id == response.id).all()
                    for answer in answers:
                        if answer.question.type == 'rating':
                            try:
                                prev_total_score += float(answer.value)
                                prev_score_count += 1
                            except:
                                pass
                
                if prev_score_count > 0:
                    prev_avg_score = prev_total_score / prev_score_count
                    score_delta = avg_score - prev_avg_score
        
        # Generate flags
        flags = []
        
        # Zero responses flag
        if response_count == 0 and (datetime.utcnow() - survey.created_at).days > 5:
            flags.append({
                "type": "zero_responses",
                "severity": "high",
                "message": f"No responses received after {(datetime.utcnow() - survey.created_at).days} days",
                "createdAt": datetime.utcnow().isoformat()
            })
        
        # Score drop flag
        if score_delta < -1.5:
            flags.append({
                "type": "score_drop",
                "severity": "high" if abs(score_delta) > 2.0 else "medium",
                "message": f"Score dropped by {abs(score_delta):.1f} points (threshold: 1.5)",
                "createdAt": datetime.utcnow().isoformat()
            })
        
        # Low completion flag
        if completion_rate < 80:
            flags.append({
                "type": "low_completion",
                "severity": "medium",
                "message": f"Completion rate below 80% ({completion_rate:.0f}%)",
                "createdAt": datetime.utcnow().isoformat()
            })
        
        # Get urgent comments
        urgent_comments = []
        if survey.allow_comments:
            comments = db.query(AnonymousComment).filter(
                AnonymousComment.survey_id == survey.id
            ).all()
            
            for comment in comments:
                # Auto-tag comments based on content
                tags = []
                comment_text = comment.text.lower()
                
                if any(word in comment_text for word in ['mental', 'health', 'stress', 'anxiety', 'depression']):
                    tags.append('well_being')
                if any(word in comment_text for word in ['manager', 'leadership', 'boss', 'supervisor']):
                    tags.append('leadership')
                if any(word in comment_text for word in ['culture', 'environment', 'atmosphere']):
                    tags.append('culture')
                if any(word in comment_text for word in ['salary', 'pay', 'compensation', 'money']):
                    tags.append('compensation')
                if any(word in comment_text for word in ['balance', 'time', 'family', 'personal']):
                    tags.append('work_life_balance')
                if any(word in comment_text for word in ['career', 'growth', 'promotion', 'advancement']):
                    tags.append('career_growth')
                if any(word in comment_text for word in ['communication', 'feedback', 'meeting']):
                    tags.append('communication')
                
                # Flag urgent comments based on keywords
                urgent_keywords = ['urgent', 'immediate', 'critical', 'emergency', 'help', 'crisis']
                is_urgent = any(keyword in comment_text for keyword in urgent_keywords)
                
                if is_urgent or len(tags) > 0:
                    urgent_comments.append({
                        "id": str(comment.id),
                        "text": comment.text,
                        "tags": tags,
                        "flagged": comment.is_flagged,
                        "createdAt": comment.created_at.isoformat()
                    })
        
        survey_activities.append({
            "id": str(survey.id),
            "title": survey.title,
            "sentDate": survey.created_at.isoformat(),
            "responseCount": response_count,
            "expectedResponses": expected_responses,
            "completionRate": round(completion_rate, 1),
            "avgScore": round(avg_score, 1),
            "scoreDelta": round(score_delta, 1),
            "flags": flags,
            "urgentComments": urgent_comments,
            "status": survey.status
        })
    
    return SurveyActivityLog(surveys=survey_activities)

@router.post("/score-threshold")
async def update_score_threshold(
    threshold: ScoreThreshold,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update score threshold settings"""
    # In a real implementation, this would save to a settings table
    # For now, we'll just return success
    return {
        "message": "Score threshold updated successfully",
        "threshold": threshold.dict()
    }

@router.post("/comment-tags")
async def update_comment_tags(
    tags: CommentTags,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update comment tag settings"""
    # In a real implementation, this would save to a settings table
    # For now, we'll just return success
    return {
        "message": "Comment tags updated successfully",
        "tags": tags.dict()
    }

@router.get("/plan-billing-overview", response_model=PlanBillingOverview)
async def get_plan_billing_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive plan and billing overview for owner dashboard"""
    
    # Mock plan details (in real app, this would come from Stripe/subscription service)
    plan_details = {
        "currentPlan": "starter",
        "planName": "Starter Plan",
        "monthlyPrice": 29.00,
        "yearlyPrice": 290.00,
        "features": [
            "Up to 50 users",
            "Unlimited surveys", 
            "Basic analytics",
            "Email support"
        ],
        "limits": {
            "users": 50,
            "surveys": 100,
            "responses": 1000,
            "storage": 5
        },
        "usage": {
            "users": 42,
            "surveys": 78,
            "responses": 850,
            "storage": 3.2
        },
        "nextBillingDate": (datetime.utcnow() + timedelta(days=30)).isoformat(),
        "billingCycle": "monthly",
        "status": "active"
    }
    
    # Calculate usage percentages
    usage_percentages = {
        "users": (plan_details["usage"]["users"] / plan_details["limits"]["users"]) * 100,
        "surveys": (plan_details["usage"]["surveys"] / plan_details["limits"]["surveys"]) * 100,
        "responses": (plan_details["usage"]["responses"] / plan_details["limits"]["responses"]) * 100,
        "storage": (plan_details["usage"]["storage"] / plan_details["limits"]["storage"]) * 100
    }
    
    # Mock billing events (in real app, this would come from Stripe)
    billing_events = [
        {
            "id": "evt_1",
            "type": "payment_success",
            "amount": 29.00,
            "currency": "USD",
            "date": (datetime.utcnow() - timedelta(days=15)).isoformat(),
            "status": "success",
            "description": "Monthly subscription payment",
            "invoiceUrl": "https://stripe.com/invoices/inv_123"
        },
        {
            "id": "evt_2", 
            "type": "subscription_created",
            "amount": 0,
            "currency": "USD",
            "date": (datetime.utcnow() - timedelta(days=30)).isoformat(),
            "status": "success",
            "description": "Started Starter plan trial"
        }
    ]
    
    # Trial info (in real app, this would come from subscription service)
    trial_info = {
        "isTrial": False,
        "daysLeft": 0,
        "trialEndDate": (datetime.utcnow() - timedelta(days=15)).isoformat(),
        "canExtend": False
    }
    
    # Upgrade potential analysis
    upgrade_potential = {
        "hasUpgradePotential": False,
        "currentUsage": 0,
        "usagePercentage": 0,
        "recommendedPlan": "",
        "reason": "",
        "estimatedCost": 0
    }
    
    # Check if any usage is above 80%
    for resource, percentage in usage_percentages.items():
        if percentage > 80:
            upgrade_potential = {
                "hasUpgradePotential": True,
                "currentUsage": plan_details["usage"][resource],
                "usagePercentage": round(percentage, 1),
                "recommendedPlan": "Growth",
                "reason": f"Using {round(percentage, 1)}% of {resource} limit",
                "estimatedCost": 79.00
            }
            break
    
    # Mock billing errors (in real app, this would come from Stripe webhooks)
    billing_errors = []
    
    # Check for potential billing issues
    if plan_details["status"] == "past_due":
        billing_errors.append({
            "id": "err_1",
            "type": "payment_failed",
            "message": "Payment failed - insufficient funds",
            "date": (datetime.utcnow() - timedelta(days=2)).isoformat(),
            "resolved": False,
            "retryCount": 2
        })
    
    return PlanBillingOverview(
        planDetails=plan_details,
        billingEvents=billing_events,
        trialInfo=trial_info,
        upgradePotential=upgrade_potential,
        billingErrors=billing_errors
    )

@router.get("/support-risk-flags", response_model=SupportRiskFlags)
async def get_support_risk_flags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive support and risk flags for owner dashboard"""
    
    # Get all teams for this company
    teams = db.query(Team).join(Department).filter(
        Department.company_id == current_user.id
    ).all()
    
    # Mock teams needing help (in real app, this would come from support tickets)
    teams_needing_help = [
        {
            "id": "1",
            "name": "Engineering",
            "helpRequested": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
            "issueType": "technical_support",
            "priority": "medium",
            "description": "Having trouble with survey analytics setup",
            "contactPerson": "John Smith",
            "contactEmail": "john.smith@company.com",
            "contactPhone": "+1-555-0123",
            "status": "open"
        },
        {
            "id": "2",
            "name": "Sales",
            "helpRequested": (datetime.utcnow() - timedelta(hours=6)).isoformat(),
            "issueType": "training",
            "priority": "high",
            "description": "Need training on advanced survey features",
            "contactPerson": "Sarah Johnson",
            "contactEmail": "sarah.johnson@company.com",
            "contactPhone": "+1-555-0124",
            "status": "in_progress"
        }
    ]
    
    # Calculate at-risk teams based on alerts and engagement
    at_risk_teams = []
    for team in teams:
        # Get team alerts from previous analytics
        alerts = []
        alert_count = 0
        
        # Check for low completion rate
        team_surveys = db.query(Survey).filter(Survey.team_id == team.id).count()
        team_responses = db.query(Response).join(Survey).filter(Survey.team_id == team.id).count()
        completion_rate = (team_responses / max(team_surveys, 1)) * 100
        
        if completion_rate < 70:
            alerts.append(f"Low survey completion rate ({completion_rate:.0f}%)")
            alert_count += 1
        
        # Check for score drops
        recent_responses = db.query(Response).join(Survey).filter(
            Survey.team_id == team.id,
            Response.created_at >= datetime.utcnow() - timedelta(days=30)
        ).all()
        
        if recent_responses:
            total_score = 0
            score_count = 0
            for response in recent_responses:
                response_answers = db.query(Answer).filter(Answer.response_id == response.id).all()
                for answer in response_answers:
                    if answer.question.type == 'rating':
                        try:
                            total_score += float(answer.value)
                            score_count += 1
                        except:
                            pass
            
            if score_count > 0:
                avg_score = total_score / score_count
                if avg_score < 6.0:
                    alerts.append(f"Low average score ({avg_score:.1f}/10)")
                    alert_count += 1
        
        # Check for inactivity
        last_response = db.query(Response).join(Survey).filter(
            Survey.team_id == team.id
        ).order_by(desc(Response.created_at)).first()
        
        days_since_activity = 0
        if last_response:
            days_since_activity = (datetime.utcnow() - last_response.created_at).days
        
        if days_since_activity > 7:
            alerts.append(f"No activity for {days_since_activity} days")
            alert_count += 1
        
        # Check for negative sentiment
        negative_comments = db.query(AnonymousComment).filter(
            AnonymousComment.team_id == team.id,
            AnonymousComment.sentiment == 'negative'
        ).count()
        
        if negative_comments > 3:
            alerts.append(f"Multiple negative comments ({negative_comments})")
            alert_count += 1
        
        # Determine risk level
        risk_level = "low"
        if alert_count > 3:
            risk_level = "high"
        elif alert_count > 1:
            risk_level = "medium"
        
        # Calculate engagement score
        engagement_score = max(0, 100 - (alert_count * 15) - (days_since_activity * 5))
        
        if alert_count > 1 or engagement_score < 50:
            at_risk_teams.append({
                "id": str(team.id),
                "name": team.name,
                "alertCount": alert_count,
                "riskLevel": risk_level,
                "lastAlert": datetime.utcnow().isoformat(),
                "alerts": alerts,
                "engagementScore": engagement_score,
                "daysSinceLastActivity": days_since_activity
            })
    
    # Mock NPS data (in real app, this would come from NPS surveys)
    nps_data = {
        "overallScore": 7.2,
        "trend": "up",
        "changePercent": 0.8,
        "recentScores": [
            {"team": "Engineering", "score": 8.5, "trend": "up", "responses": 45},
            {"team": "Sales", "score": 7.8, "trend": "stable", "responses": 38},
            {"team": "Marketing", "score": 5.2, "trend": "down", "responses": 25},
            {"team": "HR", "score": 6.1, "trend": "down", "responses": 28}
        ]
    }
    
    # Mock watch list (in real app, this would come from user preferences)
    watch_list = [
        {
            "id": "1",
            "name": "Engineering",
            "addedDate": (datetime.utcnow() - timedelta(days=6)).isoformat(),
            "reason": "High growth team - monitor closely",
            "notes": "Expanding rapidly, need to ensure survey tools scale",
            "priority": "high"
        },
        {
            "id": "2",
            "name": "Marketing",
            "addedDate": (datetime.utcnow() - timedelta(days=4)).isoformat(),
            "reason": "At-risk team - needs attention",
            "notes": "Multiple alerts, declining engagement",
            "priority": "high"
        }
    ]
    
    return SupportRiskFlags(
        teamsNeedingHelp=teams_needing_help,
        atRiskTeams=at_risk_teams,
        npsData=nps_data,
        watchList=watch_list
    )

@router.post("/teams/{team_id}/watch")
async def toggle_team_watch(
    team_id: str,
    watch_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle team watch status"""
    # In a real implementation, this would save to a watch list table
    # For now, we'll just return success
    return {
        "message": "Team watch status updated successfully",
        "team_id": team_id,
        "watched": watch_data.get("watched", False)
    }
