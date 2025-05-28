from employee_survey_backend.app import db
from datetime import datetime

class Survey(db.Model):
    __tablename__ = 'surveys'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='draft')  # draft, active, closed
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)

    # Relationships
    questions = db.relationship('Question', backref='survey', lazy=True, cascade='all, delete-orphan')
    responses = db.relationship('Response', backref='survey', lazy=True)

    def __repr__(self):
        return f'<Survey {self.title}>'

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'creator_id': self.creator_id,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'questions': [question.to_dict() for question in self.questions]
        }

class Question(db.Model):
    __tablename__ = 'questions'

    id = db.Column(db.Integer, primary_key=True)
    survey_id = db.Column(db.Integer, db.ForeignKey('surveys.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(20), nullable=False)  # text, multiple_choice, rating
    required = db.Column(db.Boolean, default=False)
    order = db.Column(db.Integer, nullable=False)
    options = db.Column(db.JSON)  # For multiple choice questions

    def __repr__(self):
        return f'<Question {self.text[:50]}...>'

    def to_dict(self):
        return {
            'id': self.id,
            'survey_id': self.survey_id,
            'text': self.text,
            'type': self.type,
            'required': self.required,
            'order': self.order,
            'options': self.options
        } 