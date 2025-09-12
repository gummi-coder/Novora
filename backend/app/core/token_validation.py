"""
Enhanced Token Validation with Anti-abuse and Device Tracking
"""
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from datetime import datetime, timedelta
import hashlib
import logging
from fastapi import HTTPException, Request, Depends

from app.models.base import Survey, SurveyToken
from app.core.database import get_db

logger = logging.getLogger(__name__)

class TokenAbuseException(Exception):
    """Exception for token abuse detection"""
    pass

class DeviceThrottleException(Exception):
    """Exception for device throttling"""
    pass

def get_device_fingerprint(request: Request) -> str:
    """Generate device fingerprint for abuse detection"""
    try:
        # Get client IP
        client_ip = request.client.host
        
        # Get user agent
        user_agent = request.headers.get("user-agent", "")
        
        # Get additional headers for fingerprinting
        accept_language = request.headers.get("accept-language", "")
        accept_encoding = request.headers.get("accept-encoding", "")
        
        # Create fingerprint
        fingerprint_data = f"{client_ip}:{user_agent}:{accept_language}:{accept_encoding}"
        fingerprint = hashlib.sha256(fingerprint_data.encode()).hexdigest()
        
        return fingerprint
        
    except Exception as e:
        logger.error(f"Error generating device fingerprint: {str(e)}")
        return "unknown"

def check_device_throttling(
    device_fingerprint: str,
    survey_id: str,
    db: Session,
    max_attempts: int = 5,
    window_minutes: int = 60
) -> bool:
    """Check if device is being throttled due to suspicious activity"""
    try:
        # Check recent failed attempts from this device
        cutoff_time = datetime.utcnow() - timedelta(minutes=window_minutes)
        
        failed_attempts = db.query(SurveyToken).filter(
            and_(
                SurveyToken.device_fingerprint == device_fingerprint,
                SurveyToken.survey_id == survey_id,
                SurveyToken.last_attempt_at >= cutoff_time,
                SurveyToken.attempt_failed == True
            )
        ).count()
        
        if failed_attempts >= max_attempts:
            logger.warning(f"Device {device_fingerprint} throttled for survey {survey_id}: {failed_attempts} failed attempts")
            return False
        
        return True
        
    except Exception as e:
        logger.error(f"Error checking device throttling: {str(e)}")
        return True  # Allow if error

def check_frequency_throttling(
    device_fingerprint: str,
    survey_id: str,
    db: Session,
    max_requests: int = 10,
    window_minutes: int = 5
) -> bool:
    """Check if device is making too many requests too quickly"""
    try:
        # Check recent requests from this device
        cutoff_time = datetime.utcnow() - timedelta(minutes=window_minutes)
        
        recent_requests = db.query(SurveyToken).filter(
            and_(
                SurveyToken.device_fingerprint == device_fingerprint,
                SurveyToken.survey_id == survey_id,
                SurveyToken.last_attempt_at >= cutoff_time
            )
        ).count()
        
        if recent_requests >= max_requests:
            logger.warning(f"Device {device_fingerprint} frequency throttled for survey {survey_id}: {recent_requests} requests in {window_minutes} minutes")
            return False
        
        return True
        
    except Exception as e:
        logger.error(f"Error checking frequency throttling: {str(e)}")
        return True  # Allow if error

def validate_survey_token(
    token: str, 
    survey_id: str, 
    db: Session,
    request: Optional[Request] = None,
    device_fingerprint: Optional[str] = None
) -> str:
    """
    Enhanced token validation with anti-abuse measures
    
    Args:
        token: The survey token
        survey_id: Survey ID
        db: Database session
        request: FastAPI request object for device fingerprinting
        device_fingerprint: Pre-generated device fingerprint
        
    Returns:
        str: Team ID if token is valid
        
    Raises:
        TokenAbuseException: If token abuse is detected
        DeviceThrottleException: If device is throttled
        HTTPException: If token is invalid or expired
    """
    try:
        # Get device fingerprint
        if not device_fingerprint and request:
            device_fingerprint = get_device_fingerprint(request)
        elif not device_fingerprint:
            device_fingerprint = "unknown"
        
        # Get token record
        token_record = db.query(SurveyToken).filter(
            and_(
                SurveyToken.token == token,
                SurveyToken.survey_id == survey_id
            )
        ).first()
        
        if not token_record:
            # Log failed attempt
            _log_failed_attempt(token, survey_id, device_fingerprint, db, "invalid_token")
            raise HTTPException(status_code=400, detail="Invalid survey link")
        
        # Check if token is already used
        if token_record.used:
            # Log failed attempt
            _log_failed_attempt(token, survey_id, device_fingerprint, db, "token_already_used")
            raise HTTPException(status_code=409, detail="This survey link has already been used")
        
        # Check if survey is still active
        survey = db.query(Survey).filter(Survey.id == survey_id).first()
        if not survey or survey.status != "active":
            # Log failed attempt
            _log_failed_attempt(token, survey_id, device_fingerprint, db, "survey_inactive")
            raise HTTPException(status_code=410, detail="Survey is no longer active")
        
        # Check if token is expired
        if survey.closes_at and datetime.utcnow() > survey.closes_at:
            # Log failed attempt
            _log_failed_attempt(token, survey_id, device_fingerprint, db, "token_expired")
            raise HTTPException(status_code=410, detail="Survey window has closed")
        
        # Check device throttling
        if not check_device_throttling(device_fingerprint, survey_id, db):
            raise DeviceThrottleException("Device is temporarily blocked due to suspicious activity")
        
        # Check frequency throttling
        if not check_frequency_throttling(device_fingerprint, survey_id, db):
            raise DeviceThrottleException("Too many requests from this device")
        
        # Update last attempt timestamp
        token_record.last_attempt_at = datetime.utcnow()
        token_record.device_fingerprint = device_fingerprint
        db.commit()
        
        logger.info(f"Token validated successfully for survey {survey_id}, team {token_record.team_id}")
        return str(token_record.team_id)
        
    except (TokenAbuseException, DeviceThrottleException) as e:
        logger.warning(f"Token abuse detected: {str(e)}")
        raise HTTPException(status_code=429, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating token: {str(e)}")
        raise HTTPException(status_code=500, detail="Error validating survey link")

def mark_token_used(token: str, db: Session) -> None:
    """Mark token as used with enhanced tracking"""
    try:
        token_record = db.query(SurveyToken).filter(SurveyToken.token == token).first()
        
        if not token_record:
            logger.warning(f"Attempted to mark non-existent token as used: {token}")
            return
        
        if token_record.used:
            logger.warning(f"Attempted to mark already-used token as used: {token}")
            return
        
        # Mark as used
        token_record.used = True
        token_record.used_at = datetime.utcnow()
        token_record.attempt_failed = False  # Reset failure flag on success
        
        db.commit()
        
        logger.info(f"Token marked as used: {token}")
        
    except Exception as e:
        logger.error(f"Error marking token as used: {str(e)}")
        db.rollback()
        raise

def auto_expire_tokens(survey_id: str, db: Session) -> int:
    """Auto-expire all unused tokens when survey closes"""
    try:
        # Get all unused tokens for this survey
        unused_tokens = db.query(SurveyToken).filter(
            and_(
                SurveyToken.survey_id == survey_id,
                SurveyToken.used == False
            )
        ).all()
        
        expired_count = 0
        for token in unused_tokens:
            token.used = True
            token.used_at = datetime.utcnow()
            token.expired_at = datetime.utcnow()
            token.expired_reason = "survey_closed"
            expired_count += 1
        
        db.commit()
        
        logger.info(f"Auto-expired {expired_count} tokens for survey {survey_id}")
        return expired_count
        
    except Exception as e:
        logger.error(f"Error auto-expiring tokens: {str(e)}")
        db.rollback()
        return 0

def _log_failed_attempt(
    token: str,
    survey_id: str,
    device_fingerprint: str,
    db: Session,
    failure_reason: str
) -> None:
    """Log failed token attempt for abuse detection"""
    try:
        # Find token record to update
        token_record = db.query(SurveyToken).filter(
            and_(
                SurveyToken.token == token,
                SurveyToken.survey_id == survey_id
            )
        ).first()
        
        if token_record:
            # Update failure tracking
            token_record.attempt_failed = True
            token_record.last_attempt_at = datetime.utcnow()
            token_record.device_fingerprint = device_fingerprint
            token_record.failure_count = (token_record.failure_count or 0) + 1
            token_record.last_failure_reason = failure_reason
            
            db.commit()
        
        logger.warning(f"Failed token attempt: {failure_reason} for token {token[:8]}... from device {device_fingerprint[:8]}...")
        
    except Exception as e:
        logger.error(f"Error logging failed attempt: {str(e)}")

def get_validated_team_id(
    token: str, 
    survey_id: str, 
    db: Session = Depends(get_db),
    request: Optional[Request] = None
) -> str:
    """FastAPI dependency for token validation"""
    return validate_survey_token(token, survey_id, db, request)

def cleanup_expired_tokens(db: Session, days_old: int = 30) -> int:
    """Clean up old expired tokens to prevent database bloat"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days_old)
        
        # Delete old expired tokens
        deleted_count = db.query(SurveyToken).filter(
            and_(
                SurveyToken.expired_at.isnot(None),
                SurveyToken.expired_at < cutoff_date
            )
        ).delete()
        
        db.commit()
        
        logger.info(f"Cleaned up {deleted_count} expired tokens older than {days_old} days")
        return deleted_count
        
    except Exception as e:
        logger.error(f"Error cleaning up expired tokens: {str(e)}")
        db.rollback()
        return 0

def get_token_usage_stats(survey_id: str, db: Session) -> Dict[str, Any]:
    """Get token usage statistics for a survey"""
    try:
        total_tokens = db.query(SurveyToken).filter(
            SurveyToken.survey_id == survey_id
        ).count()
        
        used_tokens = db.query(SurveyToken).filter(
            and_(
                SurveyToken.survey_id == survey_id,
                SurveyToken.used == True
            )
        ).count()
        
        failed_attempts = db.query(SurveyToken).filter(
            and_(
                SurveyToken.survey_id == survey_id,
                SurveyToken.attempt_failed == True
            )
        ).count()
        
        return {
            "total_tokens": total_tokens,
            "used_tokens": used_tokens,
            "unused_tokens": total_tokens - used_tokens,
            "usage_rate": (used_tokens / total_tokens * 100) if total_tokens > 0 else 0,
            "failed_attempts": failed_attempts
        }
        
    except Exception as e:
        logger.error(f"Error getting token usage stats: {str(e)}")
        return {}
