from dataclasses import dataclass
from typing import Optional, Dict, Any, List, Union
from functools import wraps
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
import re
import logging

from app.core.database import get_db
from app.models.settings import OrgSettings

logger = logging.getLogger(__name__)

@dataclass
class PrivacyRules:
    min_n: int = 4
    min_segment_n: int = 4
    pii_masking_enabled: bool = True
    safe_fallback_message: str = "Not enough responses to display data safely"

RULES = PrivacyRules()

class PrivacyViolationError(Exception):
    """Exception raised when privacy rules are violated"""
    pass

def get_org_privacy_settings(org_id: str, db: Session) -> PrivacyRules:
    """Get privacy settings for an organization"""
    try:
        org_settings = db.query(OrgSettings).filter(OrgSettings.org_id == org_id).first()
        if org_settings:
            return PrivacyRules(
                min_n=org_settings.min_n or 4,
                min_segment_n=org_settings.min_segment_n or 4,
                pii_masking_enabled=org_settings.pii_masking_enabled if hasattr(org_settings, 'pii_masking_enabled') else True
            )
        return RULES
    except Exception as e:
        logger.error(f"Error getting org privacy settings: {str(e)}")
        return RULES

def enforce_min_n(response_count: int, min_n: int = None, org_id: str = None, db: Session = None) -> bool:
    """
    Check if response count meets minimum for anonymity
    
    Args:
        response_count: Number of responses
        min_n: Minimum required (uses org setting if None)
        org_id: Organization ID for custom settings
        db: Database session for org settings
        
    Returns:
        bool: True if min-n requirement is met
    """
    if min_n is None and org_id and db:
        privacy_rules = get_org_privacy_settings(org_id, db)
        min_n = privacy_rules.min_n
    elif min_n is None:
        min_n = RULES.min_n
    
    return response_count >= min_n

def safe_aggregate_response(data: List, min_n: int = None, org_id: str = None, db: Session = None) -> Optional[Dict[str, Any]]:
    """
    Return safe aggregate response or None if min-n not met
    
    Args:
        data: List of data points
        min_n: Minimum required responses
        org_id: Organization ID
        db: Database session
        
    Returns:
        Optional[Dict]: Safe aggregate or None
    """
    if not enforce_min_n(len(data), min_n, org_id, db):
        return None
    
    return {
        "data": data,
        "count": len(data),
        "safe": True
    }

def safe_aggregate_with_fallback(data: List, min_n: int = None, org_id: str = None, db: Session = None) -> Dict[str, Any]:
    """
    Return safe aggregate with fallback message if min-n not met
    
    Args:
        data: List of data points
        min_n: Minimum required responses
        org_id: Organization ID
        db: Database session
        
    Returns:
        Dict: Safe aggregate or fallback message
    """
    if enforce_min_n(len(data), min_n, org_id, db):
        return {
            "data": data,
            "count": len(data),
            "safe": True,
            "message": None
        }
    else:
        return {
            "data": [],
            "count": len(data),
            "safe": False,
            "message": RULES.safe_fallback_message
        }

def require_min_n(min_n_field: str = "min_n"):
    """
    Decorator to enforce min-n requirement on endpoints
    
    Args:
        min_n_field: Field name containing min_n value
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract min_n from kwargs or request
            min_n = kwargs.get(min_n_field, RULES.min_n)
            
            # Get org_id if available
            org_id = kwargs.get('org_id')
            db = kwargs.get('db')
            
            # Check if function returns data that needs min-n validation
            result = await func(*args, **kwargs)
            
            # Apply min-n validation to result
            if isinstance(result, dict) and 'data' in result:
                if not enforce_min_n(len(result['data']), min_n, org_id, db):
                    return {
                        "data": [],
                        "count": len(result.get('data', [])),
                        "safe": False,
                        "message": RULES.safe_fallback_message
                    }
            
            return result
        return wrapper
    return decorator

def validate_team_access(user_id: str, team_id: str, db: Session) -> bool:
    """
    Validate that user has access to team data
    
    Args:
        user_id: User ID
        team_id: Team ID
        db: Database session
        
    Returns:
        bool: True if user has access
    """
    try:
        from app.models.base import User, Team, UserTeam
        
        # Check if user is admin (has access to all teams)
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.role == 'admin':
            return True
        
        # Check if user is manager of this team
        if user and user.role == 'manager':
            user_team = db.query(UserTeam).filter(
                UserTeam.user_id == user_id,
                UserTeam.team_id == team_id
            ).first()
            return user_team is not None
        
        return False
        
    except Exception as e:
        logger.error(f"Error validating team access: {str(e)}")
        return False

def mask_pii(text: str, enabled: bool = True) -> str:
    """
    Mask personally identifiable information in text
    
    Args:
        text: Input text
        enabled: Whether PII masking is enabled
        
    Returns:
        str: Text with PII masked
    """
    if not enabled or not text:
        return text
    
    try:
        # Email addresses
        text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]', text)
        
        # Phone numbers (various formats)
        text = re.sub(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', '[PHONE]', text)
        text = re.sub(r'\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b', '[PHONE]', text)
        text = re.sub(r'\b\+\d{1,3}\s*\d{3}[-.]?\d{3}[-.]?\d{4}\b', '[PHONE]', text)
        
        # Names (capitalized words that might be names)
        words = text.split()
        for i, word in enumerate(words):
            if (i > 0 and  # Not first word
                word[0].isupper() and  # Starts with capital
                len(word) > 2 and  # Reasonable length
                not word.endswith('.') and  # Not end of sentence
                not word.endswith(',') and  # Not punctuation
                word.lower() not in ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'this', 'that', 'these', 'those']):
                words[i] = '[NAME]'
        
        return ' '.join(words)
        
    except Exception as e:
        logger.error(f"Error masking PII: {str(e)}")
        return text

def safe_response_count(count: int, min_n: int = None, org_id: str = None, db: Session = None) -> Dict[str, Any]:
    """
    Return safe response count information
    
    Args:
        count: Actual response count
        min_n: Minimum required
        org_id: Organization ID
        db: Database session
        
    Returns:
        Dict: Safe count information
    """
    is_safe = enforce_min_n(count, min_n, org_id, db)
    
    return {
        "count": count if is_safe else 0,
        "safe": is_safe,
        "min_required": min_n or RULES.min_n,
        "message": None if is_safe else RULES.safe_fallback_message
    }

def safe_percentage(numerator: int, denominator: int, min_n: int = None, org_id: str = None, db: Session = None) -> Optional[float]:
    """
    Calculate safe percentage with min-n enforcement
    
    Args:
        numerator: Numerator for percentage
        denominator: Denominator for percentage
        min_n: Minimum required responses
        org_id: Organization ID
        db: Database session
        
    Returns:
        Optional[float]: Safe percentage or None
    """
    if not enforce_min_n(denominator, min_n, org_id, db):
        return None
    
    if denominator == 0:
        return 0.0
    
    return (numerator / denominator) * 100

# FastAPI dependency for privacy settings
def get_privacy_settings(org_id: str, db: Session = Depends(get_db)) -> PrivacyRules:
    """FastAPI dependency to get privacy settings"""
    return get_org_privacy_settings(org_id, db)
