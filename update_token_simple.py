#!/usr/bin/env python3
"""
Simple script to update survey token in database
"""
import sqlite3
import random
import string

def update_survey_tokens():
    """Update survey tokens in the database"""
    # Connect to the database
    db_path = "/Users/gudmundurfridgeirsson/NovoraSurveys/Novora/backend/mvp_surveys.db"
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get all surveys with tokens
        cursor.execute("SELECT id, title, survey_token FROM surveys WHERE survey_token IS NOT NULL")
        surveys = cursor.fetchall()
        
        print(f"Found {len(surveys)} surveys with existing tokens")
        
        for survey_id, title, old_token in surveys:
            # Generate new token
            random_string = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
            new_token = f"mvp-user-{survey_id}_{random_string}"
            
            # Update the survey with new token
            cursor.execute("UPDATE surveys SET survey_token = ? WHERE id = ?", (new_token, survey_id))
            
            # Generate the new survey link
            survey_link = f"https://novora-static.vercel.app/survey/{new_token}"
            
            print(f"Survey {survey_id} ({title}):")
            print(f"  Old token: {old_token}")
            print(f"  New token: {new_token}")
            print(f"  New link: {survey_link}")
            print()
        
        # Commit changes
        conn.commit()
        print("Database updated successfully!")
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("Updating survey tokens with correct Vercel URLs...")
    print("Frontend URL: https://novora-static.vercel.app")
    print()
    update_survey_tokens()
    print("Done!")
