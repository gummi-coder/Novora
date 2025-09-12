"""
Cache Management Endpoints for Performance Monitoring
"""
from fastapi import APIRouter, HTTPException, Depends, Query, Request
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.base import User
from app.services.cache_service import cache_service
from app.services.audit_service import AuditService

router = APIRouter()

@router.get("/stats")
async def get_cache_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Get cache performance statistics (Admin only)"""
    try:
        # Admin access validation
        if current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Get cache statistics
        stats = cache_service.get_cache_stats()
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=current_user.company_id,
            action_type="cache_stats_accessed",
            resource_type="cache",
            resource_id="cache_stats",
            description="Admin accessed cache statistics",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "cache_stats": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving cache stats: {str(e)}")

@router.post("/invalidate/survey/{survey_id}")
async def invalidate_survey_cache(
    survey_id: str,
    org_id: str = Query(..., description="Organization ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Invalidate cache for a specific survey (Admin only)"""
    try:
        # Admin access validation
        if current_user.role != 'admin' or current_user.company_id != org_id:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Invalidate survey cache
        success = cache_service.invalidate_survey_cache(org_id, survey_id)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to invalidate survey cache")
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=org_id,
            action_type="cache_invalidated",
            resource_type="cache",
            resource_id=f"survey:{survey_id}",
            description=f"Admin invalidated cache for survey {survey_id}",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "message": f"Cache invalidated for survey {survey_id}",
            "survey_id": survey_id,
            "org_id": org_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error invalidating survey cache: {str(e)}")

@router.post("/invalidate/team/{team_id}")
async def invalidate_team_cache(
    team_id: str,
    org_id: str = Query(..., description="Organization ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Invalidate cache for a specific team (Admin only)"""
    try:
        # Admin access validation
        if current_user.role != 'admin' or current_user.company_id != org_id:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Invalidate team cache
        success = cache_service.invalidate_team_cache(org_id, team_id)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to invalidate team cache")
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=org_id,
            action_type="cache_invalidated",
            resource_type="cache",
            resource_id=f"team:{team_id}",
            description=f"Admin invalidated cache for team {team_id}",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "message": f"Cache invalidated for team {team_id}",
            "team_id": team_id,
            "org_id": org_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error invalidating team cache: {str(e)}")

@router.post("/invalidate/org")
async def invalidate_org_cache(
    org_id: str = Query(..., description="Organization ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Invalidate all cache for an organization (Admin only)"""
    try:
        # Admin access validation
        if current_user.role != 'admin' or current_user.company_id != org_id:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Invalidate org cache
        success = cache_service.invalidate_org_cache(org_id)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to invalidate org cache")
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=org_id,
            action_type="cache_invalidated",
            resource_type="cache",
            resource_id=f"org:{org_id}",
            description=f"Admin invalidated all cache for organization {org_id}",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "message": f"Cache invalidated for organization {org_id}",
            "org_id": org_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error invalidating org cache: {str(e)}")

@router.post("/refresh/kpis")
async def refresh_kpis_cache(
    org_id: str = Query(..., description="Organization ID"),
    survey_id: str = Query(..., description="Survey ID"),
    team_id: str = Query(None, description="Team ID (optional)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Manually refresh KPIs cache (Admin only)"""
    try:
        # Admin access validation
        if current_user.role != 'admin' or current_user.company_id != org_id:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Import and run the task
        from app.tasks.performance_tasks import refresh_kpis_cache
        task = refresh_kpis_cache.delay(org_id, survey_id, team_id)
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=org_id,
            action_type="cache_refreshed",
            resource_type="cache",
            resource_id=f"kpis:{survey_id}:{team_id or 'all'}",
            description=f"Admin refreshed KPIs cache for survey {survey_id}, team {team_id or 'all'}",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "message": "KPIs cache refresh scheduled",
            "task_id": task.id,
            "org_id": org_id,
            "survey_id": survey_id,
            "team_id": team_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing KPIs cache: {str(e)}")

@router.post("/refresh/heatmap")
async def refresh_heatmap_cache(
    org_id: str = Query(..., description="Organization ID"),
    survey_id: str = Query(..., description="Survey ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Manually refresh heatmap cache (Admin only)"""
    try:
        # Admin access validation
        if current_user.role != 'admin' or current_user.company_id != org_id:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Import and run the task
        from app.tasks.performance_tasks import refresh_heatmap_cache
        task = refresh_heatmap_cache.delay(org_id, survey_id)
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=org_id,
            action_type="cache_refreshed",
            resource_type="cache",
            resource_id=f"heatmap:{survey_id}",
            description=f"Admin refreshed heatmap cache for survey {survey_id}",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "message": "Heatmap cache refresh scheduled",
            "task_id": task.id,
            "org_id": org_id,
            "survey_id": survey_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing heatmap cache: {str(e)}")

@router.post("/clear/all")
async def clear_all_cache(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Clear all cache entries (Admin only - use with caution)"""
    try:
        # Admin access validation
        if current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Clear all cache
        success = cache_service.clear_all_cache()
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to clear all cache")
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=current_user.company_id,
            action_type="cache_cleared",
            resource_type="cache",
            resource_id="all",
            description="Admin cleared all cache entries",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "message": "All cache entries cleared",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing all cache: {str(e)}")

@router.post("/preload/active")
async def preload_active_surveys_cache(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Preload cache for all active surveys (Admin only)"""
    try:
        # Admin access validation
        if current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Import and run the task
        from app.tasks.performance_tasks import preload_active_surveys
        task = preload_active_surveys.delay()
        
        # Log audit
        audit_service = AuditService(db)
        audit_service.log_action(
            user_id=current_user.id,
            org_id=current_user.company_id,
            action_type="cache_preloaded",
            resource_type="cache",
            resource_id="active_surveys",
            description="Admin preloaded cache for all active surveys",
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        return {
            "message": "Active surveys cache preload scheduled",
            "task_id": task.id,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error preloading active surveys cache: {str(e)}")
