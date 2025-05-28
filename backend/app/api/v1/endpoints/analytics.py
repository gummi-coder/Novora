from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Survey, Response, Answer, User, Question
from app.core.database import db
from datetime import datetime, timedelta
from sqlalchemy import func, and_, or_, extract
import json
import pandas as pd
import numpy as np
from collections import defaultdict

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_metrics():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Get date range from query parameters
    days = int(request.args.get('days', 30))
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get surveys created by user
    surveys = Survey.query.filter(
        Survey.creator_id == current_user_id,
        Survey.created_at >= start_date
    ).all()
    
    # Calculate metrics
    total_surveys = len(surveys)
    active_surveys = sum(1 for s in surveys if s.status == 'active')
    total_responses = sum(len(s.responses) for s in surveys)
    avg_completion_rate = sum(
        len([r for r in s.responses if r.completed]) / len(s.responses) * 100
        for s in surveys if s.responses
    ) / total_surveys if total_surveys > 0 else 0
    
    # Get response trends
    response_trends = []
    for i in range(days):
        date = start_date + timedelta(days=i)
        responses_count = sum(
            len([r for r in s.responses if r.submitted_at.date() == date.date()])
            for s in surveys
        )
        response_trends.append({
            'date': date.date().isoformat(),
            'count': responses_count
        })
    
    return jsonify({
        'total_surveys': total_surveys,
        'active_surveys': active_surveys,
        'total_responses': total_responses,
        'avg_completion_rate': avg_completion_rate,
        'response_trends': response_trends
    }), 200

@analytics_bp.route('/surveys/<int:survey_id>/trends', methods=['GET'])
@jwt_required()
def get_survey_trends(survey_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    survey = Survey.query.get_or_404(survey_id)
    
    # Check permissions
    if survey.creator_id != current_user_id and user.role not in ['admin', 'enterprise']:
        return jsonify({'message': 'Unauthorized'}), 403
    
    # Get time period from query parameters
    period = request.args.get('period', 'daily')  # daily, weekly, monthly
    days = int(request.args.get('days', 30))
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get responses within date range
    responses = Response.query.filter(
        Response.survey_id == survey_id,
        Response.submitted_at >= start_date
    ).all()
    
    # Group responses by time period
    trends = defaultdict(lambda: {
        'response_count': 0,
        'completion_rate': 0,
        'question_analytics': defaultdict(lambda: {
            'values': [],
            'comments': []
        })
    })
    
    for response in responses:
        if period == 'daily':
            key = response.submitted_at.date().isoformat()
        elif period == 'weekly':
            key = response.submitted_at.date().isocalendar()[:2]
        else:  # monthly
            key = f"{response.submitted_at.year}-{response.submitted_at.month:02d}"
        
        trends[key]['response_count'] += 1
        if response.completed:
            trends[key]['completion_rate'] += 1
        
        # Collect question analytics
        for answer in response.answers:
            question = Question.query.get(answer.question_id)
            if question.type == 'rating':
                trends[key]['question_analytics'][question.id]['values'].append(float(answer.value))
            elif question.type == 'multiple_choice':
                values = json.loads(answer.value)
                trends[key]['question_analytics'][question.id]['values'].extend(values)
            if answer.comment:
                trends[key]['question_analytics'][question.id]['comments'].append(answer.comment)
    
    # Calculate averages and percentages
    for key in trends:
        total = trends[key]['response_count']
        if total > 0:
            trends[key]['completion_rate'] = (trends[key]['completion_rate'] / total) * 100
            
            for question_id in trends[key]['question_analytics']:
                analytics = trends[key]['question_analytics'][question_id]
                question = Question.query.get(question_id)
                
                if question.type == 'rating' and analytics['values']:
                    analytics['average'] = sum(analytics['values']) / len(analytics['values'])
                    analytics['min'] = min(analytics['values'])
                    analytics['max'] = max(analytics['values'])
                elif question.type == 'multiple_choice' and analytics['values']:
                    value_counts = pd.Series(analytics['values']).value_counts()
                    analytics['distribution'] = {
                        value: count / len(analytics['values']) * 100
                        for value, count in value_counts.items()
                    }
                
                # Remove raw data
                analytics.pop('values', None)
    
    return jsonify({
        'survey_id': survey_id,
        'period': period,
        'trends': dict(trends)
    }), 200

@analytics_bp.route('/surveys/<int:survey_id>/comparison', methods=['GET'])
@jwt_required()
def compare_survey_periods(survey_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    survey = Survey.query.get_or_404(survey_id)
    
    # Check permissions
    if survey.creator_id != current_user_id and user.role not in ['admin', 'enterprise']:
        return jsonify({'message': 'Unauthorized'}), 403
    
    # Get comparison periods
    period1_start = datetime.fromisoformat(request.args.get('period1_start'))
    period1_end = datetime.fromisoformat(request.args.get('period1_end'))
    period2_start = datetime.fromisoformat(request.args.get('period2_start'))
    period2_end = datetime.fromisoformat(request.args.get('period2_end'))
    
    def get_period_analytics(start_date, end_date):
        responses = Response.query.filter(
            Response.survey_id == survey_id,
            Response.submitted_at >= start_date,
            Response.submitted_at <= end_date
        ).all()
        
        analytics = {
            'response_count': len(responses),
            'completion_rate': len([r for r in responses if r.completed]) / len(responses) * 100 if responses else 0,
            'question_analytics': {}
        }
        
        for question in survey.questions:
            question_analytics = {
                'response_count': 0,
                'analytics': {}
            }
            
            answers = [a for r in responses for a in r.answers if a.question_id == question.id]
            question_analytics['response_count'] = len(answers)
            
            if question.type == 'rating':
                values = [float(a.value) for a in answers if a.value]
                if values:
                    question_analytics['analytics'] = {
                        'average': sum(values) / len(values),
                        'min': min(values),
                        'max': max(values),
                        'std_dev': np.std(values)
                    }
            
            elif question.type == 'multiple_choice':
                all_values = []
                for answer in answers:
                    if answer.value:
                        all_values.extend(json.loads(answer.value))
                
                if all_values:
                    value_counts = pd.Series(all_values).value_counts()
                    question_analytics['analytics'] = {
                        'distribution': {
                            value: count / len(all_values) * 100
                            for value, count in value_counts.items()
                        }
                    }
            
            elif question.type == 'text':
                comments = [a.comment for a in answers if a.comment]
                question_analytics['analytics'] = {
                    'comment_count': len(comments),
                    'comment_examples': comments[:5]  # Include up to 5 example comments
                }
            
            analytics['question_analytics'][question.id] = question_analytics
        
        return analytics
    
    period1_analytics = get_period_analytics(period1_start, period1_end)
    period2_analytics = get_period_analytics(period2_start, period2_end)
    
    # Calculate changes between periods
    changes = {
        'response_count_change': period2_analytics['response_count'] - period1_analytics['response_count'],
        'completion_rate_change': period2_analytics['completion_rate'] - period1_analytics['completion_rate'],
        'question_changes': {}
    }
    
    for question_id in period1_analytics['question_analytics']:
        if question_id in period2_analytics['question_analytics']:
            q1 = period1_analytics['question_analytics'][question_id]
            q2 = period2_analytics['question_analytics'][question_id]
            
            question = Question.query.get(question_id)
            changes['question_changes'][question_id] = {
                'response_count_change': q2['response_count'] - q1['response_count']
            }
            
            if question.type == 'rating':
                if 'average' in q1['analytics'] and 'average' in q2['analytics']:
                    changes['question_changes'][question_id]['average_change'] = (
                        q2['analytics']['average'] - q1['analytics']['average']
                    )
            
            elif question.type == 'multiple_choice':
                if 'distribution' in q1['analytics'] and 'distribution' in q2['analytics']:
                    changes['question_changes'][question_id]['distribution_changes'] = {
                        option: q2['analytics']['distribution'].get(option, 0) - q1['analytics']['distribution'].get(option, 0)
                        for option in set(q1['analytics']['distribution'].keys()) | set(q2['analytics']['distribution'].keys())
                    }
    
    return jsonify({
        'survey_id': survey_id,
        'period1': {
            'start': period1_start.isoformat(),
            'end': period1_end.isoformat(),
            'analytics': period1_analytics
        },
        'period2': {
            'start': period2_start.isoformat(),
            'end': period2_end.isoformat(),
            'analytics': period2_analytics
        },
        'changes': changes
    }), 200

@analytics_bp.route('/surveys/<int:survey_id>/demographics', methods=['GET'])
@jwt_required()
def get_demographic_analytics(survey_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    survey = Survey.query.get_or_404(survey_id)
    
    # Check permissions
    if survey.creator_id != current_user_id and user.role not in ['admin', 'enterprise']:
        return jsonify({'message': 'Unauthorized'}), 403
    
    # Get responses
    responses = Response.query.filter_by(survey_id=survey_id).all()
    
    # Group responses by user demographics
    demographics = defaultdict(lambda: {
        'response_count': 0,
        'completion_rate': 0,
        'question_analytics': defaultdict(lambda: {
            'values': [],
            'comments': []
        })
    })
    
    for response in responses:
        if not survey.is_anonymous and response.user_id:
            user = User.query.get(response.user_id)
            # Group by role
            key = user.role
        else:
            key = 'anonymous'
        
        demographics[key]['response_count'] += 1
        if response.completed:
            demographics[key]['completion_rate'] += 1
        
        # Collect question analytics
        for answer in response.answers:
            question = Question.query.get(answer.question_id)
            if question.type == 'rating':
                demographics[key]['question_analytics'][question.id]['values'].append(float(answer.value))
            elif question.type == 'multiple_choice':
                values = json.loads(answer.value)
                demographics[key]['question_analytics'][question.id]['values'].extend(values)
            if answer.comment:
                demographics[key]['question_analytics'][question.id]['comments'].append(answer.comment)
    
    # Calculate averages and percentages
    for key in demographics:
        total = demographics[key]['response_count']
        if total > 0:
            demographics[key]['completion_rate'] = (demographics[key]['completion_rate'] / total) * 100
            
            for question_id in demographics[key]['question_analytics']:
                analytics = demographics[key]['question_analytics'][question_id]
                question = Question.query.get(question_id)
                
                if question.type == 'rating' and analytics['values']:
                    analytics['average'] = sum(analytics['values']) / len(analytics['values'])
                    analytics['min'] = min(analytics['values'])
                    analytics['max'] = max(analytics['values'])
                elif question.type == 'multiple_choice' and analytics['values']:
                    value_counts = pd.Series(analytics['values']).value_counts()
                    analytics['distribution'] = {
                        value: count / len(analytics['values']) * 100
                        for value, count in value_counts.items()
                    }
                
                # Remove raw data
                analytics.pop('values', None)
    
    return jsonify({
        'survey_id': survey_id,
        'demographics': dict(demographics)
    }), 200

@analytics_bp.route('/surveys/<int:survey_id>/correlation', methods=['GET'])
@jwt_required()
def get_question_correlations(survey_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    survey = Survey.query.get_or_404(survey_id)
    
    # Check permissions
    if survey.creator_id != current_user_id and user.role not in ['admin', 'enterprise']:
        return jsonify({'message': 'Unauthorized'}), 403
    
    # Get all responses
    responses = Response.query.filter_by(survey_id=survey_id).all()
    
    # Create a DataFrame for correlation analysis
    data = []
    for response in responses:
        row = {'response_id': response.id}
        for answer in response.answers:
            question = Question.query.get(answer.question_id)
            if question.type in ['rating', 'multiple_choice']:
                if question.type == 'rating':
                    row[f'q{question.id}'] = float(answer.value) if answer.value else None
                else:
                    # For multiple choice, use the first selected option
                    values = json.loads(answer.value) if answer.value else []
                    row[f'q{question.id}'] = values[0] if values else None
        data.append(row)
    
    df = pd.DataFrame(data)
    
    # Calculate correlations for rating questions
    rating_questions = [q for q in survey.questions if q.type == 'rating']
    correlations = {}
    
    for i, q1 in enumerate(rating_questions):
        for q2 in rating_questions[i+1:]:
            if f'q{q1.id}' in df.columns and f'q{q2.id}' in df.columns:
                corr = df[f'q{q1.id}'].corr(df[f'q{q2.id}'])
                if not pd.isna(corr):
                    correlations[f'{q1.id}-{q2.id}'] = {
                        'question1': q1.text,
                        'question2': q2.text,
                        'correlation': corr
                    }
    
    # Calculate chi-square tests for multiple choice questions
    mc_questions = [q for q in survey.questions if q.type == 'multiple_choice']
    chi_square_tests = {}
    
    for i, q1 in enumerate(mc_questions):
        for q2 in mc_questions[i+1:]:
            if f'q{q1.id}' in df.columns and f'q{q2.id}' in df.columns:
                contingency = pd.crosstab(df[f'q{q1.id}'], df[f'q{q2.id}'])
                chi2, p_value = chi2_contingency(contingency)[:2]
                
                chi_square_tests[f'{q1.id}-{q2.id}'] = {
                    'question1': q1.text,
                    'question2': q2.text,
                    'chi_square': chi2,
                    'p_value': p_value,
                    'significant': p_value < 0.05
                }
    
    return jsonify({
        'survey_id': survey_id,
        'correlations': correlations,
        'chi_square_tests': chi_square_tests
    }), 200 