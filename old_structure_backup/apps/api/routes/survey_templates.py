from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import SurveyTemplate, User
from database import db

templates_bp = Blueprint('templates', __name__)

@templates_bp.route('', methods=['POST'])
@jwt_required()
def create_template():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Check if user has permission to create templates
    if user.role not in ['admin', 'enterprise']:
        return jsonify({'message': 'Unauthorized - Only Enterprise and Admin users can create templates'}), 403

    data = request.get_json()
    
    template = SurveyTemplate(
        title=data['title'],
        description=data.get('description'),
        creator_id=current_user_id,
        questions=data['questions'],
        category=data.get('category', 'general'),
        is_public=data.get('is_public', False)
    )
    
    db.session.add(template)
    db.session.commit()
    
    return jsonify(template.to_dict()), 201

@templates_bp.route('', methods=['GET'])
@jwt_required()
def get_templates():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Get templates based on user role
    if user.role == 'admin':
        templates = SurveyTemplate.query.all()
    elif user.role == 'enterprise':
        templates = SurveyTemplate.query.filter(
            (SurveyTemplate.creator_id == current_user_id) |
            (SurveyTemplate.is_public == True)
        ).all()
    else:
        templates = SurveyTemplate.query.filter_by(is_public=True).all()
    
    return jsonify([template.to_dict() for template in templates]), 200

@templates_bp.route('/<int:template_id>', methods=['GET'])
@jwt_required()
def get_template(template_id):
    template = SurveyTemplate.query.get_or_404(template_id)
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Check if user has access to this template
    if not template.is_public and template.creator_id != current_user_id and user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    return jsonify(template.to_dict()), 200

@templates_bp.route('/<int:template_id>', methods=['PUT'])
@jwt_required()
def update_template(template_id):
    current_user_id = get_jwt_identity()
    template = SurveyTemplate.query.get_or_404(template_id)
    
    # Check if user has permission to update
    if template.creator_id != current_user_id and User.query.get(current_user_id).role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if 'title' in data:
        template.title = data['title']
    if 'description' in data:
        template.description = data['description']
    if 'questions' in data:
        template.questions = data['questions']
    if 'category' in data:
        template.category = data['category']
    if 'is_public' in data:
        template.is_public = data['is_public']
    
    db.session.commit()
    return jsonify(template.to_dict()), 200

@templates_bp.route('/<int:template_id>', methods=['DELETE'])
@jwt_required()
def delete_template(template_id):
    current_user_id = get_jwt_identity()
    template = SurveyTemplate.query.get_or_404(template_id)
    
    # Check if user has permission to delete
    if template.creator_id != current_user_id and User.query.get(current_user_id).role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    db.session.delete(template)
    db.session.commit()
    return '', 204 