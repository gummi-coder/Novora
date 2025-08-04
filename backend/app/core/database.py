"""
Database configuration for FastAPI application
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    from app.models.base import User, Survey, Question, Response, Answer, SurveyTemplate, EmailVerificationToken, PasswordResetToken, UserSession, FileAttachment
    from app.models.advanced import Department, Team, UserDepartment, UserTeam, AnonymousComment, CommentAction, SurveyBranching, Permission, Role, RolePermission, UserRole, BrandingConfig, SSOConfig, APIKey, Webhook, SurveySchedule, DashboardAlert, TeamAnalytics
    Base.metadata.create_all(bind=engine) 