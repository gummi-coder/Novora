"""
Advanced database models for enterprise features
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, Float, Index
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import Survey, Team

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

# Team class moved to base.py to avoid circular imports

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
    org_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String(100), nullable=False)
    key_hash = Column(String(256), nullable=False)  # Hashed API key
    scopes = Column(JSON, default=list)  # List of permissions/scopes
    last_used = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    org = relationship("User", foreign_keys=[org_id])

class Webhook(Base):
    __tablename__ = "webhooks"
    id = Column(Integer, primary_key=True)
    org_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String(100), nullable=False)
    url = Column(String(500), nullable=False)
    events = Column(JSON, default=list)  # List of events to trigger webhook
    secret = Column(String(100))  # Webhook secret for verification
    is_active = Column(Boolean, default=True)
    success_count = Column(Integer, default=0)
    failure_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_triggered = Column(DateTime)
    
    # Relationships
    org = relationship("User", foreign_keys=[org_id])

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
    
    # eNPS-specific fields
    enps_score = Column(Integer, nullable=True)  # eNPS score from -100 to +100
    enps_promoter_pct = Column(Float, nullable=True)  # Percentage of promoters
    enps_passive_pct = Column(Float, nullable=True)  # Percentage of passives
    enps_detractor_pct = Column(Float, nullable=True)  # Percentage of detractors
    enps_response_count = Column(Integer, nullable=True)  # Number of eNPS responses
    
    # Relationships
    team = relationship("Team")
    survey = relationship("Survey")

class Metric(Base):
    __tablename__ = "metrics"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    category = Column(String(50), nullable=False)  # job_satisfaction, enps, manager_relationship, etc.
    is_core = Column(Boolean, default=False)  # Always included in auto-pilot plans
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    questions = relationship("QuestionBank", back_populates="metric")

class QuestionBank(Base):
    __tablename__ = "question_bank"
    id = Column(Integer, primary_key=True)
    metric_id = Column(Integer, ForeignKey('metrics.id'), nullable=False)
    question_text_en = Column(Text, nullable=False)  # English version
    question_text_es = Column(Text)  # Spanish version
    question_text_is = Column(Text)  # Icelandic version
    question_text_de = Column(Text)  # German version
    question_text_fr = Column(Text)  # French version
    active = Column(Boolean, default=True)  # Can be retired without deletion
    variation_order = Column(Integer, default=0)  # For auto-rotation logic
    sensitive = Column(Boolean, default=False)  # For skip prompts (mental health, manager-related)
    reverse_scored = Column(Boolean, default=False)  # For negatively worded questions
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    metric = relationship("Metric", back_populates="questions")
    
    def get_question_text(self, language='en'):
        """Get question text in specified language, fallback to English"""
        text_field = f"question_text_{language}"
        if hasattr(self, text_field) and getattr(self, text_field):
            return getattr(self, text_field)
        return self.question_text_en

class AutoPilotPlan(Base):
    __tablename__ = "auto_pilot_plans"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    plan_id = Column(String(50), nullable=False)  # quarterly, half_year, annual
    name = Column(String(100), nullable=False)
    start_date = Column(DateTime, nullable=False)
    status = Column(String(20), default='active')  # active, paused, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company = relationship("User")
    surveys = relationship("AutoPilotSurvey", back_populates="plan", cascade="all, delete-orphan")

class AutoPilotSurvey(Base):
    __tablename__ = "auto_pilot_surveys"
    id = Column(Integer, primary_key=True)
    plan_id = Column(Integer, ForeignKey('auto_pilot_plans.id'), nullable=False)
    survey_id = Column(Integer, ForeignKey('surveys.id'), nullable=True)  # Created survey
    month = Column(Integer, nullable=False)  # Which month in the sequence
    template = Column(String(50), nullable=False)  # monthly_pulse, quarterly_deep_dive, etc.
    name = Column(String(100), nullable=False)
    description = Column(Text)
    send_date = Column(DateTime, nullable=False)
    first_reminder = Column(DateTime, nullable=False)
    second_reminder = Column(DateTime, nullable=False)
    close_date = Column(DateTime, nullable=False)
    status = Column(String(20), default='scheduled')  # scheduled, sent, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    plan = relationship("AutoPilotPlan", back_populates="surveys")
    survey = relationship("Survey") 

class SurveyResponse(Base):
    """
    Stores individual survey responses with driver mapping for distribution analysis
    """
    __tablename__ = "survey_responses"
    id = Column(Integer, primary_key=True)
    employee_id = Column(String(100), nullable=False)  # anonymized hash
    team_id = Column(Integer, ForeignKey('teams.id'), nullable=False)
    survey_id = Column(Integer, ForeignKey('surveys.id'), nullable=False)
    question_id = Column(Integer, ForeignKey('questions.id'), nullable=False)
    driver = Column(String(100), nullable=False)  # maps question → driver (e.g., "Collaboration")
    score = Column(Integer, nullable=False)  # 0-10 scale
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    team = relationship("Team")
    survey = relationship("Survey")
    question = relationship("Question")
    
    def to_dict(self):
        return {
            'id': self.id,
            'employee_id': self.employee_id,
            'team_id': self.team_id,
            'survey_id': self.survey_id,
            'question_id': self.question_id,
            'driver': self.driver,
            'score': self.score,
            'timestamp': self.timestamp.isoformat()
        }

class SurveyComment(Base):
    """
    Stores open-text comments with driver context for filtering
    """
    __tablename__ = "survey_comments"
    id = Column(Integer, primary_key=True)
    comment_id = Column(String(100), unique=True, nullable=False)  # e.g., "cmt_345"
    team_id = Column(Integer, ForeignKey('teams.id'), nullable=False)
    survey_id = Column(Integer, ForeignKey('surveys.id'), nullable=False)
    driver = Column(String(100), nullable=False)  # driver context for filtering
    sentiment = Column(String(20), nullable=False)  # positive, neutral, negative
    text = Column(Text, nullable=False)
    employee_id = Column(String(100), nullable=False)  # anonymized hash
    is_flagged = Column(Boolean, default=False)
    is_pinned = Column(Boolean, default=False)
    tags = Column(JSON, default=list)  # auto-tagged themes
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    team = relationship("Team")
    survey = relationship("Survey")
    
    def to_dict(self):
        return {
            'id': self.id,
            'comment_id': self.comment_id,
            'team_id': self.team_id,
            'survey_id': self.survey_id,
            'driver': self.driver,
            'sentiment': self.sentiment,
            'text': self.text,
            'employee_id': self.employee_id,
            'is_flagged': self.is_flagged,
            'is_pinned': self.is_pinned,
            'tags': self.tags,
            'created_at': self.created_at.isoformat()
        }

class Driver(Base):
    """
    Mapping table for question_id → driver name
    """
    __tablename__ = "drivers"
    id = Column(Integer, primary_key=True)
    question_id = Column(Integer, ForeignKey('questions.id'), nullable=False)
    driver_name = Column(String(100), nullable=False)  # e.g., "Collaboration", "Recognition"
    description = Column(Text)
    category = Column(String(50))  # e.g., "Team", "Leadership", "Work Environment"
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    question = relationship("Question")
    
    def to_dict(self):
        return {
            'id': self.id,
            'question_id': self.question_id,
            'driver_name': self.driver_name,
            'description': self.description,
            'category': self.category,
            'created_at': self.created_at.isoformat()
        }

class MetricsSummary(Base):
    """
    Cached results per team/driver/survey for fast dashboard loads
    """
    __tablename__ = "metrics_summary"
    id = Column(Integer, primary_key=True)
    team_id = Column(Integer, ForeignKey('teams.id'), nullable=False)
    driver = Column(String(100), nullable=False)
    survey_id = Column(Integer, ForeignKey('surveys.id'), nullable=False)
    avg_score = Column(Float, nullable=False)
    change = Column(Float, default=0.0)  # vs previous survey
    distribution = Column(JSON, nullable=False)  # {"detractors": 40, "passives": 30, "promoters": 30}
    response_count = Column(Integer, nullable=False)
    participation_rate = Column(Float, nullable=False)
    last_calculated = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    team = relationship("Team")
    survey = relationship("Survey")
    
    def to_dict(self):
        return {
            'id': self.id,
            'team_id': self.team_id,
            'driver': self.driver,
            'survey_id': self.survey_id,
            'avg_score': self.avg_score,
            'change': self.change,
            'distribution': self.distribution,
            'response_count': self.response_count,
            'participation_rate': self.participation_rate,
            'last_calculated': self.last_calculated.isoformat()
        } 

class Integration(Base):
    __tablename__ = "integrations"
    id = Column(Integer, primary_key=True)
    org_id = Column(Integer, nullable=False, index=True)
    type = Column(String(50), nullable=False)  # slack, teams, zoom, sso, email
    status = Column(String(20), default='disconnected')  # connected, disconnected, pending
    config_json = Column(JSON)  # integration-specific configuration
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    org = relationship("User", foreign_keys=[org_id]) 

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True)
    user_id = Column(String(36), nullable=True)  # Can be null for anonymous actions
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(36), nullable=True)
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Index for efficient querying
    __table_args__ = (
        Index('idx_audit_user_timestamp', 'user_id', 'timestamp'),
        Index('idx_audit_resource', 'resource_type', 'resource_id'),
        Index('idx_audit_action', 'action'),
    ) 