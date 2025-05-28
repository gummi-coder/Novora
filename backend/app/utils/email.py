from flask_mail import Mail, Message
from flask import current_app
import secrets
from datetime import datetime, timedelta
from models import User, PasswordResetToken, EmailVerificationToken
from app.core.database import db

mail = Mail()

def send_verification_email(user):
    # Generate verification token
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=24)
    
    # Store token in database
    verification_token = EmailVerificationToken(
        user_id=user.id,
        token=token,
        expires_at=expires_at
    )
    db.session.add(verification_token)
    db.session.commit()
    
    # Create verification link
    verification_link = f"{current_app.config['FRONTEND_URL']}/verify-email?token={token}"
    
    # Send email
    msg = Message(
        'Verify your email address',
        sender=current_app.config['MAIL_DEFAULT_SENDER'],
        recipients=[user.email]
    )
    msg.body = f'''To verify your email address, visit the following link:
{verification_link}

This link will expire in 24 hours.

If you did not make this request, please ignore this email.
'''
    mail.send(msg)

def send_password_reset_email(user):
    # Generate reset token
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    # Store token in database
    reset_token = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=expires_at
    )
    db.session.add(reset_token)
    db.session.commit()
    
    # Create reset link
    reset_link = f"{current_app.config['FRONTEND_URL']}/reset-password?token={token}"
    
    # Send email
    msg = Message(
        'Reset your password',
        sender=current_app.config['MAIL_DEFAULT_SENDER'],
        recipients=[user.email]
    )
    msg.body = f'''To reset your password, visit the following link:
{reset_link}

This link will expire in 1 hour.

If you did not make this request, please ignore this email.
'''
    mail.send(msg) 