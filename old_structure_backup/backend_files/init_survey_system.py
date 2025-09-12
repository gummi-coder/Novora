#!/usr/bin/env python3
"""
Initialize the survey invitation system with admin user and sample employees
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from survey_invitation_system import (
    engine, SessionLocal, User, Employee, pwd_context, create_sample_employees
)

def init_survey_system():
    """Initialize the survey system"""
    print("🚀 Initializing Novora Survey Invitation System...")
    
    # Create session
    db = SessionLocal()
    
    try:
        # Check if admin user exists
        admin_user = db.query(User).filter(User.email == "admin@novora.com").first()
        
        if not admin_user:
            # Create admin user
            admin_user = User(
                email="admin@novora.com",
                password_hash=pwd_context.hash("admin123"),
                role="admin",
                company_name="Novora Company",
                is_active=True,
                is_email_verified=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print("✅ Created admin user: admin@novora.com / admin123")
        else:
            print("ℹ️ Admin user already exists")
        
        # Create sample employees
        print("👥 Creating sample employees...")
        create_sample_employees(db, admin_user.id)
        
        # Count employees
        employee_count = db.query(Employee).filter(Employee.company_id == admin_user.id).count()
        print(f"✅ Created {employee_count} sample employees")
        
        print("\n🎉 Survey system initialized successfully!")
        print("\n📋 Login credentials:")
        print("   Email: admin@novora.com")
        print("   Password: admin123")
        print("\n👥 Sample employees created:")
        
        employees = db.query(Employee).filter(Employee.company_id == admin_user.id).all()
        for emp in employees[:5]:  # Show first 5
            print(f"   - {emp.name} ({emp.email}) - {emp.department}")
        if len(employees) > 5:
            print(f"   ... and {len(employees) - 5} more")
        
        print(f"\n🔗 Access the system at: http://localhost:3000")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_survey_system()
