"""
Celery Beat Schedule Configuration
Complete schedule for all background jobs A-F and system tasks
"""
from celery.schedules import crontab
from datetime import timedelta

# Complete Celery Beat Schedule Configuration
CELERY_BEAT_SCHEDULE = {
    # ============================================================================
    # AGGREGATOR JOBS (A-F) - 5-15 minute processing cycles
    # ============================================================================
    
    # Job A: Running Counters (Every 5 minutes)
    "job-a-running-counters": {
        "task": "app.tasks.aggregator_tasks.job_a_running_counters",
        "schedule": timedelta(minutes=5),
        "options": {"queue": "aggregators"}
    },
    
    # Job B: Driver Summaries (Every 10 minutes)
    "job-b-driver-summaries": {
        "task": "app.tasks.aggregator_tasks.job_b_driver_summaries",
        "schedule": timedelta(minutes=10),
        "options": {"queue": "aggregators"}
    },
    
    # Job C: Sentiment Analysis (Every 10 minutes)
    "job-c-sentiment-analysis": {
        "task": "app.tasks.aggregator_tasks.job_c_sentiment_analysis",
        "schedule": timedelta(minutes=10),
        "options": {"queue": "aggregators"}
    },
    
    # Job D: Trend Computation (Every 15 minutes)
    "job-d-trend-computation": {
        "task": "app.tasks.aggregator_tasks.job_d_trend_computation",
        "schedule": timedelta(minutes=15),
        "options": {"queue": "aggregators"}
    },
    
    # Job E: Alert Evaluation (Every 15 minutes)
    "job-e-alert-evaluation": {
        "task": "app.tasks.aggregator_tasks.job_e_alert_evaluation",
        "schedule": timedelta(minutes=15),
        "options": {"queue": "aggregators"}
    },
    
    # Job F: Reports Cache (Every 15 minutes)
    "job-f-reports-cache": {
        "task": "app.tasks.aggregator_tasks.job_f_reports_cache",
        "schedule": timedelta(minutes=15),
        "options": {"queue": "aggregators"}
    },
    
    # ============================================================================
    # PERFORMANCE & CACHE TASKS
    # ============================================================================
    
    # Cache preloading for active surveys (Every 10 minutes)
    "preload-active-surveys": {
        "task": "app.tasks.performance_tasks.preload_active_surveys",
        "schedule": timedelta(minutes=10),
        "options": {"queue": "performance"}
    },
    
    # Cache performance monitoring (Every 5 minutes)
    "monitor-cache-performance": {
        "task": "app.tasks.performance_tasks.monitor_cache_performance",
        "schedule": timedelta(minutes=5),
        "options": {"queue": "performance"}
    },
    
    # Database optimization (Every hour)
    "optimize-database": {
        "task": "app.tasks.performance_tasks.optimize_database",
        "schedule": timedelta(hours=1),
        "options": {"queue": "performance"}
    },
    
    # Cache cleanup (Every 30 minutes)
    "cleanup-expired-cache": {
        "task": "app.tasks.performance_tasks.cleanup_expired_cache",
        "schedule": timedelta(minutes=30),
        "options": {"queue": "performance"}
    },
    
    # ============================================================================
    # NLP PROCESSING TASKS
    # ============================================================================
    
    # NLP processing refresh (Every 10 minutes)
    "refresh-nlp-processing": {
        "task": "app.tasks.nlp_tasks.refresh_all_nlp",
        "schedule": timedelta(minutes=10),
        "options": {"queue": "nlp"}
    },
    
    # NLP backfill for unprocessed comments (Daily at 2 AM)
    "nlp-backfill": {
        "task": "app.tasks.nlp_tasks.backfill_nlp_processing",
        "schedule": crontab(hour=2, minute=0),
        "options": {"queue": "nlp"}
    },
    
    # ============================================================================
    # ALERT MANAGEMENT TASKS
    # ============================================================================
    
    # Alert evaluation refresh (Every 15 minutes)
    "refresh-alert-evaluation": {
        "task": "app.tasks.alert_tasks.refresh_all_alerts",
        "schedule": timedelta(minutes=15),
        "options": {"queue": "alerts"}
    },
    
    # Alert escalation check (Every hour)
    "check-alert-escalations": {
        "task": "app.tasks.alert_tasks.check_alert_escalations",
        "schedule": timedelta(hours=1),
        "options": {"queue": "alerts"}
    },
    
    # ============================================================================
    # AUTO-PILOT & SURVEY MANAGEMENT
    # ============================================================================
    
    # Auto-pilot survey scheduling check (Every 5 minutes)
    "auto-pilot-check": {
        "task": "app.services.auto_pilot_scheduler.check_scheduled_surveys",
        "schedule": timedelta(minutes=5),
        "options": {"queue": "auto_pilot"}
    },
    
    # Auto-pilot reminder processing (Every 5 minutes)
    "auto-pilot-reminders": {
        "task": "app.services.auto_pilot_scheduler.process_reminders",
        "schedule": timedelta(minutes=5),
        "options": {"queue": "auto_pilot"}
    },
    
    # Survey token cleanup (Daily at 3 AM)
    "cleanup-expired-tokens": {
        "task": "app.tasks.cleanup_tasks.cleanup_expired_tokens",
        "schedule": crontab(hour=3, minute=0),
        "options": {"queue": "cleanup"}
    },
    
    # ============================================================================
    # EMAIL & NOTIFICATION TASKS
    # ============================================================================
    
    # Email queue processing (Every 2 minutes)
    "process-email-queue": {
        "task": "app.tasks.email_tasks.process_email_queue",
        "schedule": timedelta(minutes=2),
        "options": {"queue": "email"}
    },
    
    # Survey reminder emails (Daily at 9 AM)
    "send-survey-reminders": {
        "task": "app.tasks.email_tasks.send_survey_reminders",
        "schedule": crontab(hour=9, minute=0),
        "options": {"queue": "email"}
    },
    
    # ============================================================================
    # SYSTEM MAINTENANCE TASKS
    # ============================================================================
    
    # Audit log cleanup (Weekly on Sunday at 4 AM)
    "cleanup-audit-logs": {
        "task": "app.tasks.cleanup_tasks.cleanup_old_audit_logs",
        "schedule": crontab(day_of_week=0, hour=4, minute=0),
        "options": {"queue": "cleanup"}
    },
    
    # Reports cache cleanup (Daily at 1 AM)
    "cleanup-old-reports-cache": {
        "task": "app.tasks.cleanup_tasks.cleanup_old_reports_cache",
        "schedule": crontab(hour=1, minute=0),
        "options": {"queue": "cleanup"}
    },
    
    # Database maintenance (Daily at 5 AM)
    "database-maintenance": {
        "task": "app.tasks.cleanup_tasks.run_database_maintenance",
        "schedule": crontab(hour=5, minute=0),
        "options": {"queue": "maintenance"}
    },
    
    # ============================================================================
    # MONITORING & HEALTH CHECKS
    # ============================================================================
    
    # System health check (Every 5 minutes)
    "system-health-check": {
        "task": "app.tasks.monitoring_tasks.system_health_check",
        "schedule": timedelta(minutes=5),
        "options": {"queue": "monitoring"}
    },
    
    # Performance metrics collection (Every 10 minutes)
    "collect-performance-metrics": {
        "task": "app.tasks.monitoring_tasks.collect_performance_metrics",
        "schedule": timedelta(minutes=10),
        "options": {"queue": "monitoring"}
    },
    
    # ============================================================================
    # DATA INTEGRITY & BACKUP TASKS
    # ============================================================================
    
    # Data integrity check (Daily at 6 AM)
    "data-integrity-check": {
        "task": "app.tasks.integrity_tasks.check_data_integrity",
        "schedule": crontab(hour=6, minute=0),
        "options": {"queue": "integrity"}
    },
    
    # Backup generation (Daily at 2 AM)
    "generate-backup": {
        "task": "app.tasks.backup_tasks.generate_daily_backup",
        "schedule": crontab(hour=2, minute=30),
        "options": {"queue": "backup"}
    },
}

# Task routing configuration
CELERY_TASK_ROUTES = {
    # Aggregator tasks
    "app.tasks.aggregator_tasks.*": {"queue": "aggregators"},
    
    # Performance tasks
    "app.tasks.performance_tasks.*": {"queue": "performance"},
    
    # NLP tasks
    "app.tasks.nlp_tasks.*": {"queue": "nlp"},
    
    # Alert tasks
    "app.tasks.alert_tasks.*": {"queue": "alerts"},
    
    # Auto-pilot tasks
    "app.services.auto_pilot_scheduler.*": {"queue": "auto_pilot"},
    
    # Email tasks
    "app.tasks.email_tasks.*": {"queue": "email"},
    
    # Cleanup tasks
    "app.tasks.cleanup_tasks.*": {"queue": "cleanup"},
    
    # Monitoring tasks
    "app.tasks.monitoring_tasks.*": {"queue": "monitoring"},
    
    # Integrity tasks
    "app.tasks.integrity_tasks.*": {"queue": "integrity"},
    
    # Backup tasks
    "app.tasks.backup_tasks.*": {"queue": "backup"},
    
    # Maintenance tasks
    "app.tasks.maintenance_tasks.*": {"queue": "maintenance"},
    
    # Default queue
    "*": {"queue": "default"}
}

# Queue configuration
CELERY_TASK_QUEUES = {
    "default": {},
    "aggregators": {"routing_key": "aggregators"},
    "performance": {"routing_key": "performance"},
    "nlp": {"routing_key": "nlp"},
    "alerts": {"routing_key": "alerts"},
    "auto_pilot": {"routing_key": "auto_pilot"},
    "email": {"routing_key": "email"},
    "cleanup": {"routing_key": "cleanup"},
    "monitoring": {"routing_key": "monitoring"},
    "integrity": {"routing_key": "integrity"},
    "backup": {"routing_key": "backup"},
    "maintenance": {"routing_key": "maintenance"},
}

# Worker configuration
CELERY_WORKER_CONFIG = {
    "worker_prefetch_multiplier": 1,
    "worker_max_tasks_per_child": 1000,
    "worker_disable_rate_limits": False,
    "task_acks_late": True,
    "task_reject_on_worker_lost": True,
    "task_always_eager": False,  # Set to True for testing
    "task_eager_propagates": True,
}

# Result backend configuration
CELERY_RESULT_CONFIG = {
    "result_expires": 3600,  # 1 hour
    "result_backend_transport_options": {
        "master_name": "mymaster",
        "visibility_timeout": 3600,
    },
}

# Redis broker configuration
CELERY_BROKER_CONFIG = {
    "broker_transport_options": {
        "visibility_timeout": 3600,
        "fanout_prefix": True,
        "fanout_patterns": True,
    },
}
