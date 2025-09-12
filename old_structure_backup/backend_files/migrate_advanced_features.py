"""
Migration script for advanced features
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import init_db, SessionLocal
from app.models.advanced import (
    Department, Team, UserDepartment, UserTeam, AnonymousComment, 
    Permission, Role, RolePermission, UserRole, BrandingConfig, 
    SSOConfig, APIKey, Webhook, SurveySchedule, DashboardAlert, 
    TeamAnalytics, SurveyBranching, CommentAction
)

def migrate_advanced_features():
    """Create all advanced feature tables"""
    print("🚀 Starting advanced features migration...")
    
    try:
        # Initialize database with all models
        init_db()
        print("✅ Database tables created successfully!")
        
        # Verify tables exist
        db = SessionLocal()
        
        # Check if tables exist by trying to query them
        tables_to_check = [
            Department, Team, UserDepartment, UserTeam, AnonymousComment,
            Permission, Role, RolePermission, UserRole, BrandingConfig,
            SSOConfig, APIKey, Webhook, SurveySchedule, DashboardAlert,
            TeamAnalytics, SurveyBranching, CommentAction
        ]
        
        for table in tables_to_check:
            try:
                db.query(table).limit(1).all()
                print(f"✅ {table.__name__} table verified")
            except Exception as e:
                print(f"❌ Error with {table.__name__}: {e}")
        
        db.close()
        print("🎉 Advanced features migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise

if __name__ == "__main__":
    migrate_advanced_features() 