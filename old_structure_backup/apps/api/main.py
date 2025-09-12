from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import Base, engine, get_db
from models import Survey, Response, SurveyToken
from schemas import SurveyCreate, SurveyResponse, SurveyOut
from utils import generate_survey_token
from send_email import send_survey_email
from tasks import send_monthly_survey
from typing import List

app = FastAPI(title="Employee Survey Backend")

# Create tables
Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {"message": "Welcome to the Employee Survey Backend!"}

@app.post("/surveys", response_model=SurveyOut)
async def create_survey(survey: SurveyCreate, db: Session = Depends(get_db)):
    db_survey = Survey(title=survey.title, questions=survey.questions)
    db.add(db_survey)
    db.commit()
    db.refresh(db_survey)
    return db_survey

@app.post("/surveys/{survey_id}/respond")
async def submit_response(survey_id: int, response: SurveyResponse, db: Session = Depends(get_db)):
    # Verify survey exists
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    # Save anonymous response
    db_response = Response(survey_id=survey_id, answers=response.answers)
    db.add(db_response)
    db.commit()
    return {"message": "Response submitted successfully"}

@app.post("/surveys/{survey_id}/send")
async def send_survey(survey_id: int, to_email: str, db: Session = Depends(get_db)):
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    token = generate_survey_token(survey_id, db)
    send_survey_email(to_email, survey_id, token)
    return {"message": "Survey email sent"}

@app.post("/surveys/{survey_id}/send-monthly")
async def trigger_monthly_survey(survey_id: int, emails: List[str], db: Session = Depends(get_db)):
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    send_monthly_survey.delay(survey_id, emails)
    return {"message": "Monthly survey task queued"} 