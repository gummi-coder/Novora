import uuid
from datetime import datetime, timedelta
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class SurveyToken(Base):
    __tablename__ = "survey_tokens"
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    survey_id = Column(Integer, ForeignKey('surveys.id'), index=True)
    team_id = Column(Integer, ForeignKey('teams.id'), index=True)  # Team-based tokens
    employee_id = Column(Integer, ForeignKey('users.id'), nullable=True)  # Optional employee link
    used = Column(Boolean, default=False)  # Single-use tracking
    used_at = Column(DateTime, nullable=True)  # When token was used
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    survey = relationship("Survey")
    team = relationship("Team")
    employee = relationship("User")

def generate_survey_token(survey_id: int, team_id: int, employee_id: int = None, db = None) -> str:
    """Generate a single-use token for a specific team and optional employee"""
    token = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(days=7)  # Token expires in 7 days
    
    db_token = SurveyToken(
        token=token, 
        survey_id=survey_id, 
        team_id=team_id,
        employee_id=employee_id,
        expires_at=expires_at
    )
    db.add(db_token)
    db.commit()
    return token

def validate_survey_token(token: str, survey_id: int, team_id: int, db) -> bool:
    """Validate a survey token for single-use and team scope"""
    db_token = db.query(SurveyToken).filter(
        SurveyToken.token == token,
        SurveyToken.survey_id == survey_id,
        SurveyToken.team_id == team_id,
        SurveyToken.used == False,
        SurveyToken.expires_at > datetime.utcnow()
    ).first()
    
    return db_token is not None

def mark_token_used(token: str, db) -> bool:
    """Mark a token as used (single-use enforcement)"""
    db_token = db.query(SurveyToken).filter(SurveyToken.token == token).first()
    if db_token and not db_token.used:
        db_token.used = True
        db_token.used_at = datetime.utcnow()
        db.commit()
        return True
    return False

def expire_tokens_at_survey_close(survey_id: int, db) -> int:
    """Expire all tokens for a survey when it closes"""
    expired_count = db.query(SurveyToken).filter(
        SurveyToken.survey_id == survey_id,
        SurveyToken.used == False
    ).update({
        SurveyToken.expires_at: datetime.utcnow()
    })
    db.commit()
    return expired_count 