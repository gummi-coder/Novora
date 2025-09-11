#!/usr/bin/env python3
"""
Script to regenerate survey token with correct Vercel URL
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))

from app.core.database import SessionLocal
from app.models.base import Survey
from app.core.config import settings
import secrets
import string

def regenerate_survey_tokens():
    """Regenerate all survey tokens to use the correct Vercel URL"""
    db = SessionLocal()
    try:
        # Get all surveys that have tokens
        surveys = db.query(Survey).filter(Survey.token.isnot(None)).all()
        
        print(f"Found {len(surveys)} surveys with existing tokens")
        
        for survey in surveys:
            # Generate new token
            random_string = ''.join(secrets.choices(string.ascii_letters + string.digits, k=12))
            new_token = f"{survey.creator_id}_{survey.id}_{random_string}"
            
            # Update the survey with new token
            survey.token = new_token
            db.commit()
            
            # Generate the new survey link
            survey_link = f"{settings.FRONTEND_URL}/survey/{new_token}"
            
            print(f"Survey {survey.id} ({survey.title}):")
            print(f"  Old token: {survey.token}")
            print(f"  New token: {new_token}")
            print(f"  New link: {survey_link}")
            print()
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Regenerating survey tokens with correct Vercel URLs...")
    print(f"Frontend URL: {settings.FRONTEND_URL}")
    print()
    regenerate_survey_tokens()
    print("Done!")
