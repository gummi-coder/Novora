"""
Audit Logging System for Tracking Important Actions
"""
from sqlalchemy import Column, String, DateTime, Text, JSON, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from datetime import datetime
import uuid

from app.models.base import Base

class AuditLog(Base):
    """Audit log for tracking important system actions"""
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    user_id = Column(UUID(as_uuid=True), nullable=True)  # Null for anonymous actions
    org_id = Column(UUID(as_uuid=True), nullable=False)
    action_type = Column(String(50), nullable=False)  # e.g., 'alert_acknowledged', 'settings_changed'
    resource_type = Column(String(50), nullable=False)  # e.g., 'alert', 'survey', 'user'
    resource_id = Column(String(100), nullable=True)  # ID of the affected resource
    description = Column(Text, nullable=False)
    details = Column(JSON, nullable=True)  # Additional structured data
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    user_agent = Column(Text, nullable=True)
    success = Column(Boolean, nullable=False, default=True)
    error_message = Column(Text, nullable=True)  # Error details if action failed

class AlertAuditLog(Base):
    """Specialized audit log for alert-related actions"""
    __tablename__ = "alert_audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    org_id = Column(UUID(as_uuid=True), nullable=False)
    alert_id = Column(UUID(as_uuid=True), nullable=False)
    action = Column(String(50), nullable=False)  # 'acknowledged', 'resolved', 'escalated'
    previous_status = Column(String(20), nullable=True)
    new_status = Column(String(20), nullable=False)
    notes = Column(Text, nullable=True)
    resolution_time = Column(Integer, nullable=True)  # Minutes from creation to resolution

class SettingsAuditLog(Base):
    """Specialized audit log for settings changes"""
    __tablename__ = "settings_audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    org_id = Column(UUID(as_uuid=True), nullable=False)
    setting_category = Column(String(50), nullable=False)  # 'privacy', 'alerts', 'notifications'
    setting_name = Column(String(100), nullable=False)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=False)
    reason = Column(Text, nullable=True)  # Why the change was made

class TokenAuditLog(Base):
    """Specialized audit log for token-related actions"""
    __tablename__ = "token_audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    survey_id = Column(UUID(as_uuid=True), nullable=False)
    token_hash = Column(String(64), nullable=False)  # SHA256 hash of token for privacy
    action = Column(String(50), nullable=False)  # 'generated', 'used', 'expired', 'failed_attempt'
    device_fingerprint = Column(String(64), nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    failure_reason = Column(String(100), nullable=True)
    team_id = Column(UUID(as_uuid=True), nullable=True)
