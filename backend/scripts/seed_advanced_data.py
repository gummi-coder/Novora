"""
Seed script for advanced features data
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, init_db
from app.models.base import User, Survey, Question, Response, Answer
from app.models.advanced import (
    Department, Team, UserDepartment, UserTeam, AnonymousComment, 
    Permission, Role, RolePermission, UserRole, BrandingConfig, 
    SSOConfig, APIKey, DashboardAlert, TeamAnalytics
)
from datetime import datetime, timedelta
import hashlib
import secrets

def seed_advanced_data():
    """Seed database with advanced features data"""
    db = SessionLocal()
    
    try:
        print("🌱 Seeding advanced features data...")
        
        # Get or create a test user/company
        user = db.query(User).first()
        if not user:
            print("❌ No users found. Please create a user first.")
            return
        
        print(f"📊 Using company: {user.company_name or user.email}")
        
        # 1. Create Departments
        print("🏢 Creating departments...")
        engineering_dept = Department(
            name="Engineering",
            level=1,
            company_id=user.id
        )
        sales_dept = Department(
            name="Sales",
            level=1,
            company_id=user.id
        )
        hr_dept = Department(
            name="Human Resources",
            level=1,
            company_id=user.id
        )
        
        db.add_all([engineering_dept, sales_dept, hr_dept])
        db.flush()  # Get IDs
        
        # 2. Create Teams
        print("👥 Creating teams...")
        frontend_team = Team(
            name="Frontend",
            department_id=engineering_dept.id
        )
        backend_team = Team(
            name="Backend",
            department_id=engineering_dept.id
        )
        enterprise_team = Team(
            name="Enterprise Sales",
            department_id=sales_dept.id
        )
        hr_team = Team(
            name="HR Operations",
            department_id=hr_dept.id
        )
        
        db.add_all([frontend_team, backend_team, enterprise_team, hr_team])
        db.flush()
        
        # 3. Create Permissions
        print("🔐 Creating permissions...")
        permissions_data = [
            ("view_global", "View all data globally", "global"),
            ("edit_global", "Edit all data globally", "global"),
            ("view_department", "View department data", "department"),
            ("manage_department", "Manage department", "department"),
            ("view_team", "View team data", "team"),
            ("manage_team", "Manage team", "team"),
            ("create_surveys", "Create surveys", "individual"),
            ("view_analytics", "View analytics", "individual"),
        ]
        
        permissions = []
        for name, description, scope in permissions_data:
            # Check if permission already exists
            existing_perm = db.query(Permission).filter(Permission.name == name).first()
            if existing_perm:
                permissions.append(existing_perm)
            else:
                perm = Permission(name=name, description=description, scope=scope)
                permissions.append(perm)
        
        # Only add new permissions
        new_permissions = [p for p in permissions if not p.id]
        if new_permissions:
            db.add_all(new_permissions)
            db.flush()
        
        # 4. Create Roles
        print("👤 Creating roles...")
        roles_data = [
            ("Global Admin", "Full access to all features", "global", []),
            ("Department Manager", "Manage department and teams", "department", ["view_department", "manage_department", "view_team", "manage_team"]),
            ("Team Lead", "Manage team and view team data", "team", ["view_team", "manage_team"]),
            ("Survey Creator", "Create and manage surveys", "individual", ["create_surveys", "view_analytics"]),
        ]
        
        roles = []
        for name, description, scope, perm_names in roles_data:
            # Check if role already exists
            existing_role = db.query(Role).filter(Role.name == name, Role.company_id == user.id).first()
            if existing_role:
                roles.append(existing_role)
            else:
                role = Role(
                    name=name,
                    description=description,
                    scope=scope,
                    company_id=user.id
                )
                roles.append(role)
        
        # Only add new roles
        new_roles = [r for r in roles if not r.id]
        if new_roles:
            db.add_all(new_roles)
            db.flush()
        
        # 5. Assign permissions to roles
        print("🔗 Assigning permissions to roles...")
        role_permissions = []
        for role, (_, _, _, perm_names) in zip(roles, roles_data):
            for perm_name in perm_names:
                perm = next(p for p in permissions if p.name == perm_name)
                role_perm = RolePermission(role_id=role.id, permission_id=perm.id)
                role_permissions.append(role_perm)
        
        db.add_all(role_permissions)
        
        # 6. Create Branding Config
        print("🎨 Creating branding config...")
        existing_branding = db.query(BrandingConfig).filter(BrandingConfig.company_id == user.id).first()
        if not existing_branding:
            branding = BrandingConfig(
                company_id=user.id,
                logo_url="/uploads/company-logo.png",
                primary_color="#3b82f6",
                secondary_color="#1e40af",
                email_domain="company.com",
                survey_theme="light",
                company_name=user.company_name or "Your Company"
            )
            db.add(branding)
        
        # 7. Create SSO Config
        print("🔑 Creating SSO config...")
        existing_sso = db.query(SSOConfig).filter(SSOConfig.company_id == user.id).first()
        if not existing_sso:
            sso_config = SSOConfig(
                company_id=user.id,
                provider="google_workspace",
                enabled=False,
                domain="company.com"
            )
            db.add(sso_config)
        
        # 8. Create API Key
        print("🔑 Creating API key...")
        api_key_value = None
        existing_api_key = db.query(APIKey).filter(APIKey.company_id == user.id).first()
        if not existing_api_key:
            api_key_value = "nov_live_" + secrets.token_urlsafe(32)
            api_key_hash = hashlib.sha256(api_key_value.encode()).hexdigest()
            
            api_key = APIKey(
                company_id=user.id,
                name="Production API Key",
                key_hash=api_key_hash,
                permissions=["read_surveys", "read_responses", "read_analytics"]
            )
            db.add(api_key)
        
        # 9. Create Dashboard Alerts
        print("⚠️ Creating dashboard alerts...")
        alerts = [
            DashboardAlert(
                company_id=user.id,
                type="mood_drop",
                message="Organizational mood dropped to 6.8/10",
                severity="warning",
                threshold=7.0,
                current_value=6.8
            ),
            DashboardAlert(
                company_id=user.id,
                type="engagement",
                message="Employee engagement: +1.5% this month",
                severity="info",
                current_value=1.5
            )
        ]
        db.add_all(alerts)
        
        # 10. Create Anonymous Comments
        print("💬 Creating anonymous comments...")
        comments = [
            AnonymousComment(
                survey_id=1,  # Assuming survey ID 1 exists
                team_id=frontend_team.id,
                text="Great team collaboration and supportive environment!",
                sentiment="positive",
                tags=["collaboration", "support"]
            ),
            AnonymousComment(
                survey_id=1,
                team_id=backend_team.id,
                text="Need more documentation for new features",
                sentiment="neutral",
                tags=["documentation", "improvement"]
            ),
            AnonymousComment(
                survey_id=1,
                team_id=enterprise_team.id,
                text="Sales targets are too aggressive this quarter",
                sentiment="negative",
                tags=["targets", "pressure"]
            )
        ]
        db.add_all(comments)
        
        # 11. Create Team Analytics
        print("📊 Creating team analytics...")
        team_analytics = [
            TeamAnalytics(
                team_id=frontend_team.id,
                survey_id=1,
                avg_score=8.2,
                score_change=0.3,
                response_count=15,
                sentiment_score=0.7
            ),
            TeamAnalytics(
                team_id=backend_team.id,
                survey_id=1,
                avg_score=7.8,
                score_change=-0.1,
                response_count=12,
                sentiment_score=0.5
            ),
            TeamAnalytics(
                team_id=enterprise_team.id,
                survey_id=1,
                avg_score=6.9,
                score_change=-0.5,
                response_count=8,
                sentiment_score=0.2
            )
        ]
        db.add_all(team_analytics)
        
        db.commit()
        print("✅ Advanced features data seeded successfully!")
        if api_key_value:
            print(f"🔑 API Key: {api_key_value}")
            print("📝 Note: Save this API key for testing purposes")
        else:
            print("🔑 API Key already exists")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    seed_advanced_data() 