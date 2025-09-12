from flask import Blueprint, jsonify
from flask_restx import Api, Resource, fields, Namespace
from functools import wraps
from models import User, Survey, Question, Response, Answer, SurveyTemplate
from utils.auth import admin_required
from datetime import datetime

# Initialize API documentation
docs_bp = Blueprint('docs', __name__)
api = Api(docs_bp,
    title='Employee Survey API',
    version='1.0',
    description='A comprehensive API for managing employee surveys',
    doc='/docs',
    prefix='/api'
)

# Create namespaces for different API sections
auth_ns = Namespace('auth', description='Authentication operations')
survey_ns = Namespace('surveys', description='Survey operations')
response_ns = Namespace('responses', description='Response operations')
template_ns = Namespace('templates', description='Template operations')
analytics_ns = Namespace('analytics', description='Analytics operations')
config_ns = Namespace('config', description='Configuration operations')

# Add namespaces to API
api.add_namespace(auth_ns)
api.add_namespace(survey_ns)
api.add_namespace(response_ns)
api.add_namespace(template_ns)
api.add_namespace(analytics_ns)
api.add_namespace(config_ns)

# Define common models
user_model = api.model('User', {
    'id': fields.Integer(readonly=True),
    'email': fields.String(required=True, description='User email'),
    'role': fields.String(required=True, description='User role'),
    'company_name': fields.String(description='Company name'),
    'created_at': fields.DateTime(readonly=True),
    'last_login': fields.DateTime(readonly=True)
})

survey_model = api.model('Survey', {
    'id': fields.Integer(readonly=True),
    'title': fields.String(required=True, description='Survey title'),
    'description': fields.String(description='Survey description'),
    'status': fields.String(description='Survey status'),
    'start_date': fields.DateTime(description='Survey start date'),
    'end_date': fields.DateTime(description='Survey end date'),
    'is_anonymous': fields.Boolean(description='Whether responses are anonymous'),
    'allow_comments': fields.Boolean(description='Whether comments are allowed'),
    'category': fields.String(description='Survey category'),
    'created_at': fields.DateTime(readonly=True),
    'updated_at': fields.DateTime(readonly=True)
})

question_model = api.model('Question', {
    'id': fields.Integer(readonly=True),
    'text': fields.String(required=True, description='Question text'),
    'type': fields.String(required=True, description='Question type'),
    'required': fields.Boolean(description='Whether question is required'),
    'order': fields.Integer(description='Question order'),
    'options': fields.Raw(description='Question options for multiple choice'),
    'allow_comments': fields.Boolean(description='Whether comments are allowed')
})

response_model = api.model('Response', {
    'id': fields.Integer(readonly=True),
    'survey_id': fields.Integer(required=True, description='Survey ID'),
    'user_id': fields.Integer(description='User ID (if not anonymous)'),
    'submitted_at': fields.DateTime(readonly=True),
    'completed': fields.Boolean(description='Whether response is completed')
})

answer_model = api.model('Answer', {
    'id': fields.Integer(readonly=True),
    'response_id': fields.Integer(required=True, description='Response ID'),
    'question_id': fields.Integer(required=True, description='Question ID'),
    'value': fields.String(required=True, description='Answer value'),
    'comment': fields.String(description='Answer comment')
})

template_model = api.model('Template', {
    'id': fields.Integer(readonly=True),
    'title': fields.String(required=True, description='Template title'),
    'description': fields.String(description='Template description'),
    'questions': fields.Raw(required=True, description='Template questions'),
    'category': fields.String(description='Template category'),
    'is_public': fields.Boolean(description='Whether template is public'),
    'created_at': fields.DateTime(readonly=True),
    'updated_at': fields.DateTime(readonly=True)
})

# Authentication endpoints documentation
@auth_ns.route('/register')
class Register(Resource):
    @auth_ns.expect(api.model('RegisterInput', {
        'email': fields.String(required=True, description='User email'),
        'password': fields.String(required=True, description='User password'),
        'company_name': fields.String(required=True, description='Company name')
    }))
    @auth_ns.response(201, 'User created successfully')
    @auth_ns.response(400, 'Invalid input')
    def post(self):
        """Register a new user"""
        pass

@auth_ns.route('/login')
class Login(Resource):
    @auth_ns.expect(api.model('LoginInput', {
        'email': fields.String(required=True, description='User email'),
        'password': fields.String(required=True, description='User password')
    }))
    @auth_ns.response(200, 'Login successful')
    @auth_ns.response(401, 'Invalid credentials')
    def post(self):
        """Login user"""
        pass

# Survey endpoints documentation
@survey_ns.route('/')
class SurveyList(Resource):
    @survey_ns.marshal_list_with(survey_model)
    @survey_ns.response(200, 'Success')
    def get(self):
        """List all surveys"""
        pass

    @survey_ns.expect(survey_model)
    @survey_ns.marshal_with(survey_model, code=201)
    @survey_ns.response(400, 'Invalid input')
    def post(self):
        """Create a new survey"""
        pass

@survey_ns.route('/<int:id>')
@survey_ns.param('id', 'The survey identifier')
class SurveyResource(Resource):
    @survey_ns.marshal_with(survey_model)
    @survey_ns.response(200, 'Success')
    @survey_ns.response(404, 'Survey not found')
    def get(self, id):
        """Get a specific survey"""
        pass

    @survey_ns.expect(survey_model)
    @survey_ns.marshal_with(survey_model)
    @survey_ns.response(200, 'Success')
    @survey_ns.response(404, 'Survey not found')
    def put(self, id):
        """Update a survey"""
        pass

    @survey_ns.response(204, 'Survey deleted')
    @survey_ns.response(404, 'Survey not found')
    def delete(self, id):
        """Delete a survey"""
        pass

# Response endpoints documentation
@response_ns.route('/survey/<int:survey_id>')
@response_ns.param('survey_id', 'The survey identifier')
class SurveyResponses(Resource):
    @response_ns.marshal_list_with(response_model)
    @response_ns.response(200, 'Success')
    @response_ns.response(404, 'Survey not found')
    def get(self, survey_id):
        """List all responses for a survey"""
        pass

    @response_ns.expect(api.model('ResponseInput', {
        'answers': fields.List(fields.Nested(answer_model), required=True),
        'completed': fields.Boolean(required=True)
    }))
    @response_ns.marshal_with(response_model, code=201)
    @response_ns.response(400, 'Invalid input')
    @response_ns.response(404, 'Survey not found')
    def post(self, survey_id):
        """Submit a response to a survey"""
        pass

# Template endpoints documentation
@template_ns.route('/')
class TemplateList(Resource):
    @template_ns.marshal_list_with(template_model)
    @template_ns.response(200, 'Success')
    def get(self):
        """List all survey templates"""
        pass

    @template_ns.expect(template_model)
    @template_ns.marshal_with(template_model, code=201)
    @template_ns.response(400, 'Invalid input')
    def post(self):
        """Create a new survey template"""
        pass

# Analytics endpoints documentation
@analytics_ns.route('/survey/<int:survey_id>')
@analytics_ns.param('survey_id', 'The survey identifier')
class SurveyAnalytics(Resource):
    @analytics_ns.response(200, 'Success')
    @analytics_ns.response(404, 'Survey not found')
    def get(self, survey_id):
        """Get analytics for a survey"""
        pass

# Configuration endpoints documentation
@config_ns.route('/env')
class EnvConfig(Resource):
    @config_ns.response(200, 'Success')
    @config_ns.response(403, 'Admin access required')
    def get(self):
        """Get environment configuration"""
        pass

    @config_ns.expect(api.model('EnvConfigInput', {
        'variables': fields.Raw(required=True, description='Environment variables')
    }))
    @config_ns.response(200, 'Success')
    @config_ns.response(400, 'Invalid input')
    @config_ns.response(403, 'Admin access required')
    def post(self):
        """Update environment configuration"""
        pass

# Add error handlers
@api.errorhandler
def default_error_handler(error):
    return {'message': str(error)}, getattr(error, 'code', 500)

# Add security definitions
api.authorizations = {
    'apikey': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'X-API-KEY'
    }
}

# Add tags for better organization
api.tags = {
    'auth': 'Authentication',
    'surveys': 'Survey Management',
    'responses': 'Response Management',
    'templates': 'Template Management',
    'analytics': 'Analytics',
    'config': 'Configuration'
} 