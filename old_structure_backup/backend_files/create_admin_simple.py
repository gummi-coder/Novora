#!/usr/bin/env python3
"""
Simple script to create admin user
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

def create_admin_user():
    """Create admin user"""
    print("🔐 Creating admin user...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    db = SessionLocal()
    
    try:
        # Check if admin user exists
        admin_user = db.query(User).filter(User.email == "admin@novora.com").first()
        
        if admin_user:
            print("ℹ️ Admin user already exists")
            # Reset password anyway
            admin_user.password_hash = pwd_context.hash("admin123")
            admin_user.is_active = True
            admin_user.is_email_verified = True
            db.commit()
            print("✅ Admin password reset to: admin123")
        else:
            # Create new admin user
            admin_user = User(
                email="admin@novora.com",
                password_hash=pwd_context.hash("admin123"),
                role="admin",
                company_name="Novora Admin",
                is_active=True,
                is_email_verified=True
            )
            db.add(admin_user)
            db.commit()
            print("✅ Admin user created successfully!")
        
        print("\n📋 Login credentials:")
        print("   Email: admin@novora.com")
        print("   Password: admin123")
        print("\n🔗 Access the platform at: http://localhost:3000")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
