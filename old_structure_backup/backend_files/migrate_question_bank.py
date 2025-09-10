#!/usr/bin/env python3
"""
Migration script to add question bank tables
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine, Base
from app.models.advanced import Metric, QuestionBank, AutoPilotPlan, AutoPilotSurvey

def migrate_question_bank():
    """Create question bank tables"""
    try:
        print("Creating question bank tables...")
        
        # Create tables
        Metric.__table__.create(engine, checkfirst=True)
        QuestionBank.__table__.create(engine, checkfirst=True)
        AutoPilotPlan.__table__.create(engine, checkfirst=True)
        AutoPilotSurvey.__table__.create(engine, checkfirst=True)
        
        print("✅ Question bank tables created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        raise

if __name__ == "__main__":
    migrate_question_bank()
