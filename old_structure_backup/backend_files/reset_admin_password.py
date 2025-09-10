#!/usr/bin/env python3
"""
Reset admin password to admin123
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db
from app.models.base import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def reset_admin_password():
    """Reset admin password to admin123"""
    print("🔐 Resetting admin password...")
    
    # Get database session
    db = next(get_db())
    
    try:
        # Find admin user
        admin_user = db.query(User).filter(User.email == "admin@novora.com").first()
        
        if not admin_user:
            print("❌ Admin user not found!")
            return
        
        # Reset password
        admin_user.password_hash = pwd_context.hash("admin123")
        admin_user.is_email_verified = True
        admin_user.is_active = True
        admin_user.failed_login_attempts = 0
        
        db.commit()
        print("✅ Admin password reset successfully!")
        print("📋 Login credentials:")
        print("   Email: admin@novora.com")
        print("   Password: admin123")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error resetting password: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin_password()
