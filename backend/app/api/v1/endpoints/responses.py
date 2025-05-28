from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Survey, Response, Answer, User, Question
from app.core.database import db
from datetime import datetime
from sqlalchemy import and_, or_, func
import json

responses_bp = Blueprint('responses', __name__)

@responses_bp.route('/surveys/<int:survey_id>/responses', methods=['POST'])
@jwt_required()
def submit_response(survey_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    survey = Survey.query.get_or_404(survey_id)
    
    # Check if survey is active
    if survey.status != 'active':
        return jsonify({'message': 'Survey is not active'}), 400
    
    # Check if survey has ended
    if survey.end_date and survey.end_date < datetime.utcnow():
        return jsonify({'message': 'Survey has ended'}), 400
    
    # Check if user has already submitted a response
    if not survey.is_anonymous:
        existing_response = Response.query.filter_by(
            survey_id=survey_id,
            user_id=current_user_id
        ).first()
        if existing_response:
            return jsonify({'message': 'You have already submitted a response to this survey'}), 400
    
    data = request.get_json()
    
    # Validate required fields
    if 'answers' not in data:
        return jsonify({'message': 'Answers are required'}), 400
    
    # Create response
    response = Response(
        survey_id=survey_id,
        user_id=None if survey.is_anonymous else current_user_id,
        completed=True
    )
    db.session.add(response)
    db.session.flush()  # Get response ID without committing
    
    # Process answers
    for answer_data in data['answers']:
        question = Question.query.get(answer_data.get('question_id'))
        if not question:
            continue
        
        # Validate required questions
        if question.required and not answer_data.get('value'):
            db.session.rollback()
            return jsonify({'message': f'Question {question.id} is required'}), 400
        
        # Validate answer type
        if question.type == 'multiple_choice' and answer_data.get('value'):
            if not isinstance(answer_data['value'], list):
                db.session.rollback()
                return jsonify({'message': f'Question {question.id} requires multiple choice answers'}), 400
            if not all(option in question.options for option in answer_data['value']):
                db.session.rollback()
                return jsonify({'message': f'Invalid options for question {question.id}'}), 400
        
        answer = Answer(
            response_id=response.id,
            question_id=question.id,
            value=str(answer_data['value']) if answer_data.get('value') else None,
            comment=answer_data.get('comment') if question.allow_comments else None
        )
        db.session.add(answer)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Response submitted successfully',
        'response_id': response.id
    }), 201

@responses_bp.route('/surveys/<int:survey_id>/responses', methods=['GET'])
@jwt_required()
def get_survey_responses(survey_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    survey = Survey.query.get_or_404(survey_id)
    
    # Check if user has permission to view responses
    if survey.creator_id != current_user_id and user.role not in ['admin', 'enterprise']:
        return jsonify({'message': 'Unauthorized'}), 403
    
    # Get query parameters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    completed = request.args.get('completed')
    
    # Base query
    query = Response.query.filter_by(survey_id=survey_id)
    
    # Apply filters
    if start_date:
        query = query.filter(Response.submitted_at >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Response.submitted_at <= datetime.fromisoformat(end_date))
    if completed is not None:
        query = query.filter_by(completed=completed.lower() == 'true')
    
    responses = query.order_by(Response.submitted_at.desc()).all()
    
    return jsonify([{
        'id': response.id,
        'user_id': response.user_id if not survey.is_anonymous else None,
        'submitted_at': response.submitted_at.isoformat(),
        'completed': response.completed,
        'answers': [{
            'question_id': answer.question_id,
            'value': answer.value,
            'comment': answer.comment
        } for answer in response.answers]
    } for response in responses]), 200

@responses_bp.route('/surveys/<int:survey_id>/responses/analytics', methods=['GET'])
@jwt_required()
def get_survey_analytics(survey_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    survey = Survey.query.get_or_404(survey_id)
    
    # Check if user has permission to view analytics
    if survey.creator_id != current_user_id and user.role not in ['admin', 'enterprise']:
        return jsonify({'message': 'Unauthorized'}), 403
    
    # Get response count
    total_responses = Response.query.filter_by(survey_id=survey_id).count()
    
    # Get completion rate
    completed_responses = Response.query.filter_by(
        survey_id=survey_id,
        completed=True
    ).count()
    completion_rate = (completed_responses / total_responses * 100) if total_responses > 0 else 0
    
    # Get question analytics
    question_analytics = []
    for question in survey.questions:
        analytics = {
            'question_id': question.id,
            'question_text': question.text,
            'type': question.type,
            'response_count': 0,
            'analytics': {}
        }
        
        if question.type == 'multiple_choice':
            # Count responses for each option
            option_counts = {}
            for answer in Answer.query.filter_by(question_id=question.id).all():
                if answer.value:
                    values = json.loads(answer.value)
                    for value in values:
                        option_counts[value] = option_counts.get(value, 0) + 1
            
            analytics['analytics'] = {
                'option_counts': option_counts,
                'total_responses': sum(option_counts.values())
            }
        
        elif question.type == 'rating':
            # Calculate average rating
            ratings = [float(a.value) for a in Answer.query.filter_by(question_id=question.id).all() if a.value]
            if ratings:
                analytics['analytics'] = {
                    'average_rating': sum(ratings) / len(ratings),
                    'min_rating': min(ratings),
                    'max_rating': max(ratings),
                    'total_responses': len(ratings)
                }
        
        elif question.type == 'text':
            # Count responses with comments
            comment_count = Answer.query.filter(
                Answer.question_id == question.id,
                Answer.comment.isnot(None)
            ).count()
            
            analytics['analytics'] = {
                'total_responses': Answer.query.filter_by(question_id=question.id).count(),
                'responses_with_comments': comment_count
            }
        
        question_analytics.append(analytics)
    
    return jsonify({
        'survey_id': survey_id,
        'total_responses': total_responses,
        'completion_rate': completion_rate,
        'question_analytics': question_analytics
    }), 200

@responses_bp.route('/surveys/<int:survey_id>/responses/<int:response_id>', methods=['GET'])
@jwt_required()
def get_response(survey_id, response_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    survey = Survey.query.get_or_404(survey_id)
    
    # Check if user has permission to view response
    if survey.creator_id != current_user_id and user.role not in ['admin', 'enterprise']:
        return jsonify({'message': 'Unauthorized'}), 403
    
    response = Response.query.get_or_404(response_id)
    
    # Verify response belongs to survey
    if response.survey_id != survey_id:
        return jsonify({'message': 'Response not found'}), 404
    
    return jsonify({
        'id': response.id,
        'user_id': response.user_id if not survey.is_anonymous else None,
        'submitted_at': response.submitted_at.isoformat(),
        'completed': response.completed,
        'answers': [{
            'question_id': answer.question_id,
            'value': answer.value,
            'comment': answer.comment
        } for answer in response.answers]
    }), 200

@responses_bp.route('/surveys/<int:survey_id>/responses/<int:response_id>', methods=['DELETE'])
@jwt_required()
def delete_response(survey_id, response_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    survey = Survey.query.get_or_404(survey_id)
    
    # Check if user has permission to delete response
    if survey.creator_id != current_user_id and user.role not in ['admin', 'enterprise']:
        return jsonify({'message': 'Unauthorized'}), 403
    
    response = Response.query.get_or_404(response_id)
    
    # Verify response belongs to survey
    if response.survey_id != survey_id:
        return jsonify({'message': 'Response not found'}), 404
    
    db.session.delete(response)
    db.session.commit()
    
    return '', 204

@responses_bp.route('/surveys/<int:survey_id>/responses/export', methods=['GET'])
@jwt_required()
def export_responses(survey_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    survey = Survey.query.get_or_404(survey_id)
    
    # Check if user has permission to export responses
    if survey.creator_id != current_user_id and user.role not in ['admin', 'enterprise']:
        return jsonify({'message': 'Unauthorized'}), 403
    
    # Get all responses
    responses = Response.query.filter_by(survey_id=survey_id).all()
    
    # Prepare CSV data
    csv_data = []
    headers = ['Response ID', 'Submitted At', 'Completed']
    
    # Add user ID if not anonymous
    if not survey.is_anonymous:
        headers.append('User ID')
    
    # Add question headers
    for question in survey.questions:
        headers.append(f'Q{question.id}: {question.text}')
        if question.allow_comments:
            headers.append(f'Q{question.id} Comment')
    
    # Add response data
    for response in responses:
        row = [
            response.id,
            response.submitted_at.isoformat(),
            response.completed
        ]
        
        if not survey.is_anonymous:
            row.append(response.user_id)
        
        # Add answers
        for question in survey.questions:
            answer = next((a for a in response.answers if a.question_id == question.id), None)
            row.append(answer.value if answer else '')
            if question.allow_comments:
                row.append(answer.comment if answer else '')
        
        csv_data.append(row)
    
    return jsonify({
        'headers': headers,
        'data': csv_data
    }), 200 