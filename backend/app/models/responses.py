from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import uuid

class NumericResponse(Base):
    """Numeric survey responses (0-10 scores)"""
    __tablename__ = "numeric_responses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    survey_id = Column(UUID(as_uuid=True), ForeignKey('surveys.id'), nullable=False)
    team_id = Column(UUID(as_uuid=True), ForeignKey('teams.id'), nullable=False)
    driver_id = Column(UUID(as_uuid=True), ForeignKey('drivers.id'), nullable=False)
    score = Column(Integer, nullable=False)  # 0-10 score
    ts = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    survey = relationship("Survey")
    team = relationship("Team")
    driver = relationship("Driver")

class Comment(Base):
    """Survey comments with team context"""
    __tablename__ = "comments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    survey_id = Column(UUID(as_uuid=True), ForeignKey('surveys.id'), nullable=False)
    team_id = Column(UUID(as_uuid=True), ForeignKey('teams.id'), nullable=False)
    driver_id = Column(UUID(as_uuid=True), ForeignKey('drivers.id'), nullable=True)
    text = Column(Text, nullable=False)
    ts = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    survey = relationship("Survey")
    team = relationship("Team")
    driver = relationship("Driver")
