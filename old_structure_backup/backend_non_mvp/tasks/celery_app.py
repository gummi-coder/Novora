"""
Celery configuration for background tasks
"""
from celery import Celery
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Create Celery instance
celery_app = Celery(
    "novora",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.email_tasks",
        "app.tasks.alert_tasks",
        "app.tasks.nlp_tasks",
        "app.tasks.aggregator_tasks",
        "app.tasks.performance_tasks",
        "app.services.auto_pilot_scheduler"
    ]
)

# Celery configuration
celery_app.conf.update(
    # Task routing
    task_routes={
        "app.tasks.email_tasks.*": {"queue": "email"},
        "app.tasks.alert_tasks.*": {"queue": "alerts"},
        "app.tasks.nlp_tasks.*": {"queue": "nlp"},
        "app.tasks.aggregator_tasks.*": {"queue": "aggregators"},
        "app.tasks.performance_tasks.*": {"queue": "performance"},
        "app.services.auto_pilot_scheduler.*": {"queue": "auto_pilot"},
        "*": {"queue": "default"}
    },
    
    # Task serialization
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    
    # Task execution
    task_always_eager=False,  # Set to True for testing
    task_eager_propagates=True,
    
    # Worker configuration
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    worker_disable_rate_limits=False,
    
    # Result backend configuration
    result_expires=3600,  # 1 hour
    result_backend_transport_options={
        "master_name": "mymaster",
        "visibility_timeout": 3600,
    },
    
    # Beat schedule for periodic tasks
    beat_schedule={
        "auto-pilot-check": {
            "task": "app.services.auto_pilot_scheduler.check_scheduled_surveys",
            "schedule": settings.AUTO_PILOT_CHECK_INTERVAL,
        },
        "auto-pilot-reminders": {
            "task": "app.services.auto_pilot_scheduler.process_reminders",
            "schedule": 300,  # Every 5 minutes
        },
        "refresh-nlp-processing": {
            "task": "app.tasks.nlp_tasks.refresh_all_nlp",
            "schedule": 600,  # Every 10 minutes
        },
        "refresh-alert-evaluation": {
            "task": "app.tasks.alert_tasks.refresh_all_alerts",
            "schedule": 900,  # Every 15 minutes
        },
        "run-aggregator-jobs": {
            "task": "app.tasks.aggregator_tasks.run_all_aggregator_jobs",
            "schedule": 900,  # Every 15 minutes
        },
        "build-reports-cache": {
            "task": "app.tasks.aggregator_tasks.job_f_reports_cache",
            "schedule": 86400,  # Daily
        },
        "cleanup-expired-tokens": {
            "task": "app.tasks.cleanup_tasks.cleanup_expired_tokens",
            "schedule": 86400,  # Daily
        },
        "preload-active-surveys": {
            "task": "app.tasks.performance_tasks.preload_active_surveys",
            "schedule": 600,  # Every 10 minutes
        },
        "monitor-cache-performance": {
            "task": "app.tasks.performance_tasks.monitor_cache_performance",
            "schedule": 300,  # Every 5 minutes
        },
        "optimize-database": {
            "task": "app.tasks.performance_tasks.optimize_database",
            "schedule": 3600,  # Every hour
        },
        "cleanup-expired-cache": {
            "task": "app.tasks.performance_tasks.cleanup_expired_cache",
            "schedule": 1800,  # Every 30 minutes
        },
    },
    
    # Redis broker configuration
    broker_transport_options={
        "visibility_timeout": 3600,
        "fanout_prefix": True,
        "fanout_patterns": True,
    },
    
    # Task retry configuration
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_remote_tracebacks=True,
    
    # Logging
    worker_log_format="[%(asctime)s: %(levelname)s/%(processName)s] %(message)s",
    worker_task_log_format="[%(asctime)s: %(levelname)s/%(processName)s][%(task_name)s(%(task_id)s)] %(message)s",
)

# Task error handling
@celery_app.task(bind=True)
def debug_task(self):
    logger.info(f"Request: {self.request!r}")

# Health check task
@celery_app.task
def health_check():
    """Health check task for monitoring"""
    return {"status": "healthy", "timestamp": "2024-12-19T10:00:00Z"}

if __name__ == "__main__":
    celery_app.start() 