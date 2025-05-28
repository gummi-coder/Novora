import uuid
from datetime import datetime, timedelta
from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base

class SurveyToken(Base):
    __tablename__ = "survey_tokens"
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    survey_id = Column(Integer, index=True)
    expires_at = Column(DateTime)

def generate_survey_token(survey_id: int, db) -> str:
    token = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(days=7)  # Token expires in 7 days
    db_token = SurveyToken(token=token, survey_id=survey_id, expires_at=expires_at)
    db.add(db_token)
    db.commit()
    return token 