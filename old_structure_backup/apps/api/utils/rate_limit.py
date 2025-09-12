from functools import wraps
from flask import request, jsonify
from datetime import datetime, timedelta
from models import User
from database import db

def rate_limit(max_attempts=5, window_minutes=15):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get IP address
            ip = request.remote_addr
            
            # Get user if email is provided
            data = request.get_json()
            email = data.get('email') if data else None
            
            if email:
                user = User.query.filter_by(email=email).first()
                if user:
                    # Check if user is locked out
                    if user.failed_login_attempts >= max_attempts:
                        if user.last_failed_login and (datetime.utcnow() - user.last_failed_login) < timedelta(minutes=window_minutes):
                            return jsonify({
                                'message': f'Too many failed attempts. Please try again in {window_minutes} minutes.'
                            }), 429
                        else:
                            # Reset failed attempts if window has passed
                            user.failed_login_attempts = 0
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def record_failed_attempt(user):
    user.failed_login_attempts += 1
    user.last_failed_login = datetime.utcnow()
    db.session.commit()

def reset_failed_attempts(user):
    user.failed_login_attempts = 0
    user.last_failed_login = None
    db.session.commit() 