"""
Min-n Check Utility
Validates minimum response requirements for data privacy
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, Optional

def check_min_n_compliance(db: Session, org_id: str, team_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Check if data meets minimum response requirements for privacy
    
    Args:
        db: Database session
        org_id: Organization ID
        team_id: Optional team ID to filter by
        
    Returns:
        Dictionary with compliance status and details
    """
    try:
        # Get organization settings for min-n requirement
        from app.models.settings import OrgSettings
        org_settings = db.query(OrgSettings).filter(OrgSettings.org_id == org_id).first()
        
        if not org_settings:
            # Default min-n if no settings found
            min_n = 4
        else:
            min_n = org_settings.min_n
        
        # Build query to count responses
        from app.models.responses import NumericResponse
        
        query = db.query(func.count(NumericResponse.id)).filter(NumericResponse.org_id == org_id)
        
        if team_id:
            query = query.filter(NumericResponse.team_id == team_id)
        
        response_count = query.scalar() or 0
        
        # Check compliance
        compliant = response_count >= min_n
        
        return {
            "compliant": compliant,
            "min_n": min_n,
            "response_count": response_count,
            "org_id": org_id,
            "team_id": team_id,
            "safe_fallback_message": org_settings.safe_fallback_message if org_settings else "Not enough responses to show data safely"
        }
        
    except Exception as e:
        # Return non-compliant on error for safety
        return {
            "compliant": False,
            "min_n": 4,
            "response_count": 0,
            "org_id": org_id,
            "team_id": team_id,
            "safe_fallback_message": "Not enough responses to show data safely",
            "error": str(e)
        }

def check_min_n_compliance_by_driver(db: Session, org_id: str, team_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Check min-n compliance for each driver separately
    
    Args:
        db: Database session
        org_id: Organization ID
        team_id: Optional team ID to filter by
        
    Returns:
        Dictionary with compliance status for each driver
    """
    try:
        # Get organization settings for min-n requirement
        from app.models.settings import OrgSettings
        org_settings = db.query(OrgSettings).filter(OrgSettings.org_id == org_id).first()
        
        if not org_settings:
            min_n = 4
        else:
            min_n = org_settings.min_n
        
        # Build query to count responses by driver
        from app.models.responses import NumericResponse
        
        query = db.query(
            NumericResponse.driver_id,
            func.count(NumericResponse.id).label('response_count')
        ).filter(NumericResponse.org_id == org_id)
        
        if team_id:
            query = query.filter(NumericResponse.team_id == team_id)
        
        query = query.group_by(NumericResponse.driver_id)
        
        driver_counts = query.all()
        
        # Check compliance for each driver
        driver_compliance = {}
        overall_compliant = True
        
        for driver_id, count in driver_counts:
            compliant = count >= min_n
            driver_compliance[driver_id] = {
                "compliant": compliant,
                "response_count": count,
                "min_n": min_n
            }
            if not compliant:
                overall_compliant = False
        
        return {
            "overall_compliant": overall_compliant,
            "min_n": min_n,
            "driver_compliance": driver_compliance,
            "org_id": org_id,
            "team_id": team_id,
            "safe_fallback_message": org_settings.safe_fallback_message if org_settings else "Not enough responses to show data safely"
        }
        
    except Exception as e:
        return {
            "overall_compliant": False,
            "min_n": 4,
            "driver_compliance": {},
            "org_id": org_id,
            "team_id": team_id,
            "safe_fallback_message": "Not enough responses to show data safely",
            "error": str(e)
        }

def check_min_n_compliance_by_survey(db: Session, org_id: str, survey_id: str, team_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Check min-n compliance for a specific survey
    
    Args:
        db: Database session
        org_id: Organization ID
        survey_id: Survey ID
        team_id: Optional team ID to filter by
        
    Returns:
        Dictionary with compliance status for the survey
    """
    try:
        # Get organization settings for min-n requirement
        from app.models.settings import OrgSettings
        org_settings = db.query(OrgSettings).filter(OrgSettings.org_id == org_id).first()
        
        if not org_settings:
            min_n = 4
        else:
            min_n = org_settings.min_n
        
        # Build query to count responses for the survey
        from app.models.responses import NumericResponse
        
        query = db.query(func.count(NumericResponse.id)).filter(
            NumericResponse.org_id == org_id,
            NumericResponse.survey_id == survey_id
        )
        
        if team_id:
            query = query.filter(NumericResponse.team_id == team_id)
        
        response_count = query.scalar() or 0
        
        # Check compliance
        compliant = response_count >= min_n
        
        return {
            "compliant": compliant,
            "min_n": min_n,
            "response_count": response_count,
            "org_id": org_id,
            "survey_id": survey_id,
            "team_id": team_id,
            "safe_fallback_message": org_settings.safe_fallback_message if org_settings else "Not enough responses to show data safely"
        }
        
    except Exception as e:
        return {
            "compliant": False,
            "min_n": 4,
            "response_count": 0,
            "org_id": org_id,
            "survey_id": survey_id,
            "team_id": team_id,
            "safe_fallback_message": "Not enough responses to show data safely",
            "error": str(e)
        }

def get_safe_aggregate_data(db: Session, org_id: str, team_id: Optional[str] = None, 
                           min_n: int = 4, aggregate_type: str = "avg") -> Dict[str, Any]:
    """
    Get aggregate data only if min-n compliance is met
    
    Args:
        db: Database session
        org_id: Organization ID
        team_id: Optional team ID to filter by
        min_n: Minimum number of responses required
        aggregate_type: Type of aggregation (avg, sum, count, etc.)
        
    Returns:
        Dictionary with safe aggregate data or fallback message
    """
    try:
        # Check compliance first
        compliance = check_min_n_compliance(db, org_id, team_id)
        
        if not compliance["compliant"]:
            return {
                "data_available": False,
                "message": compliance["safe_fallback_message"],
                "compliance": compliance
            }
        
        # If compliant, get aggregate data
        from app.models.responses import NumericResponse
        from sqlalchemy import func
        
        query = db.query(
            NumericResponse.driver_id,
            func.avg(NumericResponse.score).label('avg_score'),
            func.count(NumericResponse.id).label('response_count')
        ).filter(NumericResponse.org_id == org_id)
        
        if team_id:
            query = query.filter(NumericResponse.team_id == team_id)
        
        query = query.group_by(NumericResponse.driver_id)
        
        results = query.all()
        
        aggregate_data = {}
        for driver_id, avg_score, count in results:
            aggregate_data[driver_id] = {
                "avg_score": float(avg_score) if avg_score else 0.0,
                "response_count": count
            }
        
        return {
            "data_available": True,
            "aggregate_data": aggregate_data,
            "compliance": compliance
        }
        
    except Exception as e:
        return {
            "data_available": False,
            "message": "Error retrieving aggregate data",
            "error": str(e),
            "compliance": {
                "compliant": False,
                "min_n": min_n,
                "response_count": 0
            }
        }
