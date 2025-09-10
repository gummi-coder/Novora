"""
Simplified Settings Models for MVP
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from app.core.database import Base

class OrgSettings(Base):
    __tablename__ = 'org_settings'

    id = Column(Integer, primary_key=True)
    org_id = Column(String(255), nullable=False)
    min_n_threshold = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<OrgSettings {self.org_id}>'
