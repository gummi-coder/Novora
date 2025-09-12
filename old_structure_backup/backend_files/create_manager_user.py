#!/usr/bin/env python3
"""
Simple script to create manager user
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from passlib.context import CryptContext

# Create base class
Base = declarative_base()

# Simple User model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    role = Column(String(20), nullable=False, default='manager')
    company_name = Column(String(120))
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    is_email_verified = Column(Boolean, default=False)

# Database setup
DATABASE_URL = "sqlite:///./novora.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_manager_user():
    """Create manager user"""
    print("👤 Creating manager user...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    db = SessionLocal()
    
    try:
        # Check if manager user exists
        manager_user = db.query(User).filter(User.email == "manager@novora.com").first()
        
        if manager_user:
            print("ℹ️ Manager user already exists")
            # Reset password anyway
            manager_user.password_hash = pwd_context.hash("manager123")
            manager_user.is_active = True
            manager_user.is_email_verified = True
            db.commit()
            print("✅ Manager password reset to: manager123")
        else:
            # Create new manager user
            manager_user = User(
                email="manager@novora.com",
                password_hash=pwd_context.hash("manager123"),
                role="manager",
                company_name="Novora Company",
                is_active=True,
                is_email_verified=True
            )
            db.add(manager_user)
            db.commit()
            print("✅ Manager user created successfully!")
        
        print("\n📋 Login credentials:")
        print("   Email: manager@novora.com")
        print("   Password: manager123")
        print("\n🔗 Access the platform at: http://localhost:3000")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_manager_user()
