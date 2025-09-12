from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    role = Column(String(20), nullable=False, default='manager')  # admin, manager
    company_name = Column(String(120))
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    is_active = Column(Boolean, default=True)
    is_email_verified = Column(Boolean, default=False)
    failed_login_attempts = Column(Integer, default=0)
    last_failed_login = Column(DateTime)
    
    # Relationships
    surveys = relationship("Survey", back_populates="creator")
    templates = relationship("SurveyTemplate", back_populates="creator")
    responses = relationship("Response", back_populates="user")
    verification_tokens = relationship("EmailVerificationToken", back_populates="user", cascade="all, delete-orphan")
    reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")

class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    token = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="verification_tokens")

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    token = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="reset_tokens")

class UserSession(Base):
    __tablename__ = "user_sessions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    refresh_token = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False)
    ip_address = Column(String(45))  # IPv6 addresses can be up to 45 characters
    user_agent = Column(String(200))
    
    # Relationships
    user = relationship("User", back_populates="sessions")

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

class Survey(Base):
    __tablename__ = "surveys"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    creator_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    status = Column(String(20), default='draft')  # draft, active, closed
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    is_anonymous = Column(Boolean, default=True)
    allow_comments = Column(Boolean, default=False)
    reminder_frequency = Column(String(20))  # daily, weekly, monthly
    category = Column(String(50), default='general')
    company_size = Column(Integer, default=10)  # MVP: company size for submission limit
    max_submissions = Column(Integer, default=10)  # MVP: max submissions allowed
    survey_token = Column(String(255), nullable=True)  # Survey token for sharing
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = relationship("User", back_populates="surveys")
    questions = relationship("Question", back_populates="survey", cascade="all, delete-orphan")
    responses = relationship("Response", back_populates="survey", cascade="all, delete-orphan")
    attachments = relationship("FileAttachment", back_populates="survey", cascade="all, delete-orphan")

    def to_dict(self):
        from app.core.config import settings
        
        survey_link = None
        if self.survey_token:
            survey_link = f"{settings.FRONTEND_URL}/survey/{self.survey_token}"
        
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'creator_id': self.creator_id,
            'status': self.status,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'is_anonymous': self.is_anonymous,
            'allow_comments': self.allow_comments,
            'reminder_frequency': self.reminder_frequency,
            'category': self.category,
            'token': self.survey_token,
            'survey_link': survey_link,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'questions': [q.to_dict() for q in self.questions],
            'response_count': len(self.responses),
            'attachments': [a.to_dict() for a in self.attachments]
        }

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True)
    survey_id = Column(Integer, ForeignKey('surveys.id'), nullable=False)
    text = Column(Text, nullable=False)
    type = Column(String(20), nullable=False)  # text, multiple_choice, rating, etc.
    required = Column(Boolean, default=False)
    order = Column(Integer, default=0)
    options = Column(JSON)  # For multiple choice questions
    allow_comments = Column(Boolean, default=False)
    
    # Relationships
    survey = relationship("Survey", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'survey_id': self.survey_id,
            'text': self.text,
            'type': self.type,
            'required': self.required,
            'order': self.order,
            'options': self.options,
            'allow_comments': self.allow_comments
        }

class SurveyTemplate(Base):
    __tablename__ = "survey_templates"
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    creator_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    questions = Column(JSON, nullable=False)  # Store questions as JSON
    category = Column(String(50), default='general')
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = relationship("User", back_populates="templates")

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'creator_id': self.creator_id,
            'questions': self.questions,
            'category': self.category,
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Response(Base):
    __tablename__ = "responses"
    id = Column(Integer, primary_key=True)
    survey_id = Column(Integer, ForeignKey('surveys.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)  # Nullable for anonymous responses
    submitted_at = Column(DateTime, default=datetime.utcnow)
    completed = Column(Boolean, default=True)
    
    # Relationships
    survey = relationship("Survey", back_populates="responses")
    user = relationship("User", back_populates="responses")
    answers = relationship("Answer", back_populates="response", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'survey_id': self.survey_id,
            'user_id': self.user_id,
            'submitted_at': self.submitted_at.isoformat(),
            'completed': self.completed,
            'answers': [a.to_dict() for a in self.answers]
        }

class Answer(Base):
    __tablename__ = "answers"
    id = Column(Integer, primary_key=True)
    response_id = Column(Integer, ForeignKey('responses.id'), nullable=False)
    question_id = Column(Integer, ForeignKey('questions.id'), nullable=False)
    value = Column(Text, nullable=False)
    comment = Column(Text)
    
    # Relationships
    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")

    def to_dict(self):
        return {
            'id': self.id,
            'response_id': self.response_id,
            'question_id': self.question_id,
            'value': self.value,
            'comment': self.comment
        }

class FileAttachment(Base):
    __tablename__ = "file_attachments"
    id = Column(Integer, primary_key=True)
    survey_id = Column(Integer, ForeignKey('surveys.id'), nullable=False)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)  # Size in bytes
    mime_type = Column(String(100), nullable=False)
    uploaded_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    description = Column(Text)
    
    # Relationships
    survey = relationship("Survey", back_populates="attachments")
    user = relationship("User")

    def to_dict(self):
        return {
            'id': self.id,
            'survey_id': self.survey_id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'uploaded_by': self.uploaded_by,
            'uploaded_at': self.uploaded_at.isoformat(),
            'description': self.description
        }

class SurveyToken(Base):
    __tablename__ = "survey_tokens"
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True)
    token = Column(String(255), unique=True, nullable=False, index=True)
    survey_id = Column(String(50), nullable=False, index=True)
    used = Column(Boolean, default=False)
    used_at = Column(DateTime)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Enhanced tracking fields
    device_fingerprint = Column(String(255), index=True)
    last_attempt_at = Column(DateTime)
    attempt_failed = Column(Boolean, default=False)
    ip_address = Column(String(45))  # IPv6 compatible
    user_agent = Column(Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'token': self.token,
            'survey_id': self.survey_id,
            'used': self.used,
            'used_at': self.used_at.isoformat() if self.used_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat(),
            'device_fingerprint': self.device_fingerprint,
            'last_attempt_at': self.last_attempt_at.isoformat() if self.last_attempt_at else None,
            'attempt_failed': self.attempt_failed,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent
        }

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) 