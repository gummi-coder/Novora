"""
Production Management API Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Dict, List, Any
import logging

from app.core.ssl import ssl_config
from app.core.monitoring import metrics_collector, health_checker, performance_monitor
from app.core.backup import backup_manager
from app.api.deps import get_current_user
from app.models.base import User

router = APIRouter()
logger = logging.getLogger(__name__)

# SSL/TLS Management
@router.get("/ssl/status")
async def get_ssl_status(current_user: User = Depends(get_current_user)):
    """Get SSL/TLS configuration status"""
    try:
        ssl_context = ssl_config.get_ssl_context()
        cert_exists = ssl_config._cert_files_exist()
        
        return {
            "ssl_enabled": ssl_config.enable_ssl,
            "certificate_exists": cert_exists,
            "ssl_context_available": ssl_context is not None,
            "cert_file": ssl_config.cert_file,
            "key_file": ssl_config.key_file,
            "ca_file": ssl_config.ca_file
        }
    except Exception as e:
        logger.error(f"SSL status check failed: {e}")
        raise HTTPException(status_code=500, detail=f"SSL status check failed: {str(e)}")

@router.post("/ssl/create-certificate")
async def create_ssl_certificate(
    domain: str = "localhost",
    current_user: User = Depends(get_current_user)
):
    """Create self-signed SSL certificate"""
    try:
        success, message = ssl_config.create_self_signed_cert(domain)
        
        if success:
            return {"message": message, "domain": domain}
        else:
            raise HTTPException(status_code=400, detail=message)
            
    except Exception as e:
        logger.error(f"SSL certificate creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"SSL certificate creation failed: {str(e)}")

@router.get("/ssl/verify-certificate")
async def verify_ssl_certificate(current_user: User = Depends(get_current_user)):
    """Verify SSL certificate validity"""
    try:
        success, message = ssl_config.verify_certificate()
        
        return {
            "valid": success,
            "message": message
        }
    except Exception as e:
        logger.error(f"SSL certificate verification failed: {e}")
        raise HTTPException(status_code=500, detail=f"SSL certificate verification failed: {str(e)}")

# Monitoring and Metrics
@router.get("/metrics/system")
async def get_system_metrics(current_user: User = Depends(get_current_user)):
    """Get system metrics"""
    try:
        metrics = metrics_collector.get_all_metrics()
        return metrics
    except Exception as e:
        logger.error(f"System metrics collection failed: {e}")
        raise HTTPException(status_code=500, detail=f"System metrics collection failed: {str(e)}")

@router.get("/metrics/performance")
async def get_performance_metrics(current_user: User = Depends(get_current_user)):
    """Get performance metrics"""
    try:
        stats = performance_monitor.get_performance_stats()
        return stats
    except Exception as e:
        logger.error(f"Performance metrics collection failed: {e}")
        raise HTTPException(status_code=500, detail=f"Performance metrics collection failed: {str(e)}")

@router.get("/health/detailed")
async def get_detailed_health(current_user: User = Depends(get_current_user)):
    """Get detailed health check results"""
    try:
        health_results = health_checker.run_all_checks()
        return health_results
    except Exception as e:
        logger.error(f"Detailed health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Detailed health check failed: {str(e)}")

@router.post("/health/check")
async def run_health_check(current_user: User = Depends(get_current_user)):
    """Run health check and return results"""
    try:
        health_results = health_checker.run_all_checks()
        
        # Log health check results
        if health_results["status"] != "healthy":
            logger.warning(f"Health check failed: {health_results}")
        
        return health_results
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

# Backup and Recovery
@router.post("/backup/database")
async def create_database_backup(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Create database backup"""
    try:
        success, message = backup_manager.create_database_backup()
        
        if success:
            logger.info(f"Database backup created by user {current_user.email}: {message}")
            return {"message": message, "status": "success"}
        else:
            logger.error(f"Database backup failed: {message}")
            raise HTTPException(status_code=500, detail=message)
            
    except Exception as e:
        logger.error(f"Database backup failed: {e}")
        raise HTTPException(status_code=500, detail=f"Database backup failed: {str(e)}")

@router.post("/backup/files")
async def create_file_backup(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Create file system backup"""
    try:
        success, message = backup_manager.create_file_backup()
        
        if success:
            logger.info(f"File backup created by user {current_user.email}: {message}")
            return {"message": message, "status": "success"}
        else:
            logger.error(f"File backup failed: {message}")
            raise HTTPException(status_code=500, detail=message)
            
    except Exception as e:
        logger.error(f"File backup failed: {e}")
        raise HTTPException(status_code=500, detail=f"File backup failed: {str(e)}")

@router.post("/backup/full")
async def create_full_backup(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Create full system backup"""
    try:
        success, message = backup_manager.create_full_backup()
        
        if success:
            logger.info(f"Full backup created by user {current_user.email}: {message}")
            return {"message": message, "status": "success"}
        else:
            logger.error(f"Full backup failed: {message}")
            raise HTTPException(status_code=500, detail=message)
            
    except Exception as e:
        logger.error(f"Full backup failed: {e}")
        raise HTTPException(status_code=500, detail=f"Full backup failed: {str(e)}")

@router.get("/backup/list")
async def list_backups(current_user: User = Depends(get_current_user)):
    """List all available backups"""
    try:
        backups = backup_manager.list_backups()
        return {"backups": backups, "count": len(backups)}
    except Exception as e:
        logger.error(f"Backup listing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Backup listing failed: {str(e)}")

@router.post("/backup/restore/{backup_file}")
async def restore_backup(
    backup_file: str,
    current_user: User = Depends(get_current_user)
):
    """Restore database from backup"""
    try:
        # Verify backup exists
        backups = backup_manager.list_backups()
        backup_exists = any(backup["name"] == backup_file for backup in backups)
        
        if not backup_exists:
            raise HTTPException(status_code=404, detail=f"Backup file not found: {backup_file}")
        
        # Verify backup integrity
        integrity_ok, integrity_message = backup_manager.verify_backup_integrity(backup_file)
        if not integrity_ok:
            raise HTTPException(status_code=400, detail=f"Backup integrity check failed: {integrity_message}")
        
        # Perform restore
        success, message = backup_manager.restore_database_backup(backup_file)
        
        if success:
            logger.info(f"Database restored by user {current_user.email} from {backup_file}: {message}")
            return {"message": message, "status": "success"}
        else:
            logger.error(f"Database restore failed: {message}")
            raise HTTPException(status_code=500, detail=message)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Database restore failed: {e}")
        raise HTTPException(status_code=500, detail=f"Database restore failed: {str(e)}")

@router.post("/backup/cleanup")
async def cleanup_old_backups(current_user: User = Depends(get_current_user)):
    """Clean up old backups based on retention policy"""
    try:
        deleted_count, message = backup_manager.cleanup_old_backups()
        
        logger.info(f"Backup cleanup performed by user {current_user.email}: {message}")
        return {"message": message, "deleted_count": deleted_count}
        
    except Exception as e:
        logger.error(f"Backup cleanup failed: {e}")
        raise HTTPException(status_code=500, detail=f"Backup cleanup failed: {str(e)}")

@router.get("/backup/verify/{backup_file}")
async def verify_backup_integrity(
    backup_file: str,
    current_user: User = Depends(get_current_user)
):
    """Verify backup file integrity"""
    try:
        success, message = backup_manager.verify_backup_integrity(backup_file)
        
        return {
            "backup_file": backup_file,
            "integrity_ok": success,
            "message": message
        }
        
    except Exception as e:
        logger.error(f"Backup integrity verification failed: {e}")
        raise HTTPException(status_code=500, detail=f"Backup integrity verification failed: {str(e)}")

# System Information
@router.get("/system/info")
async def get_system_info(current_user: User = Depends(get_current_user)):
    """Get system information"""
    try:
        import platform
        import psutil
        
        system_info = {
            "platform": platform.system(),
            "platform_version": platform.version(),
            "architecture": platform.machine(),
            "processor": platform.processor(),
            "python_version": platform.python_version(),
            "cpu_count": psutil.cpu_count(),
            "memory_total": psutil.virtual_memory().total,
            "disk_total": psutil.disk_usage('/').total,
            "environment": settings.ENVIRONMENT,
            "version": settings.VERSION
        }
        
        return system_info
        
    except Exception as e:
        logger.error(f"System info collection failed: {e}")
        raise HTTPException(status_code=500, detail=f"System info collection failed: {str(e)}")

@router.get("/system/status")
async def get_system_status(current_user: User = Depends(get_current_user)):
    """Get comprehensive system status"""
    try:
        # Get health check results
        health_results = health_checker.run_all_checks()
        
        # Get system metrics
        system_metrics = metrics_collector.collect_system_metrics()
        
        # Get performance stats
        performance_stats = performance_monitor.get_performance_stats()
        
        # Get backup info
        backups = backup_manager.list_backups()
        
        status = {
            "timestamp": datetime.utcnow().isoformat(),
            "health": health_results,
            "system": system_metrics,
            "performance": performance_stats,
            "backups": {
                "count": len(backups),
                "latest": backups[0] if backups else None
            },
            "ssl": {
                "enabled": ssl_config.enable_ssl,
                "certificate_exists": ssl_config._cert_files_exist()
            }
        }
        
        return status
        
    except Exception as e:
        logger.error(f"System status collection failed: {e}")
        raise HTTPException(status_code=500, detail=f"System status collection failed: {str(e)}")

# Log Management
@router.get("/logs/recent")
async def get_recent_logs(
    lines: int = 100,
    level: str = "INFO",
    current_user: User = Depends(get_current_user)
):
    """Get recent log entries"""
    try:
        log_file = "logs/novora.log"
        
        if not os.path.exists(log_file):
            return {"logs": [], "message": "Log file not found"}
        
        with open(log_file, 'r') as f:
            log_lines = f.readlines()
        
        # Filter by level if specified
        if level.upper() != "ALL":
            log_lines = [line for line in log_lines if f" - {level.upper()} - " in line]
        
        # Get last N lines
        recent_logs = log_lines[-lines:] if len(log_lines) > lines else log_lines
        
        return {
            "logs": recent_logs,
            "total_lines": len(log_lines),
            "filtered_lines": len(recent_logs),
            "level": level
        }
        
    except Exception as e:
        logger.error(f"Log retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=f"Log retrieval failed: {str(e)}")

@router.get("/logs/errors")
async def get_error_logs(
    lines: int = 50,
    current_user: User = Depends(get_current_user)
):
    """Get recent error log entries"""
    try:
        error_log_file = "logs/errors.log"
        
        if not os.path.exists(error_log_file):
            return {"errors": [], "message": "Error log file not found"}
        
        with open(error_log_file, 'r') as f:
            error_lines = f.readlines()
        
        # Get last N lines
        recent_errors = error_lines[-lines:] if len(error_lines) > lines else error_lines
        
        return {
            "errors": recent_errors,
            "total_errors": len(error_lines),
            "recent_errors": len(recent_errors)
        }
        
    except Exception as e:
        logger.error(f"Error log retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=f"Error log retrieval failed: {str(e)}")
