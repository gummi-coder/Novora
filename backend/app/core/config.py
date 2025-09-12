"""
Configuration settings for the FastAPI application
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
import os
from pydantic import Field

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Novora Survey Platform"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"  # development, staging, production
    
    # Database Configuration
    # Development: SQLite, Production: PostgreSQL
    DATABASE_URL: str = "sqlite:///./novora.db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "novora"
    POSTGRES_USER: str = "novora_user"
    POSTGRES_PASSWORD: str = "novora_password"
    
    # Redis Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Redis Configuration for Caching (separate DB)
    REDIS_CACHE_DB: int = 3  # Use DB 3 for caching
    
    # Celery Configuration
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    
    # Security
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production-12345"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Frontend URL
    FRONTEND_URL: str = "https://novorasurveys.com"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:5173",
        "https://novorasurveys.com",
        "https://www.novorasurveys.com",
        "*"  # Allow all origins in development
    ]
    
    # Email
    SMTP_SERVER: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # File Upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
    
    # Cache Configuration
    CACHE_TTL: int = 3600  # 1 hour default cache TTL
    CACHE_PREFIX: str = "novora"
    
    # Auto-Pilot Configuration
    AUTO_PILOT_CHECK_INTERVAL: int = 300  # 5 minutes
    AUTO_PILOT_MAX_RETRIES: int = 3
    
    # Logging Configuration
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/novora.log"
    
    # Performance Configuration
    WORKER_CONCURRENCY: int = 4
    MAX_CONNECTIONS: int = 100
    
    # MVP Feature Flags
    PROFILE: str = "development"
    FEATURE_ADVANCED: bool = False
    FEATURE_EXPORTS: bool = False
    FEATURE_INTEGRATIONS: bool = False
    FEATURE_NLP_PII: bool = False
    FEATURE_NLP_SENTIMENT: bool = False
    FEATURE_AUTOPILOT: bool = False
    FEATURE_ADMIN: bool = False
    FEATURE_PRO: bool = False
    FEATURE_PHOTO: bool = False
    
    # Integration Settings
    SLACK_CLIENT_ID: str = Field(default="", env="SLACK_CLIENT_ID")
    SLACK_CLIENT_SECRET: str = Field(default="", env="SLACK_CLIENT_SECRET")
    SLACK_REDIRECT_URI: str = Field(default="", env="SLACK_REDIRECT_URI")
    
    TEAMS_CLIENT_ID: str = Field(default="", env="TEAMS_CLIENT_ID")
    TEAMS_CLIENT_SECRET: str = Field(default="", env="TEAMS_CLIENT_SECRET")
    TEAMS_REDIRECT_URI: str = Field(default="", env="TEAMS_REDIRECT_URI")
    
    ZOOM_CLIENT_ID: str = Field(default="", env="ZOOM_CLIENT_ID")
    ZOOM_CLIENT_SECRET: str = Field(default="", env="ZOOM_CLIENT_SECRET")
    ZOOM_REDIRECT_URI: str = Field(default="", env="ZOOM_REDIRECT_URI")
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment"""
        return self.ENVIRONMENT.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment"""
        return self.ENVIRONMENT.lower() == "development"
    
    def get_database_url(self) -> str:
        """Get database URL based on environment"""
        if self.is_production:
            # Production: Use PostgreSQL
            return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        else:
            # Development: Use SQLite
            return self.DATABASE_URL
    
    def get_redis_url(self) -> str:
        """Get Redis URL with authentication if provided"""
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"  # Allow extra environment variables
    )

settings = Settings()
