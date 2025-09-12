"""
Dependencies for FastAPI application
"""
from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_db

# Re-export get_db for convenience
__all__ = ["get_db"]
