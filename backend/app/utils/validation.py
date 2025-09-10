"""
Validation Utilities
Common validation functions for data integrity
"""
import re
from typing import Optional

def validate_email(email: str) -> bool:
    """
    Validate email format
    
    Args:
        email: Email address to validate
        
    Returns:
        True if email is valid
    """
    if not email:
        return False
    
    # Basic email regex pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_phone(phone: str) -> bool:
    """
    Validate phone number format
    
    Args:
        phone: Phone number to validate
        
    Returns:
        True if phone number is valid
    """
    if not phone:
        return False
    
    # Remove all non-digit characters
    digits_only = re.sub(r'\D', '', phone)
    
    # Check if it's a valid length (7-15 digits)
    return 7 <= len(digits_only) <= 15

def validate_uuid(uuid_string: str) -> bool:
    """
    Validate UUID format
    
    Args:
        uuid_string: UUID string to validate
        
    Returns:
        True if UUID is valid
    """
    if not uuid_string:
        return False
    
    # UUID regex pattern
    pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    return bool(re.match(pattern, uuid_string.lower()))

def validate_password_strength(password: str) -> dict:
    """
    Validate password strength
    
    Args:
        password: Password to validate
        
    Returns:
        Dictionary with validation results
    """
    result = {
        'valid': True,
        'errors': [],
        'strength': 'weak'
    }
    
    if len(password) < 8:
        result['valid'] = False
        result['errors'].append('Password must be at least 8 characters long')
    
    if not re.search(r'[A-Z]', password):
        result['errors'].append('Password must contain at least one uppercase letter')
    
    if not re.search(r'[a-z]', password):
        result['errors'].append('Password must contain at least one lowercase letter')
    
    if not re.search(r'\d', password):
        result['errors'].append('Password must contain at least one digit')
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        result['errors'].append('Password must contain at least one special character')
    
    # Determine strength
    if len(result['errors']) == 0:
        result['strength'] = 'strong'
    elif len(result['errors']) <= 2:
        result['strength'] = 'medium'
    else:
        result['strength'] = 'weak'
        result['valid'] = False
    
    return result

def validate_url(url: str) -> bool:
    """
    Validate URL format
    
    Args:
        url: URL to validate
        
    Returns:
        True if URL is valid
    """
    if not url:
        return False
    
    # Basic URL regex pattern
    pattern = r'^https?://(?:[-\w.])+(?:[:\d]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$'
    return bool(re.match(pattern, url))

def validate_date_format(date_string: str, format: str = '%Y-%m-%d') -> bool:
    """
    Validate date format
    
    Args:
        date_string: Date string to validate
        format: Expected date format
        
    Returns:
        True if date format is valid
    """
    try:
        from datetime import datetime
        datetime.strptime(date_string, format)
        return True
    except ValueError:
        return False

def sanitize_string(input_string: str, max_length: Optional[int] = None) -> str:
    """
    Sanitize string input
    
    Args:
        input_string: String to sanitize
        max_length: Maximum length allowed
        
    Returns:
        Sanitized string
    """
    if not input_string:
        return ""
    
    # Remove null bytes and control characters
    sanitized = re.sub(r'[\x00-\x1f\x7f]', '', input_string)
    
    # Trim whitespace
    sanitized = sanitized.strip()
    
    # Truncate if max_length is specified
    if max_length and len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized

def validate_json_schema(data: dict, required_fields: list, optional_fields: list = None) -> dict:
    """
    Validate data against a simple JSON schema
    
    Args:
        data: Data to validate
        required_fields: List of required field names
        optional_fields: List of optional field names
        
    Returns:
        Dictionary with validation results
    """
    result = {
        'valid': True,
        'errors': [],
        'missing_fields': [],
        'extra_fields': []
    }
    
    if not isinstance(data, dict):
        result['valid'] = False
        result['errors'].append('Data must be a dictionary')
        return result
    
    # Check required fields
    for field in required_fields:
        if field not in data:
            result['missing_fields'].append(field)
            result['valid'] = False
    
    # Check for extra fields
    if optional_fields:
        allowed_fields = set(required_fields + optional_fields)
        extra_fields = set(data.keys()) - allowed_fields
        if extra_fields:
            result['extra_fields'] = list(extra_fields)
    
    if result['missing_fields']:
        result['errors'].append(f"Missing required fields: {', '.join(result['missing_fields'])}")
    
    if result['extra_fields']:
        result['errors'].append(f"Unexpected fields: {', '.join(result['extra_fields'])}")
    
    return result
