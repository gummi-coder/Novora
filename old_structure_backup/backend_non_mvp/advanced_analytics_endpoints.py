"""
Advanced Analytics API Endpoints
Provides machine learning, predictive analytics, and AI insights
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.deps import get_current_user, get_current_admin_user
from app.models.base import User
from app.services.advanced_analytics import AdvancedAnalyticsService
from app.core.edge_case_handler import handle_db_errors, handle_validation

router = APIRouter()

@router.get("/predictions/engagement")
async def get_engagement_predictions(
    org_id: str = Query(...),
    team_id: Optional[str] = Query(None),
    driver_id: Optional[str] = Query(None),
    forecast_months: int = Query(3, ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get engagement trend predictions using machine learning"""
    try:
        # Validate access
        if current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        analytics_service = AdvancedAnalyticsService(db)
        predictions = await analytics_service.predict_engagement_trends(
            org_id=org_id,
            team_id=team_id,
            driver_id=driver_id,
            forecast_months=forecast_months
        )
        
        return predictions
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get predictions: {str(e)}")

@router.get("/insights/ai")
async def get_ai_insights(
    org_id: str = Query(...),
    survey_id: Optional[str] = Query(None),
    analysis_depth: str = Query("comprehensive", pattern="^(basic|comprehensive|advanced)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI-generated insights from survey data"""
    try:
        # Validate access
        if current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        analytics_service = AdvancedAnalyticsService(db)
        insights = await analytics_service.generate_ai_insights(
            org_id=org_id,
            survey_id=survey_id,
            analysis_depth=analysis_depth
        )
        
        return insights
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get AI insights: {str(e)}")

@router.get("/anomalies/detection")
async def detect_anomalies(
    org_id: str = Query(...),
    team_id: Optional[str] = Query(None),
    sensitivity: float = Query(0.1, ge=0.01, le=1.0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Detect anomalies in engagement patterns"""
    try:
        # Validate access
        if current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        analytics_service = AdvancedAnalyticsService(db)
        anomalies = await analytics_service.detect_engagement_anomalies(
            org_id=org_id,
            team_id=team_id,
            sensitivity=sensitivity
        )
        
        return anomalies
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to detect anomalies: {str(e)}")

@router.get("/benchmarks/analysis")
async def get_benchmark_analysis(
    org_id: str = Query(...),
    industry: Optional[str] = Query(None),
    company_size: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get benchmark analysis against industry standards"""
    try:
        # Validate access
        if current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        analytics_service = AdvancedAnalyticsService(db)
        benchmarks = await analytics_service.generate_benchmark_analysis(
            org_id=org_id,
            industry=industry,
            company_size=company_size
        )
        
        return benchmarks
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get benchmark analysis: {str(e)}")

@router.post("/optimization/performance")
async def optimize_performance(
    optimization_type: str = Query(..., pattern="^(database|cache|memory|queries|load_balancing)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Trigger performance optimization"""
    try:
        from app.services.performance_optimizer import performance_optimizer
        
        if optimization_type == "database":
            result = await performance_optimizer.optimize_database_performance(db)
        elif optimization_type == "cache":
            result = await performance_optimizer.optimize_cache_performance()
        elif optimization_type == "memory":
            result = await performance_optimizer.optimize_memory_usage()
        elif optimization_type == "queries":
            result = await performance_optimizer.optimize_query_performance(db)
        elif optimization_type == "load_balancing":
            result = await performance_optimizer.setup_load_balancing()
        else:
            raise HTTPException(status_code=400, detail="Invalid optimization type")
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Performance optimization failed: {str(e)}")

@router.get("/analytics/summary")
async def get_analytics_summary(
    org_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive analytics summary"""
    try:
        # Validate access
        if current_user.org_id != org_id:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        analytics_service = AdvancedAnalyticsService(db)
        
        # Get all analytics data
        predictions = await analytics_service.predict_engagement_trends(org_id, forecast_months=3)
        insights = await analytics_service.generate_ai_insights(org_id)
        anomalies = await analytics_service.detect_engagement_anomalies(org_id)
        benchmarks = await analytics_service.generate_benchmark_analysis(org_id)
        
        return {
            "predictions": predictions,
            "insights": insights,
            "anomalies": anomalies,
            "benchmarks": benchmarks,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics summary: {str(e)}")
