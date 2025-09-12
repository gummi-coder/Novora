"""
Admin endpoints for user management
"""
from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.base import User
from app.api.deps import get_current_admin_user

router = APIRouter()

class UserUpdate(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    company_name: Optional[str] = None
    is_active: Optional[bool] = None
    is_email_verified: Optional[bool] = None

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    company_name: Optional[str]
    is_active: bool
    is_email_verified: bool
    created_at: datetime
    last_login: Optional[datetime]
    failed_login_attempts: int

    class Config:
        from_attributes = True

class UserStats(BaseModel):
    total_users: int
    active_users: int
    verified_users: int
    admin_users: int
    core_users: int
    pro_users: int
    enterprise_users: int

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get all users with filtering and pagination"""
    query = db.query(User)
    
    # Apply filters
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    if search:
        query = query.filter(
            (User.email.contains(search)) | 
            (User.company_name.contains(search))
        )
    
    # Apply pagination
    users = query.offset(skip).limit(limit).all()
    
    return users

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get a specific user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Update a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deactivating themselves
    if user_id == current_admin.id and user_data.is_active is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    # Update fields
    update_data = user_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return user

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Delete a user (soft delete by deactivating)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deleting themselves
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Soft delete by deactivating
    user.is_active = False
    db.commit()
    
    return {"message": f"User {user_id} deactivated successfully"}

@router.post("/users/{user_id}/activate")
async def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Activate a deactivated user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = True
    db.commit()
    
    return {"message": f"User {user_id} activated successfully"}

@router.post("/users/{user_id}/reset-password")
async def reset_user_password(
    user_id: int,
    new_password: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Reset a user's password"""
    from app.core.security import get_password_hash
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.password_hash = get_password_hash(new_password)
    user.failed_login_attempts = 0
    db.commit()
    
    return {"message": f"Password reset successfully for user {user_id}"}

@router.get("/stats/users", response_model=UserStats)
async def get_user_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get user statistics"""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    verified_users = db.query(User).filter(User.is_email_verified == True).count()
    admin_users = db.query(User).filter(User.role == "admin").count()
    core_users = db.query(User).filter(User.role == "core").count()
    pro_users = db.query(User).filter(User.role == "pro").count()
    enterprise_users = db.query(User).filter(User.role == "enterprise").count()
    
    return UserStats(
        total_users=total_users,
        active_users=active_users,
        verified_users=verified_users,
        admin_users=admin_users,
        core_users=core_users,
        pro_users=pro_users,
        enterprise_users=enterprise_users
    ) 