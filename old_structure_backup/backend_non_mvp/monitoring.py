"""
Monitoring and Logging Configuration for Production
"""
import logging
import logging.handlers
import os
import sys
import time
import traceback
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional
from functools import wraps
import psutil
import requests
from app.core.config import settings

class MonitoringConfig:
    """Monitoring configuration for production"""
    
    def __init__(self):
        self.log_level = os.getenv("LOG_LEVEL", "INFO")
        self.log_file = os.getenv("LOG_FILE", "logs/novora.log")
        self.max_log_size = int(os.getenv("MAX_LOG_SIZE", "10")) * 1024 * 1024  # 10MB
        self.log_backups = int(os.getenv("LOG_BACKUPS", "5"))
        self.enable_metrics = os.getenv("ENABLE_METRICS", "true").lower() == "true"
        self.metrics_port = int(os.getenv("METRICS_PORT", "9090"))
        
        # Create logs directory
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        self._setup_logging()
    
    def _setup_logging(self):
        """Setup comprehensive logging configuration"""
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # Setup root logger
        root_logger = logging.getLogger()
        root_logger.setLevel(getattr(logging, self.log_level.upper()))
        
        # Clear existing handlers
        root_logger.handlers.clear()
        
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(formatter)
        root_logger.addHandler(console_handler)
        
        # File handler with rotation
        file_handler = logging.handlers.RotatingFileHandler(
            self.log_file,
            maxBytes=self.max_log_size,
            backupCount=self.log_backups
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)
        
        # Error file handler
        error_handler = logging.handlers.RotatingFileHandler(
            "logs/errors.log",
            maxBytes=self.max_log_size,
            backupCount=self.log_backups
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(formatter)
        root_logger.addHandler(error_handler)
        
        # Set specific logger levels
        logging.getLogger("uvicorn").setLevel(logging.WARNING)
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
        logging.getLogger("sqlalchemy").setLevel(logging.WARNING)
        
        logger = logging.getLogger(__name__)
        logger.info("Logging system initialized")

class MetricsCollector:
    """Collect system and application metrics"""
    
    def __init__(self):
        self.metrics: Dict[str, Any] = {}
        self.start_time = time.time()
    
    def collect_system_metrics(self) -> Dict[str, Any]:
        """Collect system metrics"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_available": memory.available,
                "memory_total": memory.total,
                "disk_percent": disk.percent,
                "disk_free": disk.free,
                "disk_total": disk.total,
                "uptime": time.time() - self.start_time
            }
        except Exception as e:
            logging.error(f"Failed to collect system metrics: {e}")
            return {}
    
    def collect_application_metrics(self) -> Dict[str, Any]:
        """Collect application-specific metrics"""
        try:
            # Database connection metrics
            from app.core.database import engine
            pool = engine.pool
            
            return {
                "database_connections": {
                    "checked_in": pool.checkedin(),
                    "checked_out": pool.checkedout(),
                    "overflow": pool.overflow(),
                    "invalid": pool.invalid()
                },
                "application_uptime": time.time() - self.start_time,
                "environment": settings.ENVIRONMENT,
                "version": settings.VERSION
            }
        except Exception as e:
            logging.error(f"Failed to collect application metrics: {e}")
            return {}
    
    def get_all_metrics(self) -> Dict[str, Any]:
        """Get all collected metrics"""
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "system": self.collect_system_metrics(),
            "application": self.collect_application_metrics(),
            "custom": self.metrics
        }
    
    def add_custom_metric(self, name: str, value: Any):
        """Add custom metric"""
        self.metrics[name] = value

class HealthChecker:
    """Health check system for production monitoring"""
    
    def __init__(self):
        self.checks = {}
        self._register_default_checks()
    
    def _register_default_checks(self):
        """Register default health checks"""
        self.register_check("database", self._check_database)
        self.register_check("redis", self._check_redis)
        self.register_check("disk_space", self._check_disk_space)
        self.register_check("memory", self._check_memory)
    
    def register_check(self, name: str, check_func):
        """Register a health check function"""
        self.checks[name] = check_func
    
    def _check_database(self) -> Dict[str, Any]:
        """Check database health"""
        try:
            from app.core.database import check_database_connection
            is_healthy = check_database_connection()
            return {
                "status": "healthy" if is_healthy else "unhealthy",
                "details": "Database connection successful" if is_healthy else "Database connection failed"
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "details": f"Database check failed: {str(e)}"
            }
    
    def _check_redis(self) -> Dict[str, Any]:
        """Check Redis health"""
        try:
            from app.core.database import check_redis_connection
            is_healthy = check_redis_connection()
            return {
                "status": "healthy" if is_healthy else "unhealthy",
                "details": "Redis connection successful" if is_healthy else "Redis connection failed"
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "details": f"Redis check failed: {str(e)}"
            }
    
    def _check_disk_space(self) -> Dict[str, Any]:
        """Check disk space"""
        try:
            disk = psutil.disk_usage('/')
            percent_used = disk.percent
            is_healthy = percent_used < 90
            
            return {
                "status": "healthy" if is_healthy else "warning",
                "details": f"Disk usage: {percent_used:.1f}%",
                "percent_used": percent_used
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "details": f"Disk space check failed: {str(e)}"
            }
    
    def _check_memory(self) -> Dict[str, Any]:
        """Check memory usage"""
        try:
            memory = psutil.virtual_memory()
            percent_used = memory.percent
            is_healthy = percent_used < 90
            
            return {
                "status": "healthy" if is_healthy else "warning",
                "details": f"Memory usage: {percent_used:.1f}%",
                "percent_used": percent_used
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "details": f"Memory check failed: {str(e)}"
            }
    
    def run_all_checks(self) -> Dict[str, Any]:
        """Run all health checks"""
        results = {}
        overall_status = "healthy"
        
        for name, check_func in self.checks.items():
            try:
                result = check_func()
                results[name] = result
                
                if result.get("status") == "unhealthy":
                    overall_status = "unhealthy"
                elif result.get("status") == "warning" and overall_status == "healthy":
                    overall_status = "warning"
                    
            except Exception as e:
                results[name] = {
                    "status": "unhealthy",
                    "details": f"Check failed: {str(e)}"
                }
                overall_status = "unhealthy"
        
        return {
            "status": overall_status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "checks": results
        }

class PerformanceMonitor:
    """Performance monitoring and profiling"""
    
    def __init__(self):
        self.request_times = []
        self.error_counts = {}
        self.max_request_history = 1000
    
    def monitor_request(self, func):
        """Decorator to monitor request performance"""
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                self._record_request_time(time.time() - start_time)
                return result
            except Exception as e:
                self._record_error(type(e).__name__)
                raise
        return wrapper
    
    def _record_request_time(self, duration: float):
        """Record request duration"""
        self.request_times.append(duration)
        if len(self.request_times) > self.max_request_history:
            self.request_times.pop(0)
    
    def _record_error(self, error_type: str):
        """Record error occurrence"""
        self.error_counts[error_type] = self.error_counts.get(error_type, 0) + 1
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics"""
        if not self.request_times:
            return {"message": "No request data available"}
        
        return {
            "request_count": len(self.request_times),
            "average_response_time": sum(self.request_times) / len(self.request_times),
            "min_response_time": min(self.request_times),
            "max_response_time": max(self.request_times),
            "p95_response_time": sorted(self.request_times)[int(len(self.request_times) * 0.95)],
            "p99_response_time": sorted(self.request_times)[int(len(self.request_times) * 0.99)],
            "error_counts": self.error_counts
        }

# Global monitoring instances
monitoring_config = MonitoringConfig()
metrics_collector = MetricsCollector()
health_checker = HealthChecker()
performance_monitor = PerformanceMonitor()

# Setup logging
logger = logging.getLogger(__name__)
logger.info("Monitoring system initialized")

def log_request(request, response_time: float, status_code: int):
    """Log HTTP request details"""
    logger.info(
        f"Request: {request.method} {request.url} - "
        f"Status: {status_code} - "
        f"Time: {response_time:.3f}s - "
        f"IP: {request.client.host if request.client else 'unknown'}"
    )

def log_error(error: Exception, context: str = ""):
    """Log error with context"""
    logger.error(
        f"Error in {context}: {str(error)}\n"
        f"Traceback: {traceback.format_exc()}"
    )

def log_security_event(event_type: str, details: str, user_id: Optional[str] = None):
    """Log security-related events"""
    logger.warning(
        f"Security Event: {event_type} - "
        f"Details: {details} - "
        f"User: {user_id or 'anonymous'}"
    )
