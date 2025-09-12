#!/usr/bin/env python3
"""
Production database setup script
"""
import os
import sys
import logging
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.config import settings
from app.core.database import engine, init_db, check_database_connection, check_redis_connection
from app.core.cache import cache
from alembic.config import Config
from alembic import command
import subprocess

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_database():
    """Set up the production database"""
    logger.info("Setting up production database...")
    
    # Check database connection
    if not check_database_connection():
        logger.error("Database connection failed!")
        return False
    
    # Run Alembic migrations
    try:
        alembic_cfg = Config("migrations/alembic.ini")
        command.upgrade(alembic_cfg, "head")
        logger.info("Database migrations completed successfully")
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        return False
    
    # Initialize database tables (if needed)
    try:
        init_db()
        logger.info("Database initialization completed")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        return False
    
    return True

def setup_redis():
    """Set up Redis cache"""
    logger.info("Setting up Redis cache...")
    
    # Check Redis connection
    if not check_redis_connection():
        logger.error("Redis connection failed!")
        return False
    
    # Test cache functionality
    try:
        test_key = "setup_test"
        test_value = {"status": "ok", "timestamp": "2024-12-19T10:00:00Z"}
        
        # Set test value
        cache.set(test_key, test_value, ttl=60)
        
        # Get test value
        retrieved_value = cache.get(test_key)
        
        if retrieved_value == test_value:
            logger.info("Redis cache setup completed successfully")
            # Clean up test key
            cache.delete(test_key)
            return True
        else:
            logger.error("Redis cache test failed")
            return False
            
    except Exception as e:
        logger.error(f"Redis setup failed: {e}")
        return False

def seed_initial_data():
    """Seed initial data for production"""
    logger.info("Seeding initial data...")
    
    try:
        # Import and run seeding scripts
        from scripts.seed_question_bank import seed_question_bank
        
        # Seed question bank
        seed_question_bank()
        logger.info("Question bank seeded successfully")
        
        # Add more seeding as needed
        # from scripts.seed_admin_user import create_admin_user
        # create_admin_user()
        
        return True
        
    except Exception as e:
        logger.error(f"Data seeding failed: {e}")
        return False

def setup_celery():
    """Set up Celery configuration"""
    logger.info("Setting up Celery...")
    
    try:
        # Test Celery connection
        from app.tasks.celery_app import celery_app
        
        # Test task
        result = celery_app.send_task("app.tasks.celery_app.health_check")
        logger.info("Celery setup completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Celery setup failed: {e}")
        return False

def main():
    """Main setup function"""
    logger.info("Starting production database setup...")
    
    # Check environment
    if not settings.is_production:
        logger.warning("Not running in production environment!")
        response = input("Continue anyway? (y/N): ")
        if response.lower() != 'y':
            logger.info("Setup cancelled")
            return
    
    # Setup steps
    steps = [
        ("Database", setup_database),
        ("Redis Cache", setup_redis),
        ("Initial Data", seed_initial_data),
        ("Celery", setup_celery),
    ]
    
    success_count = 0
    
    for step_name, step_func in steps:
        logger.info(f"\n{'='*50}")
        logger.info(f"Step: {step_name}")
        logger.info(f"{'='*50}")
        
        try:
            if step_func():
                logger.info(f"✅ {step_name} setup completed successfully")
                success_count += 1
            else:
                logger.error(f"❌ {step_name} setup failed")
        except Exception as e:
            logger.error(f"❌ {step_name} setup failed with exception: {e}")
    
    # Summary
    logger.info(f"\n{'='*50}")
    logger.info("SETUP SUMMARY")
    logger.info(f"{'='*50}")
    logger.info(f"Completed: {success_count}/{len(steps)} steps")
    
    if success_count == len(steps):
        logger.info("🎉 All setup steps completed successfully!")
        logger.info("Production environment is ready!")
    else:
        logger.error("⚠️  Some setup steps failed. Please check the logs above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
