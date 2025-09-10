"""
Export Safety Validation with Universal Min-n Enforcement
"""
from fastapi import APIRouter, HTTPException, Depends, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.core.database import get_db
from app.api.deps import get_current_user
from app.core.min_n_guard import validate_export_safety, get_safe_team_list
from app.models.base import User, Survey
from app.models.summaries import ParticipationSummary, DriverSummary, SentimentSummary

router = APIRouter()

@router.post("/validate-safety")
async def validate_export_safety_endpoint(
    export_request: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Validate export safety with min-n enforcement"""
    try:
        survey_id = export_request.get("survey_id")
        team_ids = export_request.get("team_ids", [])
        export_type = export_request.get("export_type", "csv")
        
        if not survey_id:
            raise HTTPException(status_code=400, detail="survey_id is required")
        
        # Validate survey exists and user has access
        survey = db.query(Survey).filter(
            Survey.id == survey_id,
            Survey.creator_id == current_user.company_id
        ).first()
        
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        # If no specific teams, get all safe teams
        if not team_ids:
            team_ids = get_safe_team_list(current_user.company_id, survey_id, db)
        
        # Validate export safety
        validation_result = validate_export_safety(
            current_user.company_id, team_ids, survey_id, db
        )
        
        return {
            "survey_id": survey_id,
            "export_type": export_type,
            "can_export": validation_result["can_export"],
            "safe_teams": validation_result["safe_teams"],
            "unsafe_teams": validation_result["unsafe_teams"],
            "message": validation_result["message"],
            "total_teams": len(team_ids),
            "safe_count": len(validation_result["safe_teams"]),
            "unsafe_count": len(validation_result["unsafe_teams"])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating export safety: {str(e)}")

@router.post("/csv")
async def export_csv_with_safety(
    export_request: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export CSV with min-n enforcement"""
    try:
        survey_id = export_request.get("survey_id")
        team_ids = export_request.get("team_ids", [])
        data_type = export_request.get("data_type", "all")  # all, participation, drivers, sentiment
        
        if not survey_id:
            raise HTTPException(status_code=400, detail="survey_id is required")
        
        # Validate export safety first
        validation_result = validate_export_safety(
            current_user.company_id, team_ids, survey_id, db
        )
        
        if not validation_result["can_export"]:
            raise HTTPException(
                status_code=400, 
                detail=f"Export blocked: {validation_result['message']}"
            )
        
        # Only export safe teams
        safe_team_ids = validation_result["safe_teams"]
        
        # Build CSV data based on type
        csv_data = []
        
        if data_type in ["all", "participation"]:
            participations = db.query(ParticipationSummary).filter(
                ParticipationSummary.survey_id == survey_id,
                ParticipationSummary.team_id.in_(safe_team_ids)
            ).all()
            
            for participation in participations:
                csv_data.append({
                    "type": "participation",
                    "team_id": str(participation.team_id),
                    "respondents": participation.respondents,
                    "team_size": participation.team_size,
                    "participation_pct": participation.participation_pct,
                    "delta_pct": participation.delta_pct
                })
        
        if data_type in ["all", "drivers"]:
            drivers = db.query(DriverSummary).filter(
                DriverSummary.survey_id == survey_id,
                DriverSummary.team_id.in_(safe_team_ids)
            ).all()
            
            for driver in drivers:
                csv_data.append({
                    "type": "driver",
                    "team_id": str(driver.team_id),
                    "driver_id": str(driver.driver_id),
                    "avg_score": driver.avg_score,
                    "detractors_pct": driver.detractors_pct,
                    "passives_pct": driver.passives_pct,
                    "promoters_pct": driver.promoters_pct,
                    "delta_vs_prev": driver.delta_vs_prev
                })
        
        if data_type in ["all", "sentiment"]:
            sentiments = db.query(SentimentSummary).filter(
                SentimentSummary.survey_id == survey_id,
                SentimentSummary.team_id.in_(safe_team_ids)
            ).all()
            
            for sentiment in sentiments:
                csv_data.append({
                    "type": "sentiment",
                    "team_id": str(sentiment.team_id),
                    "pos_pct": sentiment.pos_pct,
                    "neg_pct": sentiment.neg_pct,
                    "neu_pct": sentiment.neu_pct,
                    "delta_vs_prev": sentiment.delta_vs_prev
                })
        
        return {
            "survey_id": survey_id,
            "export_type": "csv",
            "data_type": data_type,
            "safe_teams": safe_team_ids,
            "total_records": len(csv_data),
            "csv_data": csv_data,
            "exported_at": datetime.utcnow().isoformat(),
            "message": f"Successfully exported {len(csv_data)} records from {len(safe_team_ids)} safe teams"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting CSV: {str(e)}")

@router.post("/pdf")
async def export_pdf_with_safety(
    export_request: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export PDF with min-n enforcement"""
    try:
        survey_id = export_request.get("survey_id")
        team_ids = export_request.get("team_ids", [])
        report_type = export_request.get("report_type", "digest")  # digest, detailed, summary
        
        if not survey_id:
            raise HTTPException(status_code=400, detail="survey_id is required")
        
        # Validate export safety first
        validation_result = validate_export_safety(
            current_user.company_id, team_ids, survey_id, db
        )
        
        if not validation_result["can_export"]:
            raise HTTPException(
                status_code=400, 
                detail=f"Export blocked: {validation_result['message']}"
            )
        
        # Only export safe teams
        safe_team_ids = validation_result["safe_teams"]
        
        # Build PDF report data
        pdf_data = {
            "survey_id": survey_id,
            "report_type": report_type,
            "safe_teams": safe_team_ids,
            "generated_at": datetime.utcnow().isoformat(),
            "sections": {}
        }
        
        # Add sections based on report type
        if report_type in ["digest", "detailed"]:
            # Participation summary
            participations = db.query(ParticipationSummary).filter(
                ParticipationSummary.survey_id == survey_id,
                ParticipationSummary.team_id.in_(safe_team_ids)
            ).all()
            
            pdf_data["sections"]["participation"] = [
                {
                    "team_id": str(p.team_id),
                    "respondents": p.respondents,
                    "participation_pct": p.participation_pct
                }
                for p in participations
            ]
        
        if report_type in ["digest", "detailed"]:
            # Driver summary
            drivers = db.query(DriverSummary).filter(
                DriverSummary.survey_id == survey_id,
                DriverSummary.team_id.in_(safe_team_ids)
            ).all()
            
            pdf_data["sections"]["drivers"] = [
                {
                    "team_id": str(d.team_id),
                    "driver_id": str(d.driver_id),
                    "avg_score": d.avg_score,
                    "promoters_pct": d.promoters_pct
                }
                for d in drivers
            ]
        
        if report_type == "detailed":
            # Sentiment summary
            sentiments = db.query(SentimentSummary).filter(
                SentimentSummary.survey_id == survey_id,
                SentimentSummary.team_id.in_(safe_team_ids)
            ).all()
            
            pdf_data["sections"]["sentiment"] = [
                {
                    "team_id": str(s.team_id),
                    "pos_pct": s.pos_pct,
                    "neg_pct": s.neg_pct
                }
                for s in sentiments
            ]
        
        return {
            "survey_id": survey_id,
            "export_type": "pdf",
            "report_type": report_type,
            "safe_teams": safe_team_ids,
            "pdf_data": pdf_data,
            "generated_at": datetime.utcnow().isoformat(),
            "message": f"Successfully generated PDF report for {len(safe_team_ids)} safe teams"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting PDF: {str(e)}")

@router.get("/safe-teams/{survey_id}")
async def get_safe_teams_for_export(
    survey_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of teams that are safe for export"""
    try:
        # Validate survey exists and user has access
        survey = db.query(Survey).filter(
            Survey.id == survey_id,
            Survey.creator_id == current_user.company_id
        ).first()
        
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        # Get safe teams
        safe_teams = get_safe_team_list(current_user.company_id, survey_id, db)
        
        return {
            "survey_id": survey_id,
            "safe_teams": safe_teams,
            "total_safe_teams": len(safe_teams),
            "message": f"Found {len(safe_teams)} teams with sufficient responses for safe export"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting safe teams: {str(e)}")
