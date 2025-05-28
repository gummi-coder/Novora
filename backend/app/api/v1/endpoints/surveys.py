from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Survey, User, SurveyTemplate, Question
from app.core.database import db
from datetime import datetime
from sqlalchemy import and_, or_

surveys_bp = Blueprint('surveys', __name__)

@surveys_bp.route('', methods=['POST'])
@jwt_required()
def create_survey():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    data = request.get_json()

    # Check survey limits based on user's plan
    if user.role == 'core':
        active_surveys = Survey.query.filter_by(creator_id=current_user_id, status='active').count()
        if active_surveys >= 3:  # Core plan limit
            return jsonify({'message': 'Survey limit reached for Core plan'}), 403
    elif user.role == 'pro':
        active_surveys = Survey.query.filter_by(creator_id=current_user_id, status='active').count()
        if active_surveys >= 10:  # Pro plan limit
            return jsonify({'message': 'Survey limit reached for Pro plan'}), 403

    # Validate required fields
    if not data.get('title'):
        return jsonify({'message': 'Title is required'}), 400

    # Create survey
    survey = Survey(
        title=data['title'],
        description=data.get('description'),
        creator_id=current_user_id,
        status=data.get('status', 'draft'),
        start_date=datetime.fromisoformat(data['start_date']) if data.get('start_date') else None,
        end_date=datetime.fromisoformat(data['end_date']) if data.get('end_date') else None,
        is_anonymous=data.get('is_anonymous', True),
        allow_comments=data.get('allow_comments', False),
        reminder_frequency=data.get('reminder_frequency'),
        category=data.get('category', 'general')
    )

    # Add questions if provided
    if 'questions' in data:
        for q_data in data['questions']:
            question = Question(
                text=q_data['text'],
                type=q_data['type'],
                required=q_data.get('required', False),
                order=q_data.get('order', 0),
                options=q_data.get('options'),
                allow_comments=q_data.get('allow_comments', False)
            )
            survey.questions.append(question)

    # If template_id is provided, copy questions from template
    if 'template_id' in data:
        template = SurveyTemplate.query.get(data['template_id'])
        if template:
            if not template.is_public and template.creator_id != current_user_id and user.role != 'admin':
                return jsonify({'message': 'Unauthorized to use this template'}), 403
            for q_data in template.questions:
                question = Question(
                    text=q_data['text'],
                    type=q_data['type'],
                    required=q_data.get('required', False),
                    order=q_data.get('order', 0),
                    options=q_data.get('options')
                )
                survey.questions.append(question)

    db.session.add(survey)
    db.session.commit()

    return jsonify(survey.to_dict()), 201

@surveys_bp.route('', methods=['GET'])
@jwt_required()
def get_surveys():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Get query parameters
    status = request.args.get('status')
    category = request.args.get('category')
    search = request.args.get('search')
    
    # Base query
    query = Survey.query
    
    # Apply filters based on user role
    if user.role == 'admin':
        pass  # Admin can see all surveys
    elif user.role == 'enterprise':
        query = query.filter(
            or_(
                Survey.creator_id == current_user_id,
                Survey.status == 'active'
            )
        )
    else:
        query = query.filter_by(status='active')
    
    # Apply additional filters
    if status:
        query = query.filter_by(status=status)
    if category:
        query = query.filter_by(category=category)
    if search:
        query = query.filter(
            or_(
                Survey.title.ilike(f'%{search}%'),
                Survey.description.ilike(f'%{search}%')
            )
        )
    
    surveys = query.order_by(Survey.created_at.desc()).all()
    return jsonify([survey.to_dict() for survey in surveys]), 200

@surveys_bp.route('/<int:survey_id>', methods=['GET'])
@jwt_required()
def get_survey(survey_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    survey = Survey.query.get_or_404(survey_id)
    
    # Check access permissions
    if survey.creator_id != current_user_id and user.role not in ['admin', 'enterprise']:
        if survey.status != 'active':
            return jsonify({'message': 'Unauthorized'}), 403
    
    return jsonify(survey.to_dict()), 200

@surveys_bp.route('/<int:survey_id>', methods=['PUT'])
@jwt_required()
def update_survey(survey_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    survey = Survey.query.get_or_404(survey_id)

    # Check if user is the creator or has appropriate role
    if survey.creator_id != current_user_id and user.role not in ['admin', 'enterprise']:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json()

    # Update survey fields
    if 'title' in data:
        survey.title = data['title']
    if 'description' in data:
        survey.description = data['description']
    if 'status' in data:
        # Check if user can change status based on plan
        if data['status'] == 'active' and user.role == 'core':
            active_surveys = Survey.query.filter_by(creator_id=current_user_id, status='active').count()
            if active_surveys >= 3:
                return jsonify({'message': 'Survey limit reached for Core plan'}), 403
        survey.status = data['status']
    if 'start_date' in data:
        survey.start_date = datetime.fromisoformat(data['start_date'])
    if 'end_date' in data:
        survey.end_date = datetime.fromisoformat(data['end_date'])
    if 'is_anonymous' in data:
        survey.is_anonymous = data['is_anonymous']
    if 'allow_comments' in data:
        survey.allow_comments = data['allow_comments']
    if 'reminder_frequency' in data:
        survey.reminder_frequency = data['reminder_frequency']
    if 'category' in data:
        survey.category = data['category']

    # Update questions if provided
    if 'questions' in data:
        # Remove existing questions
        Question.query.filter_by(survey_id=survey.id).delete()
        
        # Add new questions
        for q_data in data['questions']:
            question = Question(
                survey_id=survey.id,
                text=q_data['text'],
                type=q_data['type'],
                required=q_data.get('required', False),
                order=q_data.get('order', 0),
                options=q_data.get('options'),
                allow_comments=q_data.get('allow_comments', False)
            )
            db.session.add(question)

    db.session.commit()
    return jsonify(survey.to_dict()), 200

@surveys_bp.route('/<int:survey_id>', methods=['DELETE'])
@jwt_required()
def delete_survey(survey_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    survey = Survey.query.get_or_404(survey_id)

    # Check if user is the creator or has appropriate role
    if survey.creator_id != current_user_id and user.role not in ['admin', 'enterprise']:
        return jsonify({'message': 'Unauthorized'}), 403

    db.session.delete(survey)
    db.session.commit()
    return '', 204

@surveys_bp.route('/<int:survey_id>/duplicate', methods=['POST'])
@jwt_required()
def duplicate_survey(survey_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    original_survey = Survey.query.get_or_404(survey_id)

    # Check if user has permission to duplicate
    if original_survey.creator_id != current_user_id and user.role not in ['admin', 'enterprise']:
        return jsonify({'message': 'Unauthorized'}), 403

    # Create new survey
    new_survey = Survey(
        title=f"Copy of {original_survey.title}",
        description=original_survey.description,
        creator_id=current_user_id,
        status='draft',
        is_anonymous=original_survey.is_anonymous,
        allow_comments=original_survey.allow_comments,
        category=original_survey.category
    )

    # Copy questions
    for question in original_survey.questions:
        new_question = Question(
            text=question.text,
            type=question.type,
            required=question.required,
            order=question.order,
            options=question.options,
            allow_comments=question.allow_comments
        )
        new_survey.questions.append(new_question)

    db.session.add(new_survey)
    db.session.commit()

    return jsonify(new_survey.to_dict()), 201 