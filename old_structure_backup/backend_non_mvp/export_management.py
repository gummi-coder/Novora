"""
Export Management Endpoints
Complete export and integration functionality
"""
from fastapi import APIRouter, HTTPException, Depends, Query, Path, Body, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import Dict, Any, List, Optional
from datetime import datetime, date, timedelta
import uuid
import json
import csv
import io
import pandas as pd
from fastapi.responses import StreamingResponse

from app.core.database import get_db
from app.api.deps import get_current_user, get_current_admin_user
from app.models.base import User
from app.models.surveys import Survey, SurveyToken
from app.models.responses import NumericResponse, Comment
from app.models.aggregations import ParticipationSummary, DriverSummary, SentimentSummary
from app.models.teams import Team
from app.models.employees import Employee
from app.models.drivers import Driver
from app.models.alerts import DashboardAlert
from app.services.export_service import ExportService
from app.services.report_generator import ReportGenerator
from app.utils.audit import audit_log
from app.utils.min_n_check import check_min_n_compliance

router = APIRouter()

# ============================================================================
# EXPORT ENDPOINTS
# ============================================================================

@router.post("/exports/survey-responses")
async def export_survey_responses(
    survey_id: str = Query(...),
    format: str = Query("csv", pattern="^(csv|excel|pdf)$"),
    filters: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Export survey responses with filtering
    """
    try:
        # Get survey
        survey = db.query(Survey).filter(Survey.id == survey_id).first()
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        # Validate access
        if current_user.org_id != survey.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Build query for numeric responses
        query = db.query(NumericResponse).filter(NumericResponse.survey_id == survey_id)
        
        # Apply filters
        if filters.get("team_id"):
            query = query.filter(NumericResponse.team_id == filters["team_id"])
        if filters.get("driver_id"):
            query = query.filter(NumericResponse.driver_id == filters["driver_id"])
        if filters.get("min_score"):
            query = query.filter(NumericResponse.score >= filters["min_score"])
        if filters.get("max_score"):
            query = query.filter(NumericResponse.score <= filters["max_score"])
        
        # Get responses
        responses = query.all()
        
        if not responses:
            raise HTTPException(status_code=404, detail="No responses found")
        
        # Check min-n compliance
        min_n_check = check_min_n_compliance(db, survey.org_id, filters.get("team_id"))
        if not min_n_check["compliant"]:
            raise HTTPException(status_code=400, detail="Insufficient responses for export")
        
        # Prepare data for export
        export_data = []
        for response in responses:
            export_data.append({
                "survey_id": response.survey_id,
                "team_id": response.team_id,
                "driver_id": response.driver_id,
                "score": response.score,
                "timestamp": response.ts.isoformat() if response.ts else None
            })
        
        # Create export service
        export_service = ExportService()
        
        if format == "csv":
            # Generate CSV
            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=export_data[0].keys())
            writer.writeheader()
            writer.writerows(export_data)
            
            # Audit log
            audit_log(
                db=db,
                user_id=current_user.id,
                action="survey_responses_exported",
                resource_type="survey",
                resource_id=survey_id,
                details={"format": "csv", "records_exported": len(export_data)}
            )
            
            return StreamingResponse(
                io.BytesIO(output.getvalue().encode()),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=survey_responses_{survey_id}.csv"}
            )
        
        elif format == "excel":
            # Generate Excel
            df = pd.DataFrame(export_data)
            output = io.BytesIO()
            df.to_excel(output, index=False)
            output.seek(0)
            
            # Audit log
            audit_log(
                db=db,
                user_id=current_user.id,
                action="survey_responses_exported",
                resource_type="survey",
                resource_id=survey_id,
                details={"format": "excel", "records_exported": len(export_data)}
            )
            
            return StreamingResponse(
                output,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": f"attachment; filename=survey_responses_{survey_id}.xlsx"}
            )
        
        elif format == "pdf":
            # Generate PDF report
            report_generator = ReportGenerator()
            pdf_content = report_generator.generate_survey_responses_pdf(
                survey=survey,
                responses=export_data,
                filters=filters
            )
            
            # Audit log
            audit_log(
                db=db,
                user_id=current_user.id,
                action="survey_responses_exported",
                resource_type="survey",
                resource_id=survey_id,
                details={"format": "pdf", "records_exported": len(export_data)}
            )
            
            return StreamingResponse(
                io.BytesIO(pdf_content),
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename=survey_responses_{survey_id}.pdf"}
            )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export survey responses: {str(e)}")

@router.post("/exports/team-report")
async def export_team_report(
    team_id: str = Query(...),
    period_start: date = Query(...),
    period_end: date = Query(...),
    format: str = Query("pdf", pattern="^(pdf|excel)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Export team report for a specific period
    """
    try:
        # Get team
        team = db.query(Team).filter(Team.id == team_id).first()
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")
        
        # Validate access
        if current_user.org_id != team.org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get surveys in period
        surveys = db.query(Survey).filter(
            and_(
                Survey.org_id == team.org_id,
                Survey.created_at >= period_start,
                Survey.created_at <= period_end,
                Survey.status.in_(["active", "closed"])
            )
        ).all()
        
        if not surveys:
            raise HTTPException(status_code=404, detail="No surveys found in specified period")
        
        # Get participation summary
        participation_data = db.query(ParticipationSummary).filter(
            and_(
                ParticipationSummary.team_id == team_id,
                ParticipationSummary.survey_id.in_([s.id for s in surveys])
            )
        ).all()
        
        # Get driver summary
        driver_data = db.query(DriverSummary).filter(
            and_(
                DriverSummary.team_id == team_id,
                DriverSummary.survey_id.in_([s.id for s in surveys])
            )
        ).all()
        
        # Get sentiment summary
        sentiment_data = db.query(SentimentSummary).filter(
            and_(
                SentimentSummary.team_id == team_id,
                SentimentSummary.survey_id.in_([s.id for s in surveys])
            )
        ).all()
        
        # Check min-n compliance
        min_n_check = check_min_n_compliance(db, team.org_id, team_id)
        if not min_n_check["compliant"]:
            raise HTTPException(status_code=400, detail="Insufficient responses for team report")
        
        # Prepare report data
        report_data = {
            "team": {
                "id": team.id,
                "name": team.name,
                "description": team.description
            },
            "period": {
                "start": period_start.isoformat(),
                "end": period_end.isoformat()
            },
            "surveys": [{"id": s.id, "name": s.name, "status": s.status} for s in surveys],
            "participation": [
                {
                    "survey_id": p.survey_id,
                    "respondents": p.respondents,
                    "team_size": p.team_size,
                    "participation_pct": p.participation_pct,
                    "delta_pct": p.delta_pct
                }
                for p in participation_data
            ],
            "drivers": [
                {
                    "survey_id": d.survey_id,
                    "driver_id": d.driver_id,
                    "avg_score": d.avg_score,
                    "detractors_pct": d.detractors_pct,
                    "passives_pct": d.passives_pct,
                    "promoters_pct": d.promoters_pct
                }
                for d in driver_data
            ],
            "sentiment": [
                {
                    "survey_id": s.survey_id,
                    "pos_pct": s.pos_pct,
                    "neu_pct": s.neu_pct,
                    "neg_pct": s.neg_pct
                }
                for s in sentiment_data
            ]
        }
        
        if format == "pdf":
            # Generate PDF report
            report_generator = ReportGenerator()
            pdf_content = report_generator.generate_team_report_pdf(report_data)
            
            # Audit log
            audit_log(
                db=db,
                user_id=current_user.id,
                action="team_report_exported",
                resource_type="team",
                resource_id=team_id,
                details={"format": "pdf", "period_start": period_start.isoformat(), "period_end": period_end.isoformat()}
            )
            
            return StreamingResponse(
                io.BytesIO(pdf_content),
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename=team_report_{team_id}_{period_start}_{period_end}.pdf"}
            )
        
        elif format == "excel":
            # Generate Excel report
            with pd.ExcelWriter(io.BytesIO(), engine='openpyxl') as writer:
                # Participation sheet
                participation_df = pd.DataFrame(report_data["participation"])
                participation_df.to_excel(writer, sheet_name="Participation", index=False)
                
                # Drivers sheet
                drivers_df = pd.DataFrame(report_data["drivers"])
                drivers_df.to_excel(writer, sheet_name="Drivers", index=False)
                
                # Sentiment sheet
                sentiment_df = pd.DataFrame(report_data["sentiment"])
                sentiment_df.to_excel(writer, sheet_name="Sentiment", index=False)
            
            writer.seek(0)
            
            # Audit log
            audit_log(
                db=db,
                user_id=current_user.id,
                action="team_report_exported",
                resource_type="team",
                resource_id=team_id,
                details={"format": "excel", "period_start": period_start.isoformat(), "period_end": period_end.isoformat()}
            )
            
            return StreamingResponse(
                writer,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": f"attachment; filename=team_report_{team_id}_{period_start}_{period_end}.xlsx"}
            )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export team report: {str(e)}")

@router.post("/exports/org-report")
async def export_org_report(
    org_id: str = Query(...),
    period_start: date = Query(...),
    period_end: date = Query(...),
    format: str = Query("pdf", pattern="^(pdf|excel)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Export organization report for a specific period
    """
    try:
        # Validate access
        if current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get surveys in period
        surveys = db.query(Survey).filter(
            and_(
                Survey.org_id == org_id,
                Survey.created_at >= period_start,
                Survey.created_at <= period_end,
                Survey.status.in_(["active", "closed"])
            )
        ).all()
        
        if not surveys:
            raise HTTPException(status_code=404, detail="No surveys found in specified period")
        
        # Get teams
        teams = db.query(Team).filter(Team.org_id == org_id).all()
        
        # Get organization-wide summaries
        org_participation = db.query(ParticipationSummary).filter(
            and_(
                ParticipationSummary.survey_id.in_([s.id for s in surveys])
            )
        ).all()
        
        org_drivers = db.query(DriverSummary).filter(
            and_(
                DriverSummary.survey_id.in_([s.id for s in surveys])
            )
        ).all()
        
        org_sentiment = db.query(SentimentSummary).filter(
            and_(
                SentimentSummary.survey_id.in_([s.id for s in surveys])
            )
        ).all()
        
        # Get alerts in period
        alerts = db.query(DashboardAlert).filter(
            and_(
                DashboardAlert.org_id == org_id,
                DashboardAlert.created_at >= period_start,
                DashboardAlert.created_at <= period_end
            )
        ).all()
        
        # Prepare report data
        report_data = {
            "organization": {
                "id": org_id,
                "name": "Organization Report"  # Could be fetched from org table
            },
            "period": {
                "start": period_start.isoformat(),
                "end": period_end.isoformat()
            },
            "surveys": [{"id": s.id, "name": s.name, "status": s.status} for s in surveys],
            "teams": [{"id": t.id, "name": t.name} for t in teams],
            "participation": [
                {
                    "survey_id": p.survey_id,
                    "team_id": p.team_id,
                    "respondents": p.respondents,
                    "team_size": p.team_size,
                    "participation_pct": p.participation_pct
                }
                for p in org_participation
            ],
            "drivers": [
                {
                    "survey_id": d.survey_id,
                    "team_id": d.team_id,
                    "driver_id": d.driver_id,
                    "avg_score": d.avg_score,
                    "detractors_pct": d.detractors_pct,
                    "passives_pct": d.passives_pct,
                    "promoters_pct": d.promoters_pct
                }
                for d in org_drivers
            ],
            "sentiment": [
                {
                    "survey_id": s.survey_id,
                    "team_id": s.team_id,
                    "pos_pct": s.pos_pct,
                    "neu_pct": s.neu_pct,
                    "neg_pct": s.neg_pct
                }
                for s in org_sentiment
            ],
            "alerts": [
                {
                    "id": a.id,
                    "team_id": a.team_id,
                    "driver_id": a.driver_id,
                    "severity": a.severity,
                    "reason": a.reason,
                    "status": a.status,
                    "created_at": a.created_at.isoformat()
                }
                for a in alerts
            ]
        }
        
        if format == "pdf":
            # Generate PDF report
            report_generator = ReportGenerator()
            pdf_content = report_generator.generate_org_report_pdf(report_data)
            
            # Audit log
            audit_log(
                db=db,
                user_id=current_user.id,
                action="org_report_exported",
                resource_type="organization",
                resource_id=org_id,
                details={"format": "pdf", "period_start": period_start.isoformat(), "period_end": period_end.isoformat()}
            )
            
            return StreamingResponse(
                io.BytesIO(pdf_content),
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename=org_report_{org_id}_{period_start}_{period_end}.pdf"}
            )
        
        elif format == "excel":
            # Generate Excel report
            with pd.ExcelWriter(io.BytesIO(), engine='openpyxl') as writer:
                # Overview sheet
                overview_data = {
                    "Total Surveys": len(surveys),
                    "Total Teams": len(teams),
                    "Total Alerts": len(alerts),
                    "Period Start": period_start.isoformat(),
                    "Period End": period_end.isoformat()
                }
                overview_df = pd.DataFrame([overview_data])
                overview_df.to_excel(writer, sheet_name="Overview", index=False)
                
                # Participation sheet
                participation_df = pd.DataFrame(report_data["participation"])
                participation_df.to_excel(writer, sheet_name="Participation", index=False)
                
                # Drivers sheet
                drivers_df = pd.DataFrame(report_data["drivers"])
                drivers_df.to_excel(writer, sheet_name="Drivers", index=False)
                
                # Sentiment sheet
                sentiment_df = pd.DataFrame(report_data["sentiment"])
                sentiment_df.to_excel(writer, sheet_name="Sentiment", index=False)
                
                # Alerts sheet
                alerts_df = pd.DataFrame(report_data["alerts"])
                alerts_df.to_excel(writer, sheet_name="Alerts", index=False)
            
            writer.seek(0)
            
            # Audit log
            audit_log(
                db=db,
                user_id=current_user.id,
                action="org_report_exported",
                resource_type="organization",
                resource_id=org_id,
                details={"format": "excel", "period_start": period_start.isoformat(), "period_end": period_end.isoformat()}
            )
            
            return StreamingResponse(
                writer,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": f"attachment; filename=org_report_{org_id}_{period_start}_{period_end}.xlsx"}
            )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export org report: {str(e)}")

# ============================================================================
# INTEGRATION ENDPOINTS
# ============================================================================

@router.get("/integrations/slack/connect")
async def connect_slack(
    org_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Connect Slack integration
    """
    try:
        # Validate access
        if current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Generate OAuth URL for Slack
        slack_oauth_url = f"https://slack.com/oauth/v2/authorize?client_id={settings.SLACK_CLIENT_ID}&scope=chat:write,channels:read&redirect_uri={settings.SLACK_REDIRECT_URI}"
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="slack_integration_initiated",
            resource_type="integration",
            resource_id=None,
            details={"org_id": org_id}
        )
        
        return {
            "message": "Slack integration initiated",
            "oauth_url": slack_oauth_url,
            "org_id": org_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initiate Slack integration: {str(e)}")

@router.get("/integrations/teams/connect")
async def connect_teams(
    org_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Connect Microsoft Teams integration
    """
    try:
        # Validate access
        if current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Generate OAuth URL for Teams
        teams_oauth_url = f"https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id={settings.TEAMS_CLIENT_ID}&response_type=code&redirect_uri={settings.TEAMS_REDIRECT_URI}&scope=Chat.ReadWrite"
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="teams_integration_initiated",
            resource_type="integration",
            resource_id=None,
            details={"org_id": org_id}
        )
        
        return {
            "message": "Microsoft Teams integration initiated",
            "oauth_url": teams_oauth_url,
            "org_id": org_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initiate Teams integration: {str(e)}")

@router.post("/integrations/webhook")
async def create_webhook(
    webhook_data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Create webhook for external integrations
    """
    try:
        org_id = webhook_data.get("org_id")
        if not org_id or current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Validate webhook data
        required_fields = ["name", "url", "events"]
        missing_fields = [field for field in required_fields if field not in webhook_data]
        if missing_fields:
            raise HTTPException(status_code=400, detail=f"Missing required fields: {missing_fields}")
        
        # Create webhook record (assuming webhook model exists)
        webhook_id = str(uuid.uuid4())
        
        # Audit log
        audit_log(
            db=db,
            user_id=current_user.id,
            action="webhook_created",
            resource_type="webhook",
            resource_id=webhook_id,
            details={
                "webhook_name": webhook_data["name"],
                "webhook_url": webhook_data["url"],
                "events": webhook_data["events"]
            }
        )
        
        return {
            "message": "Webhook created successfully",
            "webhook_id": webhook_id,
            "name": webhook_data["name"],
            "url": webhook_data["url"],
            "events": webhook_data["events"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create webhook: {str(e)}")

# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================

@router.get("/analytics/benchmarks")
async def get_benchmarks(
    org_id: str = Query(...),
    industry: Optional[str] = Query(None),
    size: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get industry benchmarks
    """
    try:
        # Validate access
        if current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Mock benchmark data (in real implementation, this would come from a benchmark database)
        benchmarks = {
            "participation_rate": {
                "industry_avg": 75.0,
                "top_quartile": 85.0,
                "bottom_quartile": 60.0
            },
            "engagement_score": {
                "industry_avg": 7.2,
                "top_quartile": 8.1,
                "bottom_quartile": 6.3
            },
            "eNPS": {
                "industry_avg": 25.0,
                "top_quartile": 45.0,
                "bottom_quartile": 5.0
            }
        }
        
        # Filter by industry if provided
        if industry:
            # In real implementation, filter benchmarks by industry
            pass
        
        # Filter by company size if provided
        if size:
            # In real implementation, filter benchmarks by company size
            pass
        
        return {
            "org_id": org_id,
            "industry": industry,
            "size": size,
            "benchmarks": benchmarks,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get benchmarks: {str(e)}")

@router.get("/analytics/predictions")
async def get_predictions(
    org_id: str = Query(...),
    team_id: Optional[str] = Query(None),
    driver_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get predictive analytics
    """
    try:
        # Validate access
        if current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get historical data for predictions
        query = db.query(DriverSummary).join(Survey).filter(Survey.org_id == org_id)
        
        if team_id:
            query = query.filter(DriverSummary.team_id == team_id)
        if driver_id:
            query = query.filter(DriverSummary.driver_id == driver_id)
        
        historical_data = query.order_by(DriverSummary.survey_id).limit(12).all()
        
        if not historical_data:
            raise HTTPException(status_code=404, detail="Insufficient historical data for predictions")
        
        # Simple trend analysis (in real implementation, use ML models)
        scores = [d.avg_score for d in historical_data]
        if len(scores) >= 2:
            trend = (scores[-1] - scores[0]) / len(scores)
            prediction_next = min(10.0, max(0.0, scores[-1] + trend))
            confidence = 0.7 if len(scores) >= 6 else 0.5
        else:
            prediction_next = scores[0] if scores else 7.0
            confidence = 0.3
        
        return {
            "org_id": org_id,
            "team_id": team_id,
            "driver_id": driver_id,
            "historical_data": [
                {
                    "survey_id": d.survey_id,
                    "avg_score": d.avg_score,
                    "respondents": d.respondents
                }
                for d in historical_data
            ],
            "predictions": {
                "next_survey_score": round(prediction_next, 2),
                "confidence": confidence,
                "trend": "increasing" if trend > 0 else "decreasing" if trend < 0 else "stable",
                "recommendations": [
                    "Focus on areas with declining scores",
                    "Maintain high-performing drivers",
                    "Increase participation through targeted communication"
                ]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get predictions: {str(e)}")

@router.get("/analytics/insights")
async def get_insights(
    org_id: str = Query(...),
    survey_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get AI-generated insights
    """
    try:
        # Validate access
        if current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get survey data
        if survey_id:
            surveys = db.query(Survey).filter(
                and_(
                    Survey.id == survey_id,
                    Survey.org_id == org_id
                )
            ).all()
        else:
            # Get latest survey
            surveys = db.query(Survey).filter(
                and_(
                    Survey.org_id == org_id,
                    Survey.status.in_(["active", "closed"])
                )
            ).order_by(Survey.created_at.desc()).limit(1).all()
        
        if not surveys:
            raise HTTPException(status_code=404, detail="No surveys found")
        
        survey = surveys[0]
        
        # Get insights data
        driver_summaries = db.query(DriverSummary).filter(DriverSummary.survey_id == survey.id).all()
        sentiment_summaries = db.query(SentimentSummary).filter(SentimentSummary.survey_id == survey.id).all()
        alerts = db.query(DashboardAlert).filter(
            and_(
                DashboardAlert.survey_id == survey.id,
                DashboardAlert.status == "open"
            )
        ).all()
        
        # Generate insights (in real implementation, use AI/ML models)
        insights = []
        
        # Participation insights
        total_teams = len(set(ds.team_id for ds in driver_summaries))
        high_participation_teams = len([ds for ds in driver_summaries if ds.respondents >= 10])
        
        if high_participation_teams < total_teams * 0.8:
            insights.append({
                "type": "participation",
                "severity": "medium",
                "title": "Low Participation Detected",
                "description": f"Only {high_participation_teams}/{total_teams} teams have good participation rates",
                "recommendation": "Consider targeted communication campaigns to increase engagement"
            })
        
        # Score insights
        avg_scores = [ds.avg_score for ds in driver_summaries if ds.avg_score is not None]
        if avg_scores:
            overall_avg = sum(avg_scores) / len(avg_scores)
            low_score_drivers = [ds for ds in driver_summaries if ds.avg_score and ds.avg_score < 6.0]
            
            if low_score_drivers:
                insights.append({
                    "type": "performance",
                    "severity": "high",
                    "title": "Low Scores Identified",
                    "description": f"{len(low_score_drivers)} drivers have average scores below 6.0",
                    "recommendation": "Focus on improving these specific areas through targeted initiatives"
                })
        
        # Alert insights
        if alerts:
            insights.append({
                "type": "alerts",
                "severity": "high",
                "title": "Active Alerts",
                "description": f"{len(alerts)} active alerts require attention",
                "recommendation": "Review and address alerts promptly to prevent issues from escalating"
            })
        
        # Sentiment insights
        if sentiment_summaries:
            avg_negative = sum(s.neg_pct for s in sentiment_summaries) / len(sentiment_summaries)
            if avg_negative > 30:
                insights.append({
                    "type": "sentiment",
                    "severity": "medium",
                    "title": "High Negative Sentiment",
                    "description": f"Average negative sentiment is {avg_negative:.1f}%",
                    "recommendation": "Investigate causes of negative feedback and implement improvement plans"
                })
        
        return {
            "survey_id": survey.id,
            "survey_name": survey.name,
            "insights": insights,
            "summary": {
                "total_insights": len(insights),
                "high_severity": len([i for i in insights if i["severity"] == "high"]),
                "medium_severity": len([i for i in insights if i["severity"] == "medium"]),
                "low_severity": len([i for i in insights if i["severity"] == "low"])
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get insights: {str(e)}")
