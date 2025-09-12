#!/usr/bin/env python3
"""
Database initialization script for Novora Survey Platform
"""
import os
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent))

from app.core.database import init_db, engine
from app.models.base import Base, User
from app.core.security import get_password_hash
from sqlalchemy.orm import Session

def create_admin_user():
    """Create a default admin user"""
    db = Session(engine)
    
    # Check if admin user already exists
    admin = db.query(User).filter(User.email == "admin@novora.com").first()
    if admin:
        print("Admin user already exists")
        return
    
    # Create admin user
    admin_user = User(
        email="admin@novora.com",
        password_hash=get_password_hash("admin123"),
        role="admin",
        company_name="Novora Admin",
        is_active=True,
        is_email_verified=True
    )
    
    db.add(admin_user)
    db.commit()
    db.close()
    print("Admin user created: admin@novora.com / admin123")

def main():
    """Initialize database and create tables"""
    print("Initializing database...")
    
    # Create tables
    init_db()
    print("Database tables created successfully!")
    
    # Create admin user
    create_admin_user()
    
    print("Database initialization complete!")
    print("You can now start the server with: uvicorn app.main:app --reload")

if __name__ == "__main__":
    main() 