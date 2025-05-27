from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required,
    get_jwt_identity, get_jwt, decode_token
)
from werkzeug.security import generate_password_hash, check_password_hash
from models import User, EmailVerificationToken, PasswordResetToken, UserSession
from database import db
from datetime import datetime, timedelta
import re
from utils.email import send_verification_email, send_password_reset_email
from utils.rate_limit import rate_limit, record_failed_attempt, reset_failed_attempts

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    # At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
    return re.match(pattern, password) is not None

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ['email', 'password', 'company_name']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Validate email format
    if not validate_email(data['email']):
        return jsonify({'message': 'Invalid email format'}), 400
    
    # Validate password strength
    if not validate_password(data['password']):
        return jsonify({
            'message': 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
        }), 400
    
    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 409
    
    # Create new user
    user = User(
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        company_name=data['company_name'],
        role='core'  # Default role
    )
    
    db.session.add(user)
    db.session.commit()
    
    # Send verification email
    send_verification_email(user)
    
    # Generate tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    # Create session
    session = UserSession(
        user_id=user.id,
        refresh_token=refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=30),
        ip_address=request.remote_addr,
        user_agent=request.user_agent.string
    )
    db.session.add(session)
    db.session.commit()
    
    return jsonify({
        'message': 'User registered successfully. Please check your email to verify your account.',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'id': user.id,
            'email': user.email,
            'company_name': user.company_name,
            'role': user.role,
            'is_email_verified': user.is_email_verified
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
@rate_limit(max_attempts=5, window_minutes=15)
def login():
    data = request.get_json()
    
    if not all(k in data for k in ['email', 'password']):
        return jsonify({'message': 'Missing email or password'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        if user:
            record_failed_attempt(user)
        return jsonify({'message': 'Invalid email or password'}), 401
    
    if not user.is_active:
        return jsonify({'message': 'Account is deactivated'}), 403
    
    if not user.is_email_verified:
        return jsonify({'message': 'Please verify your email before logging in'}), 403
    
    # Reset failed attempts on successful login
    reset_failed_attempts(user)
    
    # Update last login
    user.last_login = datetime.utcnow()
    
    # Generate tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    # Create session
    session = UserSession(
        user_id=user.id,
        refresh_token=refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=30),
        ip_address=request.remote_addr,
        user_agent=request.user_agent.string
    )
    db.session.add(session)
    db.session.commit()
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'id': user.id,
            'email': user.email,
            'company_name': user.company_name,
            'role': user.role,
            'is_email_verified': user.is_email_verified
        }
    }), 200

@auth_bp.route('/verify-email/<token>', methods=['POST'])
def verify_email(token):
    verification = EmailVerificationToken.query.filter_by(
        token=token,
        is_used=False
    ).first()
    
    if not verification:
        return jsonify({'message': 'Invalid or expired verification token'}), 400
    
    if verification.expires_at < datetime.utcnow():
        return jsonify({'message': 'Verification token has expired'}), 400
    
    user = User.query.get(verification.user_id)
    user.is_email_verified = True
    verification.is_used = True
    
    db.session.commit()
    
    return jsonify({'message': 'Email verified successfully'}), 200

@auth_bp.route('/resend-verification', methods=['POST'])
@jwt_required()
def resend_verification():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.is_email_verified:
        return jsonify({'message': 'Email is already verified'}), 400
    
    send_verification_email(user)
    
    return jsonify({'message': 'Verification email sent'}), 200

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    refresh_token = request.json.get('refresh_token')
    if not refresh_token:
        return jsonify({'message': 'Refresh token is required'}), 400
    
    try:
        # Verify refresh token
        decoded = decode_token(refresh_token)
        user_id = decoded['sub']
        
        # Check if session exists and is valid
        session = UserSession.query.filter_by(
            user_id=user_id,
            refresh_token=refresh_token,
            is_revoked=False
        ).first()
        
        if not session or session.expires_at < datetime.utcnow():
            return jsonify({'message': 'Invalid or expired refresh token'}), 401
        
        # Generate new access token
        access_token = create_access_token(identity=user_id)
        
        return jsonify({
            'access_token': access_token
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Invalid refresh token'}), 401

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    refresh_token = request.json.get('refresh_token')
    if refresh_token:
        session = UserSession.query.filter_by(refresh_token=refresh_token).first()
        if session:
            session.is_revoked = True
            db.session.commit()
    
    return jsonify({'message': 'Logged out successfully'}), 200

@auth_bp.route('/reset-password-request', methods=['POST'])
def reset_password_request():
    data = request.get_json()
    
    if 'email' not in data:
        return jsonify({'message': 'Email is required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if user:
        send_password_reset_email(user)
    
    # Return the same message even if user doesn't exist (security best practice)
    return jsonify({'message': 'If an account exists with this email, you will receive password reset instructions'}), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    
    if not all(k in data for k in ['token', 'new_password']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    reset_token = PasswordResetToken.query.filter_by(
        token=data['token'],
        is_used=False
    ).first()
    
    if not reset_token:
        return jsonify({'message': 'Invalid or expired reset token'}), 400
    
    if reset_token.expires_at < datetime.utcnow():
        return jsonify({'message': 'Reset token has expired'}), 400
    
    if not validate_password(data['new_password']):
        return jsonify({
            'message': 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
        }), 400
    
    user = User.query.get(reset_token.user_id)
    user.password_hash = generate_password_hash(data['new_password'])
    reset_token.is_used = True
    
    # Revoke all existing sessions
    UserSession.query.filter_by(user_id=user.id).update({'is_revoked': True})
    
    db.session.commit()
    
    return jsonify({'message': 'Password has been reset successfully'}), 200

@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    data = request.get_json()
    
    if not all(k in data for k in ['current_password', 'new_password']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    if not check_password_hash(user.password_hash, data['current_password']):
        return jsonify({'message': 'Current password is incorrect'}), 401
    
    if not validate_password(data['new_password']):
        return jsonify({
            'message': 'New password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
        }), 400
    
    user.password_hash = generate_password_hash(data['new_password'])
    db.session.commit()
    
    return jsonify({'message': 'Password updated successfully'}), 200

@auth_bp.route('/upgrade-plan', methods=['POST'])
@jwt_required()
def upgrade_plan():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    data = request.get_json()
    
    if 'new_role' not in data:
        return jsonify({'message': 'New role is required'}), 400
    
    if data['new_role'] not in ['pro', 'enterprise']:
        return jsonify({'message': 'Invalid role'}), 400
    
    # In a real application, you would:
    # 1. Verify payment
    # 2. Update subscription status
    # 3. Update user role
    user.role = data['new_role']
    db.session.commit()
    
    return jsonify({
        'message': 'Plan upgraded successfully',
        'user': {
            'id': user.id,
            'email': user.email,
            'company_name': user.company_name,
            'role': user.role
        }
    }), 200

@auth_bp.route('/deactivate', methods=['POST'])
@jwt_required()
def deactivate_account():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    user.is_active = False
    db.session.commit()
    
    return jsonify({'message': 'Account deactivated successfully'}), 200

# Admin only routes
@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    users = User.query.all()
    return jsonify([{
        'id': user.id,
        'email': user.email,
        'company_name': user.company_name,
        'role': user.role,
        'created_at': user.created_at.isoformat(),
        'last_login': user.last_login.isoformat() if user.last_login else None,
        'is_active': user.is_active
    } for user in users]), 200

@auth_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    if 'role' in data:
        if data['role'] not in ['core', 'pro', 'enterprise', 'admin']:
            return jsonify({'message': 'Invalid role'}), 400
        user.role = data['role']
    
    if 'is_active' in data:
        user.is_active = data['is_active']
    
    db.session.commit()
    
    return jsonify({
        'message': 'User updated successfully',
        'user': {
            'id': user.id,
            'email': user.email,
            'company_name': user.company_name,
            'role': user.role,
            'is_active': user.is_active
        }
    }), 200 