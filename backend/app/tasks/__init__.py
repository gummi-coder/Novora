from celery_config import app
from send_email import send_survey_email
from utils import generate_survey_token
from sqlalchemy.orm import Session
from database import SessionLocal

@app.task
def send_monthly_survey(survey_id: int, employee_emails: list):
    db = SessionLocal()
    try:
        for email in employee_emails:
            token = generate_survey_token(survey_id, db)
            send_survey_email(email, survey_id, token)
    finally:
        db.close() 