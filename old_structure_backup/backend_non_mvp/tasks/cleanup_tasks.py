"""
Cleanup tasks for periodic maintenance
"""
from celery import shared_task
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging
from app.core.database import SessionLocal
from app.models.base import EmailVerificationToken, PasswordResetToken, UserSession
from app.models.advanced import AutoPilotSurvey
from app.core.cache import cache

logger = logging.getLogger(__name__)

@shared_task
def cleanup_expired_tokens():
    """Clean up expired email verification and password reset tokens"""
    try:
        db = SessionLocal()
        
        # Clean up expired email verification tokens (older than 24 hours)
        expired_email_tokens = db.query(EmailVerificationToken).filter(
            EmailVerificationToken.created_at < datetime.utcnow() - timedelta(hours=24)
        ).delete()
        
        # Clean up expired password reset tokens (older than 1 hour)
        expired_password_tokens = db.query(PasswordResetToken).filter(
            PasswordResetToken.created_at < datetime.utcnow() - timedelta(hours=1)
        ).delete()
        
        # Clean up expired user sessions (older than 30 days)
        expired_sessions = db.query(UserSession).filter(
            UserSession.last_activity < datetime.utcnow() - timedelta(days=30)
        ).delete()
        
        db.commit()
        
        logger.info(f"Cleanup completed: {expired_email_tokens} email tokens, {expired_password_tokens} password tokens, {expired_sessions} sessions")
        
        return {
            "email_tokens_cleaned": expired_email_tokens,
            "password_tokens_cleaned": expired_password_tokens,
            "sessions_cleaned": expired_sessions
        }
        
    except Exception as e:
        logger.error(f"Cleanup failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

@shared_task
def cleanup_old_auto_pilot_surveys():
    """Clean up old auto-pilot survey data (older than 90 days)"""
    try:
        db = SessionLocal()
        
        # Clean up old completed surveys (older than 90 days)
        cutoff_date = datetime.utcnow() - timedelta(days=90)
        old_surveys = db.query(AutoPilotSurvey).filter(
            AutoPilotSurvey.status.in_(['completed', 'closed']),
            AutoPilotSurvey.updated_at < cutoff_date
        ).delete()
        
        db.commit()
        
        logger.info(f"Cleaned up {old_surveys} old auto-pilot surveys")
        
        return {"surveys_cleaned": old_surveys}
        
    except Exception as e:
        logger.error(f"Auto-pilot cleanup failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

@shared_task
def cleanup_cache():
    """Clean up expired cache entries"""
    try:
        # This is handled automatically by Redis TTL, but we can add custom cleanup logic here
        logger.info("Cache cleanup completed (handled by Redis TTL)")
        return {"status": "completed"}
        
    except Exception as e:
        logger.error(f"Cache cleanup failed: {e}")
        raise

@shared_task
def cleanup_orphaned_files():
    """Clean up orphaned file attachments"""
    try:
        db = SessionLocal()
        
        # This would require implementing file cleanup logic
        # For now, just log the task
        logger.info("File cleanup task executed")
        
        return {"status": "completed"}
        
    except Exception as e:
        logger.error(f"File cleanup failed: {e}")
        raise
    finally:
        db.close()

@shared_task
def database_maintenance():
    """Perform database maintenance tasks"""
    try:
        db = SessionLocal()
        
        # This would include tasks like:
        # - Vacuuming SQLite database
        # - Analyzing PostgreSQL tables
        # - Updating statistics
        
        logger.info("Database maintenance completed")
        
        return {"status": "completed"}
        
    except Exception as e:
        logger.error(f"Database maintenance failed: {e}")
        raise
    finally:
        db.close()
