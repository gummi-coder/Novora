"""
Database configuration for FastAPI application
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool
from app.core.config import settings
import redis
import logging

logger = logging.getLogger(__name__)

# Get database URL based on environment
DATABASE_URL = settings.get_database_url()

# Database engine configuration
if settings.is_production:
    # Production: PostgreSQL with connection pooling
    engine = create_engine(
        DATABASE_URL,
        poolclass=QueuePool,
        pool_size=20,  # Number of connections to maintain
        max_overflow=30,  # Additional connections that can be created
        pool_pre_ping=True,  # Verify connections before use
        pool_recycle=3600,  # Recycle connections after 1 hour
        echo=settings.DEBUG,  # Log SQL queries in debug mode
    )
else:
    # Development: SQLite
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=settings.DEBUG,
    )

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Redis client for caching
redis_client = None

def get_redis_client():
    """Get Redis client instance"""
    global redis_client
    if redis_client is None:
        try:
            redis_url = settings.get_redis_url()
            redis_client = redis.from_url(
                redis_url,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
                health_check_interval=30
            )
            # Test connection
            redis_client.ping()
            logger.info("Redis connection established successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            redis_client = None
    return redis_client

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    try:
        from app.models.base import User, Survey, Question, Response, Answer, SurveyTemplate, EmailVerificationToken, PasswordResetToken, UserSession, FileAttachment
        from app.models.advanced import Department, Team, UserDepartment, UserTeam, AnonymousComment, CommentAction, SurveyBranching, Permission, Role, RolePermission, UserRole, BrandingConfig, SSOConfig, APIKey, Webhook, SurveySchedule, DashboardAlert, TeamAnalytics, Metric, QuestionBank, AutoPilotPlan, AutoPilotSurvey
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

def check_database_connection():
    """Check if database connection is working"""
    try:
        from sqlalchemy import text
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            connection.commit()
        logger.info("Database connection successful")
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False

def check_redis_connection():
    """Check if Redis connection is working"""
    try:
        client = get_redis_client()
        if client:
            client.ping()
            logger.info("Redis connection successful")
            return True
        return False
    except Exception as e:
        logger.error(f"Redis connection failed: {e}")
        return False 