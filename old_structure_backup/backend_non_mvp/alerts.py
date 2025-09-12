"""
Alert Management Endpoints with Role-Based Access
"""
from fastapi import APIRouter, HTTPException, Depends, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.deps import get_current_user
from app.core.privacy import validate_team_access
from app.models.base import User, Team
from app.models.advanced import UserTeam
from app.models.advanced import DashboardAlert
from app.services.audit_service import AuditService
from app.services.alert_evaluator import AlertEvaluator

router = APIRouter()

@router.get("/")
async def get_alerts(
    team_id: Optional[str] = Query(None, description="Team ID (optional for admin)"),
    status: Optional[str] = Query("active", description="Alert status: active, acknowledged, resolved"),
    severity: Optional[str] = Query(None, description="Alert severity: high, medium, low"),
    alert_type: Optional[str] = Query(None, description="Alert type filter"),
    limit: int = Query(50, description="Number of alerts to return"),
    offset: int = Query(0, description="Offset for pagination"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get alerts with role-based access control"""
    try:
        # Build base query
        query = db.query(DashboardAlert)
        
        # Apply role-based filtering
        if current_user.role == 'admin':
            # Admin can see all alerts for their organization
            query = query.filter(DashboardAlert.org_id == current_user.company_id)
            
            # Filter by team if specified
            if team_id:
                query = query.filter(DashboardAlert.team_id == team_id)
        else:
            # Manager can only see alerts for their teams
            user_teams = db.query(UserTeam.team_id).filter(
                UserTeam.user_id == current_user.id
            ).all()
            team_ids = [str(t.team_id) for t in user_teams]
            
            if not team_ids:
                return {
                    "alerts": [],
                    "total_count": 0,
                    "limit": limit,
                    "offset": offset
                }
            
            query = query.filter(DashboardAlert.team_id.in_(team_ids))
            
            # If team_id is specified, validate access
            if team_id and team_id not in team_ids:
                raise HTTPException(status_code=403, detail="Access denied to team alerts")
        
        # Apply filters
        if status == "active":
            query = query.filter(DashboardAlert.status.in_(["open", "acknowledged"]))
        elif status:
            query = query.filter(DashboardAlert.status == status)
        
        if severity:
            query = query.filter(DashboardAlert.severity == severity)
        
        if alert_type:
            query = query.filter(DashboardAlert.alert_type == alert_type)
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination and ordering
        alerts = query.order_by(desc(DashboardAlert.created_at)).offset(offset).limit(limit).all()
        
        # Format response
        alert_data = []
        for alert in alerts:
            team = db.query(Team).filter(Team.id == alert.team_id).first()
            alert_data.append({
                "id": str(alert.id),
                "team_id": str(alert.team_id),
                "team_name": team.name if team else "Unknown Team",
                "survey_id": str(alert.survey_id),
                "driver_id": str(alert.driver_id) if alert.driver_id else None,
                "alert_type": alert.alert_type,
                "severity": alert.severity,
                "reason": alert.reason,
                "current_score": alert.current_score,
                "delta_prev": alert.delta_prev,
                "status": alert.status,
                "created_at": alert.created_at.isoformat(),
                "acknowledged_at": alert.acknowledged_at.isoformat() if alert.acknowledged_at else None,
                "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None
            })
        
        return {
            "alerts": alert_data,
            "total_count": total_count,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving alerts: {str(e)}")

@router.get("/{alert_id}")
async def get_alert_details(
    alert_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed alert information"""
    try:
        alert = db.query(DashboardAlert).filter(DashboardAlert.id == alert_id).first()
        
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        # Check access
        if current_user.role == 'admin':
            if alert.org_id != current_user.company_id:
                raise HTTPException(status_code=403, detail="Access denied to alert")
        else:
            # Manager can only see alerts for their teams
            user_teams = db.query(UserTeam.team_id).filter(
                UserTeam.user_id == current_user.id
            ).all()
            team_ids = [str(t.team_id) for t in user_teams]
            
            if str(alert.team_id) not in team_ids:
                raise HTTPException(status_code=403, detail="Access denied to alert")
        
        # Get team information
        team = db.query(Team).filter(Team.id == alert.team_id).first()
        
        return {
            "id": str(alert.id),
            "team_id": str(alert.team_id),
            "team_name": team.name if team else "Unknown Team",
            "survey_id": str(alert.survey_id),
            "driver_id": str(alert.driver_id) if alert.driver_id else None,
            "alert_type": alert.alert_type,
            "severity": alert.severity,
            "reason": alert.reason,
            "current_score": alert.current_score,
            "delta_prev": alert.delta_prev,
            "status": alert.status,
            "created_at": alert.created_at.isoformat(),
            "acknowledged_at": alert.acknowledged_at.isoformat() if alert.acknowledged_at else None,
            "acknowledged_by": alert.acknowledged_by,
            "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None,
            "resolved_by": alert.resolved_by,
            "resolution_notes": alert.resolution_notes
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving alert details: {str(e)}")

@router.post("/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Acknowledge an alert"""
    try:
        alert = db.query(DashboardAlert).filter(DashboardAlert.id == alert_id).first()
        
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        # Check access
        if current_user.role == 'admin':
            if alert.org_id != current_user.company_id:
                raise HTTPException(status_code=403, detail="Access denied to alert")
        else:
            # Manager can only acknowledge alerts for their teams
            user_teams = db.query(UserTeam.team_id).filter(
                UserTeam.user_id == current_user.id
            ).all()
            team_ids = [str(t.team_id) for t in user_teams]
            
            if str(alert.team_id) not in team_ids:
                raise HTTPException(status_code=403, detail="Access denied to alert")
        
        # Acknowledge alert
        evaluator = AlertEvaluator(db)
        success = evaluator.acknowledge_alert(alert_id, current_user.id)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to acknowledge alert")
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_alert_acknowledgment(
            user_id=current_user.id,
            org_id=alert.org_id,
            alert_id=alert_id,
            previous_status=alert.status
        )
        
        return {
            "message": "Alert acknowledged successfully",
            "alert_id": alert_id,
            "acknowledged_by": current_user.id,
            "acknowledged_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error acknowledging alert: {str(e)}")

@router.post("/{alert_id}/resolve")
async def resolve_alert(
    alert_id: str,
    resolution_data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Resolve an alert"""
    try:
        alert = db.query(DashboardAlert).filter(DashboardAlert.id == alert_id).first()
        
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        # Check access
        if current_user.role == 'admin':
            if alert.org_id != current_user.company_id:
                raise HTTPException(status_code=403, detail="Access denied to alert")
        else:
            # Manager can only resolve alerts for their teams
            user_teams = db.query(UserTeam.team_id).filter(
                UserTeam.user_id == current_user.id
            ).all()
            team_ids = [str(t.team_id) for t in user_teams]
            
            if str(alert.team_id) not in team_ids:
                raise HTTPException(status_code=403, detail="Access denied to alert")
        
        # Resolve alert
        resolution_notes = resolution_data.get("resolution_notes")
        evaluator = AlertEvaluator(db)
        success = evaluator.resolve_alert(alert_id, current_user.id, resolution_notes)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to resolve alert")
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_alert_resolution(
            user_id=current_user.id,
            org_id=alert.org_id,
            alert_id=alert_id,
            previous_status=alert.status,
            resolution_notes=resolution_notes
        )
        
        return {
            "message": "Alert resolved successfully",
            "alert_id": alert_id,
            "resolved_by": current_user.id,
            "resolved_at": datetime.utcnow().isoformat(),
            "resolution_notes": resolution_notes
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resolving alert: {str(e)}")

@router.get("/history/summary")
async def get_alert_history_summary(
    team_id: Optional[str] = Query(None, description="Team ID (optional for admin)"),
    days: int = Query(90, description="Number of days to look back"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get alert history summary"""
    try:
        # Build base query
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        query = db.query(DashboardAlert).filter(DashboardAlert.created_at >= cutoff_date)
        
        # Apply role-based filtering
        if current_user.role == 'admin':
            query = query.filter(DashboardAlert.org_id == current_user.company_id)
            if team_id:
                query = query.filter(DashboardAlert.team_id == team_id)
        else:
            # Manager can only see alerts for their teams
            user_teams = db.query(UserTeam.team_id).filter(
                UserTeam.user_id == current_user.id
            ).all()
            team_ids = [str(t.team_id) for t in user_teams]
            
            if not team_ids:
                return {
                    "total_alerts": 0,
                    "by_severity": {},
                    "by_type": {},
                    "by_status": {},
                    "resolution_time_avg": 0
                }
            
            query = query.filter(DashboardAlert.team_id.in_(team_ids))
        
        alerts = query.all()
        
        # Calculate summary statistics
        total_alerts = len(alerts)
        by_severity = {"high": 0, "medium": 0, "low": 0}
        by_type = {}
        by_status = {"open": 0, "acknowledged": 0, "resolved": 0}
        resolution_times = []
        
        for alert in alerts:
            # Severity breakdown
            by_severity[alert.severity] = by_severity.get(alert.severity, 0) + 1
            
            # Type breakdown
            by_type[alert.alert_type] = by_type.get(alert.alert_type, 0) + 1
            
            # Status breakdown
            by_status[alert.status] = by_status.get(alert.status, 0) + 1
            
            # Resolution time calculation
            if alert.resolved_at and alert.created_at:
                resolution_time = (alert.resolved_at - alert.created_at).total_seconds() / 3600  # hours
                resolution_times.append(resolution_time)
        
        avg_resolution_time = sum(resolution_times) / len(resolution_times) if resolution_times else 0
        
        return {
            "total_alerts": total_alerts,
            "by_severity": by_severity,
            "by_type": by_type,
            "by_status": by_status,
            "resolution_time_avg": round(avg_resolution_time, 1),
            "period_days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving alert history: {str(e)}")

@router.post("/evaluate/{survey_id}")
async def evaluate_survey_alerts(
    survey_id: str,
    team_id: Optional[str] = Query(None, description="Team ID (optional, evaluates all teams if not specified)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manually trigger alert evaluation for a survey"""
    try:
        # Only admins can trigger alert evaluation
        if current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="Only admins can trigger alert evaluation")
        
        evaluator = AlertEvaluator(db)
        
        if team_id:
            # Evaluate for specific team
            alerts = evaluator.evaluate_survey_alerts(survey_id, team_id, current_user.company_id)
            return {
                "message": f"Evaluated alerts for team {team_id}",
                "survey_id": survey_id,
                "team_id": team_id,
                "alerts_created": len(alerts)
            }
        else:
            # Evaluate for all teams
            from app.models.base import Survey
            survey = db.query(Survey).filter(Survey.id == survey_id).first()
            if not survey:
                raise HTTPException(status_code=404, detail="Survey not found")
            
            # Get all teams that participated in this survey
            from app.models.summaries import ParticipationSummary
            participations = db.query(ParticipationSummary).filter(
                ParticipationSummary.survey_id == survey_id
            ).all()
            
            total_alerts = 0
            for participation in participations:
                alerts = evaluator.evaluate_survey_alerts(survey_id, str(participation.team_id), current_user.company_id)
                total_alerts += len(alerts)
            
            return {
                "message": f"Evaluated alerts for all teams",
                "survey_id": survey_id,
                "teams_evaluated": len(participations),
                "total_alerts_created": total_alerts
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error evaluating alerts: {str(e)}")
