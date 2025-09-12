"""
Health Check Endpoints for System Monitoring
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime
import time

from app.core.database import get_db
from app.services.cache_service import cache_service

router = APIRouter()

@router.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "novora-survey-platform"
    }

@router.get("/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """Readiness check - verifies all dependencies are available"""
    try:
        # Check database connection
        db.execute("SELECT 1")
        
        # Check Redis connection
        cache_stats = cache_service.get_cache_stats()
        redis_healthy = "error" not in cache_stats
        
        # Check if all systems are ready
        all_ready = redis_healthy
        
        status = "ready" if all_ready else "not_ready"
        
        return {
            "status": status,
            "timestamp": datetime.utcnow().isoformat(),
            "checks": {
                "database": "healthy",
                "redis": "healthy" if redis_healthy else "unhealthy",
                "cache": cache_stats if redis_healthy else {"error": "Redis not available"}
            }
        }
        
    except Exception as e:
        return {
            "status": "not_ready",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e),
            "checks": {
                "database": "unhealthy",
                "redis": "unknown",
                "cache": {"error": "Database check failed"}
            }
        }

@router.get("/metrics")
async def system_metrics(db: Session = Depends(get_db)):
    """System metrics for monitoring"""
    try:
        # Database metrics
        start_time = time.time()
        db.execute("SELECT 1")
        db_query_time = (time.time() - start_time) * 1000
        
        # Cache metrics
        cache_stats = cache_service.get_cache_stats()
        
        # Basic system metrics
        metrics = {
            "timestamp": datetime.utcnow().isoformat(),
            "database": {
                "query_time_ms": round(db_query_time, 2),
                "status": "healthy"
            },
            "cache": cache_stats,
            "system": {
                "uptime": "running",  # Would need to track actual uptime
                "version": "1.0.0"
            }
        }
        
        return metrics
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving metrics: {str(e)}")

@router.get("/cache/stats")
async def cache_statistics():
    """Cache performance statistics"""
    try:
        stats = cache_service.get_cache_stats()
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "cache_stats": stats
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving cache stats: {str(e)}")

@router.get("/performance/check")
async def performance_check(db: Session = Depends(get_db)):
    """Quick performance check of critical endpoints"""
    try:
        results = {}
        
        # Test database query performance
        start_time = time.time()
        db.execute("SELECT COUNT(*) FROM surveys")
        db_time = (time.time() - start_time) * 1000
        results["database_query"] = {
            "time_ms": round(db_time, 2),
            "status": "pass" if db_time < 100 else "slow"
        }
        
        # Test cache performance
        start_time = time.time()
        cache_service.get_cache_stats()
        cache_time = (time.time() - start_time) * 1000
        results["cache_query"] = {
            "time_ms": round(cache_time, 2),
            "status": "pass" if cache_time < 50 else "slow"
        }
        
        # Overall performance status
        all_passed = all(r["status"] == "pass" for r in results.values())
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "overall_status": "pass" if all_passed else "degraded",
            "checks": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during performance check: {str(e)}")
