#!/usr/bin/env python3
"""
Create test users for development (SQLite version)
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.base import User
from app.core.security import get_password_hash
from datetime import datetime

# SQLite database URL
DATABASE_URL = "sqlite:///./novora.db"

def create_test_users():
    """Create test users for development"""
    print("👤 Creating test users for SQLite database...")
    
    # Create engine and session
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if users already exist
        existing_users = db.query(User).all()
        if existing_users:
            print(f"ℹ️ Found {len(existing_users)} existing users in database")
            for user in existing_users:
                print(f"   - {user.email} (role: {user.role})")
        
        # Create admin user
        admin_email = "admin@novora.com"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        
        if not admin_user:
            admin_user = User(
                email=admin_email,
                password_hash=get_password_hash("admin123"),
                role="admin",
                company_name="Novora Admin",
                is_active=True,
                is_email_verified=True,
                created_at=datetime.utcnow()
            )
            db.add(admin_user)
            print(f"✅ Created admin user: {admin_email}")
        else:
            print(f"ℹ️ Admin user already exists: {admin_email}")
        
        # Create regular user
        user_email = "user@novora.com"
        user_user = db.query(User).filter(User.email == user_email).first()
        
        if not user_user:
            user_user = User(
                email=user_email,
                password_hash=get_password_hash("user123"),
                role="core",
                company_name="Novora User",
                is_active=True,
                is_email_verified=True,
                created_at=datetime.utcnow()
            )
            db.add(user_user)
            print(f"✅ Created regular user: {user_email}")
        else:
            print(f"ℹ️ Regular user already exists: {user_email}")
        
        # Create manager user
        manager_email = "manager@novora.com"
        manager_user = db.query(User).filter(User.email == manager_email).first()
        
        if not manager_user:
            manager_user = User(
                email=manager_email,
                password_hash=get_password_hash("manager123"),
                role="manager",
                company_name="Novora Manager",
                is_active=True,
                is_email_verified=True,
                created_at=datetime.utcnow()
            )
            db.add(manager_user)
            print(f"✅ Created manager user: {manager_email}")
        else:
            print(f"ℹ️ Manager user already exists: {manager_email}")
        
        # Create owner user
        owner_email = "owner@novora.com"
        owner_user = db.query(User).filter(User.email == owner_email).first()
        
        if not owner_user:
            owner_user = User(
                email=owner_email,
                password_hash=get_password_hash("owner123"),
                role="enterprise",
                company_name="Novora Enterprise",
                is_active=True,
                is_email_verified=True,
                created_at=datetime.utcnow()
            )
            db.add(owner_user)
            print(f"✅ Created owner user: {owner_email}")
        else:
            print(f"ℹ️ Owner user already exists: {owner_email}")
        
        db.commit()
        print("\n🎉 Test users created successfully!")
        print("\n📋 Login Credentials:")
        print(f"   Admin: {admin_email} / admin123")
        print(f"   User: {user_email} / user123")
        print(f"   Manager: {manager_email} / manager123")
        print(f"   Owner: {owner_email} / owner123")
        print("\n🔗 Access the platform at: http://localhost:3000")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating users: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_test_users()
