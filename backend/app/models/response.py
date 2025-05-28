from employee_survey_backend.app import db
from datetime import datetime

class Response(db.Model):
    __tablename__ = 'responses'

    id = db.Column(db.Integer, primary_key=True)
    survey_id = db.Column(db.Integer, db.ForeignKey('surveys.id'), nullable=False)
    respondent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    answers = db.relationship('Answer', backref='response', lazy=True, cascade='all, delete-orphan')

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

class Answer(db.Model):
    __tablename__ = 'answers'

    id = db.Column(db.Integer, primary_key=True)
    response_id = db.Column(db.Integer, db.ForeignKey('responses.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    value = db.Column(db.Text, nullable=False)  # Store answer as text, can be parsed based on question type

    def __repr__(self):
        return f'<Answer {self.id} for Question {self.question_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'response_id': self.response_id,
            'question_id': self.question_id,
            'value': self.value
        } 