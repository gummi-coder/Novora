#!/usr/bin/env python3
"""
Vercel serverless backend
"""
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["*"])

# Simple in-memory storage
users = {}
surveys = {}
survey_counter = 0

@app.route('/')
def root():
    return "Novora MVP API v2.0 - WORKING!"

@app.route('/api/v1/health')
def health():
    return "API is working"

@app.route('/api/v1/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    if email in users:
        return jsonify({'error': 'User already exists'}), 400
    
    users[email] = {
        'password': password,
        'company_name': data.get('company_name', ''),
        'company_size': data.get('company_size', 'small')
    }
    
    return jsonify({
        'message': 'User registered successfully',
        'token': f'token_{email}_{len(users)}',
        'user': {'email': email, 'company_name': users[email]['company_name']}
    })

@app.route('/api/v1/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    if email not in users or users[email]['password'] != password:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    return jsonify({
        'message': 'Login successful',
        'token': f'token_{email}_{len(users)}',
        'user': {'email': email, 'company_name': users[email]['company_name']}
    })

@app.route('/api/v1/surveys', methods=['GET'])
def get_surveys():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Unauthorized'}), 401
    
    return jsonify({'surveys': list(surveys.values())})

@app.route('/api/v1/surveys', methods=['POST'])
def create_survey():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    global survey_counter
    survey_counter += 1
    
    survey = {
        'id': survey_counter,
        'title': data.get('title', 'Untitled Survey'),
        'description': data.get('description', ''),
        'questions': data.get('questions', []),
        'survey_link': f'https://novorasurveys.com/survey/survey_{survey_counter}'
    }
    
    surveys[survey_counter] = survey
    
    return jsonify({
        'message': 'Survey created successfully',
        'survey': survey
    })

# For Vercel
def handler(request):
    return app(request.environ, lambda *args: None)
