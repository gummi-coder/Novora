"""
Advanced database models for enterprise features
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    level = Column(Integer, default=1)
    parent_id = Column(Integer, ForeignKey('departments.id'), nullable=True)
    company_id = Column(Integer, ForeignKey('users.id'), nullable=False)  # Company owner
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    parent = relationship("Department", remote_side=[id], backref="children")
    company = relationship("User")
    teams = relationship("Team", back_populates="department")
    user_departments = relationship("UserDepartment", back_populates="department")

class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    department_id = Column(Integer, ForeignKey('departments.id'), nullable=False)
    team_lead_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    department = relationship("Department", back_populates="teams")
    team_lead = relationship("User")
    user_teams = relationship("UserTeam", back_populates="team")
    comments = relationship("AnonymousComment", back_populates="team")

class UserDepartment(Base):
    __tablename__ = "user_departments"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    department_id = Column(Integer, ForeignKey('departments.id'), nullable=False)
    role = Column(String(50), default='member')  # member, manager, admin
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    department = relationship("Department", back_populates="user_departments")

class UserTeam(Base):
    __tablename__ = "user_teams"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    team_id = Column(Integer, ForeignKey('teams.id'), nullable=False)
    role = Column(String(50), default='member')  # member, lead
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    team = relationship("Team", back_populates="user_teams")

class AnonymousComment(Base):
    __tablename__ = "anonymous_comments"
    id = Column(Integer, primary_key=True)
    survey_id = Column(Integer, ForeignKey('surveys.id'), nullable=False)
    team_id = Column(Integer, ForeignKey('teams.id'), nullable=True)
    text = Column(Text, nullable=False)
    sentiment = Column(String(20), default='neutral')  # positive, neutral, negative
    is_pinned = Column(Boolean, default=False)
    is_flagged = Column(Boolean, default=False)
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    survey = relationship("Survey")
    team = relationship("Team", back_populates="comments")

class CommentAction(Base):
    __tablename__ = "comment_actions"
    id = Column(Integer, primary_key=True)
    comment_id = Column(Integer, ForeignKey('anonymous_comments.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    action_type = Column(String(20), nullable=False)  # pin, flag, hide
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    comment = relationship("AnonymousComment")
    user = relationship("User")

class SurveyBranching(Base):
    __tablename__ = "survey_branching"
    id = Column(Integer, primary_key=True)
    survey_id = Column(Integer, ForeignKey('surveys.id'), nullable=False)
    question_id = Column(Integer, ForeignKey('questions.id'), nullable=False)
    condition = Column(Text, nullable=False)  # JSON condition
    next_question_id = Column(Integer, ForeignKey('questions.id'), nullable=True)
    skip_question_ids = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    survey = relationship("Survey")
    question = relationship("Question", foreign_keys=[question_id])
    next_question = relationship("Question", foreign_keys=[next_question_id])

class Permission(Base):
    __tablename__ = "permissions"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    scope = Column(String(20), default='global')  # global, department, team, individual
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    role_permissions = relationship("RolePermission", back_populates="permission")

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    scope = Column(String(20), default='global')  # global, department, team, individual
    company_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    company = relationship("User")
    role_permissions = relationship("RolePermission", back_populates="role")
    user_roles = relationship("UserRole", back_populates="role")

class RolePermission(Base):
    __tablename__ = "role_permissions"
    id = Column(Integer, primary_key=True)
    role_id = Column(Integer, ForeignKey('roles.id'), nullable=False)
    permission_id = Column(Integer, ForeignKey('permissions.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    role = relationship("Role", back_populates="role_permissions")
    permission = relationship("Permission", back_populates="role_permissions")

class UserRole(Base):
    __tablename__ = "user_roles"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    role_id = Column(Integer, ForeignKey('roles.id'), nullable=False)
    scope_id = Column(Integer, nullable=True)  # department_id or team_id
    scope_type = Column(String(20), nullable=True)  # department, team
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    role = relationship("Role", back_populates="user_roles")

class BrandingConfig(Base):
    __tablename__ = "branding_configs"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    logo_url = Column(String(500))
    primary_color = Column(String(7), default='#3b82f6')  # Hex color
    secondary_color = Column(String(7), default='#1e40af')
    email_domain = Column(String(100))
    survey_theme = Column(String(20), default='light')  # light, dark, custom
    custom_css = Column(Text)
    company_name = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company = relationship("User")

class SSOConfig(Base):
    __tablename__ = "sso_configs"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    provider = Column(String(50), nullable=False)  # google, azure, okta, saml
    enabled = Column(Boolean, default=False)
    domain = Column(String(100))
    metadata_url = Column(String(500))
    entity_id = Column(String(500))
    client_id = Column(String(200))
    client_secret = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company = relationship("User")

class APIKey(Base):
    __tablename__ = "api_keys"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String(100), nullable=False)
    key_hash = Column(String(256), nullable=False)  # Hashed API key
    permissions = Column(JSON, default=list)
    last_used = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    company = relationship("User")

class Webhook(Base):
    __tablename__ = "webhooks"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String(100), nullable=False)
    url = Column(String(500), nullable=False)
    events = Column(JSON, default=list)  # List of events to trigger webhook
    secret = Column(String(100))  # Webhook secret for verification
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_triggered = Column(DateTime)
    
    # Relationships
    company = relationship("User")

class SurveySchedule(Base):
    __tablename__ = "survey_schedules"
    id = Column(Integer, primary_key=True)
    survey_id = Column(Integer, ForeignKey('surveys.id'), nullable=False)
    delivery_date = Column(DateTime, nullable=False)
    reminder_enabled = Column(Boolean, default=False)
    reminder_days = Column(Integer, default=3)
    reminder_frequency = Column(String(20), default='once')  # once, daily, weekly
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default='scheduled')  # scheduled, sent, cancelled
    
    # Relationships
    survey = relationship("Survey")
    creator = relationship("User")

class DashboardAlert(Base):
    __tablename__ = "dashboard_alerts"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    type = Column(String(50), nullable=False)  # mood_drop, engagement, sales, etc.
    message = Column(Text, nullable=False)
    severity = Column(String(20), default='warning')  # info, warning, critical
    threshold = Column(Float, nullable=True)
    current_value = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    company = relationship("User")

class TeamAnalytics(Base):
    __tablename__ = "team_analytics"
    id = Column(Integer, primary_key=True)
    team_id = Column(Integer, ForeignKey('teams.id'), nullable=False)
    survey_id = Column(Integer, ForeignKey('surveys.id'), nullable=False)
    avg_score = Column(Float, nullable=True)
    score_change = Column(Float, default=0.0)
    response_count = Column(Integer, default=0)
    sentiment_score = Column(Float, nullable=True)
    calculated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    team = relationship("Team")
    survey = relationship("Survey") 