#!/usr/bin/env python3
"""
Create test users for the simple auth server
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from simple_auth_server import SessionLocal, User, pwd_context

def create_test_users():
    """Create test users for development"""
    print("👤 Creating test users for simple auth server...")
    
    # Get database session
    db = SessionLocal()
    
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
            print(f"✅ Created admin user: {admin_email}")
        else:
            print(f"ℹ️ Admin user already exists: {admin_email}")
        
        # Create manager user
        manager_email = "manager@novora.com"
        manager_user = db.query(User).filter(User.email == manager_email).first()
        
        if not manager_user:
            manager_user = User(
                email=manager_email,
                password_hash=pwd_context.hash("manager123"),
                role="manager",
                company_name="Novora Company",
                is_active=True,
                is_email_verified=True
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
                password_hash=pwd_context.hash("owner123"),
                role="owner",
                company_name="Novora Enterprise",
                is_active=True,
                is_email_verified=True
            )
            db.add(owner_user)
            print(f"✅ Created owner user: {owner_email}")
        else:
            print(f"ℹ️ Owner user already exists: {owner_email}")
        
        db.commit()
        print("\n🎉 Test users created successfully!")
        print("\n📋 Login Credentials:")
        print(f"   Admin: {admin_email} / admin123")
        print(f"   Manager: {manager_email} / manager123")
        print(f"   Owner: {owner_email} / owner123")
        print("\n🔗 Access the platform at: http://localhost:3000")
        print("🔗 API available at: http://localhost:8000")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating users: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_test_users()
