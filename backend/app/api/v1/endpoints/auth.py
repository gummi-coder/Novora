"""
Authentication endpoints for FastAPI
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
import uuid

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, verify_token
from app.models.base import User, UserSession, EmailVerificationToken, PasswordResetToken
from app.api.deps import get_current_user
from app.core.email import email_service

router = APIRouter()
security = HTTPBearer()

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    company_name: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    email: str
    user_id: int
    user: dict  # Will contain user info that frontend expects

class RegisterResponse(BaseModel):
    message: str
    user_id: int
    email: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    company_name: Optional[str]
    is_active: bool
    is_email_verified: bool
    created_at: datetime

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return JWT tokens"""
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(login_data.password, user.password_hash):
        # Update failed login attempts
        user.failed_login_attempts += 1
        user.last_failed_login = datetime.utcnow()
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated"
        )
    
    # Reset failed login attempts on successful login
    user.failed_login_attempts = 0
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    # Store refresh token in database
    session = UserSession(
        user_id=user.id,
        refresh_token=refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.add(session)
    db.commit()
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        email=user.email,
        user_id=user.id,
        user={
            "id": str(user.id),
            "email": user.email,
            "firstName": user.email.split('@')[0].title(),
            "lastName": "",
            "role": user.role,
            "status": "active" if user.is_active else "inactive",
            "createdAt": user.created_at.isoformat(),
            "updatedAt": user.created_at.isoformat()
        }
    )

@router.post("/register", response_model=RegisterResponse)
async def register(register_data: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == register_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(register_data.password)
    new_user = User(
        email=register_data.email,
        password_hash=hashed_password,
        company_name=register_data.company_name,
        role="core",  # Default role
        is_active=True,
        is_email_verified=False  # Will need email verification
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send verification email
    verification_token = str(uuid.uuid4())
    token_record = EmailVerificationToken(
        user_id=new_user.id,
        token=verification_token,
        expires_at=datetime.utcnow() + timedelta(hours=24)
    )
    db.add(token_record)
    db.commit()
    
    # Send email (will be logged if not configured)
    email_service.send_verification_email(
        new_user.email, 
        verification_token, 
        new_user.company_name or new_user.email.split('@')[0]
    )
    
    return RegisterResponse(
        message="User registered successfully. Please check your email for verification.",
        user_id=new_user.id,
        email=new_user.email
    )

@router.post("/verify-email")
async def verify_email(token: str, db: Session = Depends(get_db)):
    """Verify email address using token"""
    # Find verification token
    token_record = db.query(EmailVerificationToken).filter(
        EmailVerificationToken.token == token,
        EmailVerificationToken.is_used == False,
        EmailVerificationToken.expires_at > datetime.utcnow()
    ).first()
    
    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    # Get user
    user = db.query(User).filter(User.id == token_record.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Mark email as verified
    user.is_email_verified = True
    token_record.is_used = True
    db.commit()
    
    return {"message": "Email verified successfully"}

@router.post("/resend-verification")
async def resend_verification(email: str, db: Session = Depends(get_db)):
    """Resend email verification"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already verified"
        )
    
    # Create new verification token
    verification_token = str(uuid.uuid4())
    token_record = EmailVerificationToken(
        user_id=user.id,
        token=verification_token,
        expires_at=datetime.utcnow() + timedelta(hours=24)
    )
    db.add(token_record)
    db.commit()
    
    # Send email
    email_service.send_verification_email(
        user.email, 
        verification_token, 
        user.company_name or user.email.split('@')[0]
    )
    
    return {"message": "Verification email sent successfully"}

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Send password reset email"""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Don't reveal if user exists or not
        return {"message": "If the email exists, a password reset link has been sent"}
    
    # Create password reset token
    reset_token = str(uuid.uuid4())
    token_record = PasswordResetToken(
        user_id=user.id,
        token=reset_token,
        expires_at=datetime.utcnow() + timedelta(hours=1)
    )
    db.add(token_record)
    db.commit()
    
    # Send email
    email_service.send_password_reset_email(
        user.email, 
        reset_token, 
        user.company_name or user.email.split('@')[0]
    )
    
    return {"message": "If the email exists, a password reset link has been sent"}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using token"""
    # Find reset token
    token_record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == request.token,
        PasswordResetToken.is_used == False,
        PasswordResetToken.expires_at > datetime.utcnow()
    ).first()
    
    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Get user
    user = db.query(User).filter(User.id == token_record.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password
    user.password_hash = get_password_hash(request.new_password)
    user.failed_login_attempts = 0
    token_record.is_used = True
    db.commit()
    
    return {"message": "Password reset successfully"}

@router.post("/refresh")
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    try:
        # Verify refresh token
        payload = verify_token(refresh_token)
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Check if refresh token exists in database
        session = db.query(UserSession).filter(
            UserSession.refresh_token == refresh_token,
            UserSession.is_revoked == False,
            UserSession.expires_at > datetime.utcnow()
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Create new access token
        new_access_token = create_access_token(data={"sub": user_id})
        
        return {"access_token": new_access_token, "token_type": "bearer"}
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

@router.post("/logout")
async def logout(token: str = Depends(security), db: Session = Depends(get_db)):
    """Logout user by revoking refresh token"""
    try:
        # Find and revoke refresh token
        session = db.query(UserSession).filter(
            UserSession.refresh_token == token.credentials
        ).first()
        
        if session:
            session.is_revoked = True
            db.commit()
        
        return {"message": "Logged out successfully"}
        
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logout failed"
        )

@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "firstName": current_user.email.split('@')[0].title(),
        "lastName": "",
        "role": current_user.role,
        "is_active": current_user.is_active,
        "status": "active" if current_user.is_active else "inactive",
        "createdAt": current_user.created_at.isoformat(),
        "updatedAt": current_user.created_at.isoformat()
    }
