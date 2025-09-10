"""
Safe analytics endpoints with universal min-n enforcement
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.deps import get_current_user
from app.core.privacy import (
    enforce_min_n, safe_aggregate_with_fallback, safe_response_count,
    safe_percentage, mask_pii, get_privacy_settings, validate_team_access
)
from app.models.base import User, Team
from app.models.advanced import UserTeam
from app.models.responses import NumericResponse, Comment
from app.models.summaries import (
    ParticipationSummary, DriverSummary, SentimentSummary, 
    OrgDriverTrends, ReportsCache, CommentNLP
)
from app.services.summary_service import SummaryService

router = APIRouter()

@router.get("/participation/{survey_id}")
async def get_participation_analytics(
    survey_id: str,
    team_id: Optional[str] = Query(None, description="Team ID (optional)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get participation analytics with min-n enforcement"""
    try:
        # Get privacy settings
        privacy_settings = get_privacy_settings(current_user.company_id, db)
        
        # Build query
        query = db.query(ParticipationSummary).filter(
            ParticipationSummary.survey_id == survey_id
        )
        
        # Filter by team if specified
        if team_id:
            # Validate team access
            if not validate_team_access(current_user.id, team_id, db):
                raise HTTPException(status_code=403, detail="Access denied to team data")
            query = query.filter(ParticipationSummary.team_id == team_id)
        else:
            # For org-wide data, only show teams user has access to
            if current_user.role == 'manager':
                user_teams = db.query(Team.id).join(UserTeam).filter(
                    UserTeam.user_id == current_user.id
                ).all()
                team_ids = [str(t.id) for t in user_teams]
                query = query.filter(ParticipationSummary.team_id.in_(team_ids))
        
        summaries = query.all()
        
        # Apply min-n enforcement
        safe_data = []
        for summary in summaries:
            if enforce_min_n(summary.respondents, privacy_settings.min_n, current_user.company_id, db):
                safe_data.append({
                    "team_id": str(summary.team_id),
                    "respondents": summary.respondents,
                    "team_size": summary.team_size,
                    "participation_pct": summary.participation_pct,
                    "delta_pct": summary.delta_pct
                })
        
        return {
            "survey_id": survey_id,
            "data": safe_data,
            "safe": len(safe_data) > 0,
            "message": None if len(safe_data) > 0 else privacy_settings.safe_fallback_message
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving participation analytics: {str(e)}")

@router.get("/drivers/{survey_id}")
async def get_driver_analytics(
    survey_id: str,
    team_id: Optional[str] = Query(None, description="Team ID (optional)"),
    driver_id: Optional[str] = Query(None, description="Driver ID (optional)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get driver analytics with min-n enforcement"""
    try:
        # Get privacy settings
        privacy_settings = get_privacy_settings(current_user.company_id, db)
        
        # Build query
        query = db.query(DriverSummary).filter(
            DriverSummary.survey_id == survey_id
        )
        
        # Apply filters
        if team_id:
            if not validate_team_access(current_user.id, team_id, db):
                raise HTTPException(status_code=403, detail="Access denied to team data")
            query = query.filter(DriverSummary.team_id == team_id)
        else:
            # For org-wide data, only show teams user has access to
            if current_user.role == 'manager':
                user_teams = db.query(Team.id).join(UserTeam).filter(
                    UserTeam.user_id == current_user.id
                ).all()
                team_ids = [str(t.id) for t in user_teams]
                query = query.filter(DriverSummary.team_id.in_(team_ids))
        
        if driver_id:
            query = query.filter(DriverSummary.driver_id == driver_id)
        
        summaries = query.all()
        
        # Apply min-n enforcement
        safe_data = []
        for summary in summaries:
            # Check if we have enough responses for this driver
            response_count = db.query(NumericResponse).filter(
                NumericResponse.survey_id == survey_id,
                NumericResponse.team_id == summary.team_id,
                NumericResponse.driver_id == summary.driver_id
            ).count()
            
            if enforce_min_n(response_count, privacy_settings.min_n, current_user.company_id, db):
                safe_data.append({
                    "team_id": str(summary.team_id),
                    "driver_id": str(summary.driver_id),
                    "avg_score": summary.avg_score,
                    "detractors_pct": summary.detractors_pct,
                    "passives_pct": summary.passives_pct,
                    "promoters_pct": summary.promoters_pct,
                    "delta_vs_prev": summary.delta_vs_prev
                })
        
        return {
            "survey_id": survey_id,
            "data": safe_data,
            "safe": len(safe_data) > 0,
            "message": None if len(safe_data) > 0 else privacy_settings.safe_fallback_message
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving driver analytics: {str(e)}")

@router.get("/sentiment/{survey_id}")
async def get_sentiment_analytics(
    survey_id: str,
    team_id: Optional[str] = Query(None, description="Team ID (optional)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get sentiment analytics with min-n enforcement"""
    try:
        # Get privacy settings
        privacy_settings = get_privacy_settings(current_user.company_id, db)
        
        # Build query
        query = db.query(SentimentSummary).filter(
            SentimentSummary.survey_id == survey_id
        )
        
        # Apply filters
        if team_id:
            if not validate_team_access(current_user.id, team_id, db):
                raise HTTPException(status_code=403, detail="Access denied to team data")
            query = query.filter(SentimentSummary.team_id == team_id)
        else:
            # For org-wide data, only show teams user has access to
            if current_user.role == 'manager':
                user_teams = db.query(Team.id).join(UserTeam).filter(
                    UserTeam.user_id == current_user.id
                ).all()
                team_ids = [str(t.id) for t in user_teams]
                query = query.filter(SentimentSummary.team_id.in_(team_ids))
        
        summaries = query.all()
        
        # Apply min-n enforcement
        safe_data = []
        for summary in summaries:
            # Check if we have enough comments for this team
            comment_count = db.query(Comment).filter(
                Comment.survey_id == survey_id,
                Comment.team_id == summary.team_id
            ).count()
            
            if enforce_min_n(comment_count, privacy_settings.min_n, current_user.company_id, db):
                safe_data.append({
                    "team_id": str(summary.team_id),
                    "pos_pct": summary.pos_pct,
                    "neg_pct": summary.neg_pct,
                    "neu_pct": summary.neu_pct,
                    "delta_vs_prev": summary.delta_vs_prev
                })
        
        return {
            "survey_id": survey_id,
            "data": safe_data,
            "safe": len(safe_data) > 0,
            "message": None if len(safe_data) > 0 else privacy_settings.safe_fallback_message
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving sentiment analytics: {str(e)}")

@router.get("/comments/{survey_id}")
async def get_comments_analytics(
    survey_id: str,
    team_id: Optional[str] = Query(None, description="Team ID (optional)"),
    driver_id: Optional[str] = Query(None, description="Driver ID (optional)"),
    sentiment: Optional[str] = Query(None, description="Sentiment filter (+/0/-)"),
    limit: int = Query(10, description="Number of comments to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comments with PII masking and min-n enforcement"""
    try:
        # Get privacy settings
        privacy_settings = get_privacy_settings(current_user.company_id, db)
        
        # Build query
        query = db.query(Comment).filter(Comment.survey_id == survey_id)
        
        # Apply filters
        if team_id:
            if not validate_team_access(current_user.id, team_id, db):
                raise HTTPException(status_code=403, detail="Access denied to team data")
            query = query.filter(Comment.team_id == team_id)
        else:
            # For org-wide data, only show teams user has access to
            if current_user.role == 'manager':
                user_teams = db.query(Team.id).join(UserTeam).filter(
                    UserTeam.user_id == current_user.id
                ).all()
                team_ids = [str(t.id) for t in user_teams]
                query = query.filter(Comment.team_id.in_(team_ids))
        
        if driver_id:
            query = query.filter(Comment.driver_id == driver_id)
        
        # Check min-n before returning comments
        comment_count = query.count()
        if not enforce_min_n(comment_count, privacy_settings.min_n, current_user.company_id, db):
            return {
                "survey_id": survey_id,
                "data": [],
                "safe": False,
                "message": privacy_settings.safe_fallback_message
            }
        
        # Get comments with NLP analysis
        comments_with_nlp = query.join(CommentNLP).limit(limit).all()
        
        # Apply sentiment filter if specified
        if sentiment:
            comments_with_nlp = [c for c in comments_with_nlp if c.nlp.sentiment == sentiment]
        
        # Mask PII and format response
        safe_comments = []
        for comment in comments_with_nlp:
            masked_text = mask_pii(comment.text, privacy_settings.pii_masking_enabled)
            
            safe_comments.append({
                "id": str(comment.id),
                "text": masked_text,
                "driver_id": str(comment.driver_id) if comment.driver_id else None,
                "sentiment": comment.nlp.sentiment if comment.nlp else None,
                "themes": comment.nlp.themes if comment.nlp else [],
                "created_at": comment.ts.isoformat()
            })
        
        return {
            "survey_id": survey_id,
            "data": safe_comments,
            "safe": True,
            "message": None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving comments: {str(e)}")

@router.get("/trends/{team_id}")
async def get_trend_analytics(
    team_id: str,
    driver_id: Optional[str] = Query(None, description="Driver ID (optional)"),
    months: int = Query(12, description="Number of months to include"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get trend analytics with min-n enforcement"""
    try:
        # Validate team access
        if not validate_team_access(current_user.id, team_id, db):
            raise HTTPException(status_code=403, detail="Access denied to team data")
        
        # Get privacy settings
        privacy_settings = get_privacy_settings(current_user.company_id, db)
        
        # Build query
        query = db.query(OrgDriverTrends).filter(OrgDriverTrends.team_id == team_id)
        
        if driver_id:
            query = query.filter(OrgDriverTrends.driver_id == driver_id)
        
        # Get trends for specified months
        cutoff_date = datetime.utcnow().replace(day=1) - timedelta(days=30 * months)
        query = query.filter(OrgDriverTrends.period_month >= cutoff_date.date())
        
        trends = query.order_by(OrgDriverTrends.period_month).all()
        
        # Apply min-n enforcement
        safe_data = []
        for trend in trends:
            # Check if we have enough responses for this period
            response_count = db.query(NumericResponse).filter(
                NumericResponse.team_id == trend.team_id,
                NumericResponse.driver_id == trend.driver_id,
                NumericResponse.ts >= trend.period_month,
                NumericResponse.ts < (trend.period_month.replace(month=trend.period_month.month + 1) if trend.period_month.month < 12 else trend.period_month.replace(year=trend.period_month.year + 1, month=1))
            ).count()
            
            if enforce_min_n(response_count, privacy_settings.min_n, current_user.company_id, db):
                safe_data.append({
                    "driver_id": str(trend.driver_id),
                    "period_month": trend.period_month.isoformat(),
                    "avg_score": trend.avg_score
                })
        
        return {
            "team_id": team_id,
            "data": safe_data,
            "safe": len(safe_data) > 0,
            "message": None if len(safe_data) > 0 else privacy_settings.safe_fallback_message
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving trend analytics: {str(e)}")

@router.get("/reports/cached/{org_id}")
async def get_cached_report(
    org_id: str,
    scope: str = Query(..., description="Scope: 'org' or 'team:{id}'"),
    period_start: str = Query(..., description="Period start (YYYY-MM-DD)"),
    period_end: str = Query(..., description="Period end (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get cached report data"""
    try:
        # Validate access
        if current_user.company_id != org_id:
            raise HTTPException(status_code=403, detail="Access denied to organization data")
        
        # Parse dates
        start_date = datetime.strptime(period_start, "%Y-%m-%d").date()
        end_date = datetime.strptime(period_end, "%Y-%m-%d").date()
        
        # Get cached report
        summary_service = SummaryService(db)
        cached_report = summary_service.get_reports_cache(org_id, scope, start_date, end_date)
        
        if not cached_report:
            raise HTTPException(status_code=404, detail="Cached report not found")
        
        return {
            "org_id": org_id,
            "scope": scope,
            "period_start": period_start,
            "period_end": period_end,
            "data": cached_report.payload_json,
            "created_at": cached_report.created_at.isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving cached report: {str(e)}")
