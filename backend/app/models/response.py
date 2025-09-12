from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Response(Base):
    __tablename__ = 'responses'

    id = Column(Integer, primary_key=True)
    survey_id = Column(Integer, ForeignKey('surveys.id'), nullable=False)
    respondent_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    answers = relationship('Answer', back_populates='response', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Response {self.id} for Survey {self.survey_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'survey_id': self.survey_id,
            'respondent_id': self.respondent_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'answers': [answer.to_dict() for answer in self.answers]
        }

class Answer(Base):
    __tablename__ = 'answers'

    id = Column(Integer, primary_key=True)
    response_id = Column(Integer, ForeignKey('responses.id'), nullable=False)
    question_id = Column(Integer, ForeignKey('questions.id'), nullable=False)
    value = Column(Text, nullable=False)  # Store answer as text, can be parsed based on question type

    # Relationships
    response = relationship('Response', back_populates='answers')

    def __repr__(self):
        return f'<Answer {self.id} for Question {self.question_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'response_id': self.response_id,
            'question_id': self.question_id,
            'value': self.value
        }