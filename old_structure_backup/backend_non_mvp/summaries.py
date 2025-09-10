from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, Float, Numeric, Date
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import uuid

class ParticipationSummary(Base):
    """Pre-aggregated participation data for fast dashboard loads"""
    __tablename__ = "participation_summary"
    
    # Composite primary key
    survey_id = Column(UUID(as_uuid=True), ForeignKey('surveys.id'), primary_key=True)
    team_id = Column(UUID(as_uuid=True), ForeignKey('teams.id'), primary_key=True)
    
    # Additional fields
    org_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    respondents = Column(Integer, nullable=False)
    team_size = Column(Integer, nullable=False)
    participation_pct = Column(Numeric(5, 2), nullable=False)
    delta_pct = Column(Numeric(5, 2), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    survey = relationship("Survey")
    team = relationship("Team")
    org = relationship("User")

class DriverSummary(Base):
    """Pre-aggregated driver performance data"""
    __tablename__ = "driver_summary"
    
    # Composite primary key
    survey_id = Column(UUID(as_uuid=True), ForeignKey('surveys.id'), primary_key=True)
    team_id = Column(UUID(as_uuid=True), ForeignKey('teams.id'), primary_key=True)
    driver_id = Column(UUID(as_uuid=True), ForeignKey('drivers.id'), primary_key=True)
    
    # Additional fields
    org_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    avg_score = Column(Numeric(4, 2), nullable=False)
    detractors_pct = Column(Numeric(5, 2), nullable=False)
    passives_pct = Column(Numeric(5, 2), nullable=False)
    promoters_pct = Column(Numeric(5, 2), nullable=False)
    delta_vs_prev = Column(Numeric(4, 2), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    survey = relationship("Survey")
    team = relationship("Team")
    driver = relationship("Driver")
    org = relationship("User")

class SentimentSummary(Base):
    """Pre-aggregated sentiment data"""
    __tablename__ = "sentiment_summary"
    
    # Composite primary key
    survey_id = Column(UUID(as_uuid=True), ForeignKey('surveys.id'), primary_key=True)
    team_id = Column(UUID(as_uuid=True), ForeignKey('teams.id'), primary_key=True)
    
    # Additional fields
    org_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    pos_pct = Column(Numeric(5, 2), nullable=False)
    neu_pct = Column(Numeric(5, 2), nullable=False)
    neg_pct = Column(Numeric(5, 2), nullable=False)
    delta_vs_prev = Column(Numeric(5, 2), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    survey = relationship("Survey")
    team = relationship("Team")
    org = relationship("User")

class OrgDriverTrends(Base):
    """Organization-wide driver trends over time"""
    __tablename__ = "org_driver_trends"
    
    # Composite primary key
    team_id = Column(UUID(as_uuid=True), ForeignKey('teams.id'), primary_key=True)
    driver_id = Column(UUID(as_uuid=True), ForeignKey('drivers.id'), primary_key=True)
    period_month = Column(Date, primary_key=True)
    
    # Additional fields
    org_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    avg_score = Column(Numeric(4, 2), nullable=False)
    
    # Relationships
    team = relationship("Team")
    driver = relationship("Driver")
    org = relationship("User")

class ReportsCache(Base):
    """Cached report data for quick PDF generation"""
    __tablename__ = "reports_cache"
    
    # Composite primary key
    org_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True)
    scope = Column(String(50), primary_key=True)  # 'org' or 'team:{id}'
    period_start = Column(Date, primary_key=True)
    period_end = Column(Date, primary_key=True)
    
    # Additional fields
    payload_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    org = relationship("User")

class CommentNLP(Base):
    """Comment NLP processing results with PII masking"""
    __tablename__ = "comment_nlp"
    
    comment_id = Column(UUID(as_uuid=True), primary_key=True)
    sentiment = Column(String(1), nullable=False)  # '+', '0', '-'
    themes = Column(JSON, nullable=True)  # ["workload","recognition"]
    pii_masked = Column(Boolean, nullable=False, default=True)
    processed_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    comment = relationship("AnonymousComment", foreign_keys=[comment_id])
