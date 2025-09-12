#!/usr/bin/env python3
"""
Create test users for the Novora platform
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import get_db, init_db
from app.models.base import User
from app.models.advanced import Role, UserRole
from sqlalchemy.orm import Session
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_test_users():
    """Create test users for development"""
    print("👤 Creating test users...")
    
    # Initialize database
    init_db()
    
    # Get database session
    db = next(get_db())
    
    try:
        # Create admin user
        admin_email = "admin@novora.com"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        
        if not admin_user:
            admin_user = User(
                email=admin_email,
                password_hash=pwd_context.hash("admin123"),
                role="admin",
                company_name="Novora Admin",
                is_active=True,
                is_email_verified=True
            )
            db.add(admin_user)
            db.flush()
            print(f"✅ Created admin user: {admin_email}")
        else:
            print(f"ℹ️ Admin user already exists: {admin_email}")
        
        # Create regular user
        user_email = "user@novora.com"
        regular_user = db.query(User).filter(User.email == user_email).first()
        
        if not regular_user:
            regular_user = User(
                email=user_email,
                password_hash=pwd_context.hash("user123"),
                role="user",
                company_name="Novora Company",
                is_active=True,
                is_email_verified=True
            )
            db.add(regular_user)
            db.flush()
            print(f"✅ Created regular user: {user_email}")
        else:
            print(f"ℹ️ Regular user already exists: {user_email}")
        
        # Create owner user
        owner_email = "owner@novora.com"
        owner_user = db.query(User).filter(User.email == owner_email).first()
        
        if not owner_user:
            owner_user = User(
                email=owner_email,
                password_hash=pwd_context.hash("owner123"),
                role="owner",
                company_name="Novora Enterprise",
                is_active=True,
                is_email_verified=True
            )
            db.add(owner_user)
            db.flush()
            print(f"✅ Created owner user: {owner_email}")
        else:
            print(f"ℹ️ Owner user already exists: {owner_email}")
        
        db.commit()
        print("\n🎉 Test users created successfully!")
        print("\n📋 Login Credentials:")
        print(f"   Admin: {admin_email} / admin123")
        print(f"   User: {user_email} / user123")
        print(f"   Owner: {owner_email} / owner123")
        print("\n🔗 Access the platform at: http://localhost:8080")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating users: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_test_users() 