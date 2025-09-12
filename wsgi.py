#!/usr/bin/env python3
"""
Novora MVP Flask API with Authentication - WSGI Entry Point
"""
import os
import sqlite3
import hashlib
import secrets
import json
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt

app = Flask(__name__)
CORS(app, origins=[
    "https://novorasurveys.com",
    "https://novora-static.vercel.app", 
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173"
])

# Configuration
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_path():
    """Get database path - use production DB if available, otherwise local"""
    if DATABASE_URL and 'postgresql' in DATABASE_URL:
        return None  # Use PostgreSQL in production
    else:
        # Use local SQLite for development
        local_path = 'backend/mvp_surveys.db'
        if os.path.exists(local_path):
            return local_path
        return 'mvp_surveys.db'

def init_database():
    """Initialize database with required tables"""
    db_path = get_db_path()
    if not db_path:
        return  # Skip for PostgreSQL
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            company_name TEXT,
            company_size TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create user_sessions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    
    # Add user_id to surveys table if it doesn't exist
    try:
        cursor.execute("ALTER TABLE surveys ADD COLUMN user_id INTEGER")
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    # Add survey_token to surveys table if it doesn't exist
    try:
        cursor.execute("ALTER TABLE surveys ADD COLUMN survey_token TEXT")
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    # Create responses table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            survey_id INTEGER NOT NULL,
            user_id INTEGER,
            response_data TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (survey_id) REFERENCES surveys (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    
    conn.commit()
    conn.close()
    print("Database initialized successfully")

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hashed):
    """Verify password against hash"""
    return hash_password(password) == hashed

def create_token(user_id):
    """Create JWT token for user"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def verify_token(token):
    """Verify JWT token and return user_id"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def get_current_user():
    """Get current user from Authorization header"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    user_id = verify_token(token)
    return user_id

# Initialize database on startup
init_database()

@app.route('/', methods=['GET'])
def root():
    return "Novora MVP API v2.0 with Authentication is running!"

@app.route('/health', methods=['GET'])
def health():
    return "API is working"

@app.route('/api/v1/health', methods=['GET'])
def api_health():
    return "API v1 is working"

@app.route('/api/v1/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        company_name = data.get('company_name', '')
        company_size = data.get('company_size', 'small')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        db_path = get_db_path()
        if not db_path:
            return jsonify({'error': 'Database not available'}), 500
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'error': 'User already exists'}), 400
        
        # Create user
        password_hash = hash_password(password)
        cursor.execute("""
            INSERT INTO users (email, password_hash, company_name, company_size)
            VALUES (?, ?, ?, ?)
        """, (email, password_hash, company_name, company_size))
        
        user_id = cursor.lastrowid
        
        # Create session token
        token = create_token(user_id)
        expires_at = datetime.utcnow() + timedelta(days=7)
        
        cursor.execute("""
            INSERT INTO user_sessions (user_id, token, expires_at)
            VALUES (?, ?, ?)
        """, (user_id, token, expires_at))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': {
                'id': user_id,
                'email': email,
                'company_name': company_name,
                'company_size': company_size
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        db_path = get_db_path()
        if not db_path:
            return jsonify({'error': 'Database not available'}), 500
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Find user
        cursor.execute("""
            SELECT id, password_hash, company_name, company_size 
            FROM users WHERE email = ?
        """, (email,))
        
        user = cursor.fetchone()
        if not user or not verify_password(password, user[1]):
            conn.close()
            return jsonify({'error': 'Invalid credentials'}), 401
        
        user_id, _, company_name, company_size = user
        
        # Create session token
        token = create_token(user_id)
        expires_at = datetime.utcnow() + timedelta(days=7)
        
        cursor.execute("""
            INSERT INTO user_sessions (user_id, token, expires_at)
            VALUES (?, ?, ?)
        """, (user_id, token, expires_at))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user_id,
                'email': email,
                'company_name': company_name,
                'company_size': company_size
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/auth/me', methods=['GET'])
def get_current_user_info():
    """Get current user information"""
    user_id = get_current_user()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        db_path = get_db_path()
        if not db_path:
            return jsonify({'error': 'Database not available'}), 500
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, email, company_name, company_size, created_at
            FROM users WHERE id = ?
        """, (user_id,))
        
        user = cursor.fetchone()
        if not user:
            conn.close()
            return jsonify({'error': 'User not found'}), 404
        
        conn.close()
        
        return jsonify({
            'user': {
                'id': user[0],
                'email': user[1],
                'company_name': user[2],
                'company_size': user[3],
                'created_at': user[4]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/surveys', methods=['GET'])
def get_surveys():
    """Get surveys for current user"""
    user_id = get_current_user()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        db_path = get_db_path()
        if not db_path:
            return jsonify({'error': 'Database not available'}), 500
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get user's surveys
        cursor.execute("""
            SELECT id, title, description, questions, company_size, max_submissions, 
                   created_at, survey_token
            FROM surveys 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        """, (user_id,))
        
        surveys = []
        for row in cursor.fetchall():
            survey_id, title, description, questions, company_size, max_submissions, created_at, survey_token = row
            
            # Parse questions JSON
            try:
                questions_data = json.loads(questions) if questions else []
            except:
                questions_data = []
            
            # Generate survey link
            survey_link = f"https://novorasurveys.com/survey/{survey_token}" if survey_token else None
            
            surveys.append({
                'id': survey_id,
                'title': title,
                'description': description,
                'questions': questions_data,
                'company_size': company_size,
                'max_submissions': max_submissions,
                'created_at': created_at,
                'survey_token': survey_token,
                'survey_link': survey_link
            })
        
        conn.close()
        
        return jsonify({'surveys': surveys}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/surveys', methods=['POST'])
def create_survey():
    """Create a new survey"""
    user_id = get_current_user()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        title = data.get('title')
        description = data.get('description', '')
        questions = data.get('questions', [])
        company_size = data.get('company_size', 'small')
        max_submissions = data.get('max_submissions', 100)
        
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        
        db_path = get_db_path()
        if not db_path:
            return jsonify({'error': 'Database not available'}), 500
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Generate survey token
        survey_token = f"mvp-user-{user_id}_{secrets.token_hex(8)}"
        
        # Create survey
        cursor.execute("""
            INSERT INTO surveys (title, description, questions, company_size, max_submissions, user_id, survey_token)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (title, description, json.dumps(questions), company_size, max_submissions, user_id, survey_token))
        
        survey_id = cursor.lastrowid
        
        conn.commit()
        conn.close()
        
        # Generate survey link
        survey_link = f"https://novorasurveys.com/survey/{survey_token}"
        
        return jsonify({
            'message': 'Survey created successfully',
            'survey': {
                'id': survey_id,
                'title': title,
                'description': description,
                'questions': questions,
                'company_size': company_size,
                'max_submissions': max_submissions,
                'survey_token': survey_token,
                'survey_link': survey_link,
                'created_at': datetime.utcnow().isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/surveys/<int:survey_id>', methods=['GET'])
def get_survey(survey_id):
    """Get specific survey details"""
    user_id = get_current_user()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        db_path = get_db_path()
        if not db_path:
            return jsonify({'error': 'Database not available'}), 500
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get survey (must belong to user)
        cursor.execute("""
            SELECT id, title, description, questions, company_size, max_submissions, 
                   created_at, survey_token
            FROM surveys 
            WHERE id = ? AND user_id = ?
        """, (survey_id, user_id))
        
        survey = cursor.fetchone()
        if not survey:
            conn.close()
            return jsonify({'error': 'Survey not found'}), 404
        
        survey_id, title, description, questions, company_size, max_submissions, created_at, survey_token = survey
        
        # Parse questions JSON
        try:
            questions_data = json.loads(questions) if questions else []
        except:
            questions_data = []
        
        # Generate survey link
        survey_link = f"https://novorasurveys.com/survey/{survey_token}" if survey_token else None
        
        conn.close()
        
        return jsonify({
            'survey': {
                'id': survey_id,
                'title': title,
                'description': description,
                'questions': questions_data,
                'company_size': company_size,
                'max_submissions': max_submissions,
                'created_at': created_at,
                'survey_token': survey_token,
                'survey_link': survey_link
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/surveys/<int:survey_id>/responses', methods=['GET'])
def get_survey_responses(survey_id):
    """Get responses for a survey"""
    user_id = get_current_user()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        db_path = get_db_path()
        if not db_path:
            return jsonify({'error': 'Database not available'}), 500
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verify survey belongs to user
        cursor.execute("SELECT id FROM surveys WHERE id = ? AND user_id = ?", (survey_id, user_id))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Survey not found'}), 404
        
        # Get responses
        cursor.execute("""
            SELECT id, response_data, created_at
            FROM responses 
            WHERE survey_id = ?
            ORDER BY created_at DESC
        """, (survey_id,))
        
        responses = []
        for row in cursor.fetchall():
            response_id, response_data, created_at = row
            try:
                data = json.loads(response_data) if response_data else {}
            except:
                data = {}
            
            responses.append({
                'id': response_id,
                'data': data,
                'created_at': created_at
            })
        
        conn.close()
        
        return jsonify({'responses': responses}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/surveys/<survey_token>/responses', methods=['POST'])
def submit_survey_response(survey_token):
    """Submit a survey response (public endpoint)"""
    try:
        data = request.get_json()
        response_data = data.get('responses', {})
        
        if not response_data:
            return jsonify({'error': 'Response data required'}), 400
        
        db_path = get_db_path()
        if not db_path:
            return jsonify({'error': 'Database not available'}), 500
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Find survey by token
        cursor.execute("SELECT id, user_id FROM surveys WHERE survey_token = ?", (survey_token,))
        survey = cursor.fetchone()
        if not survey:
            conn.close()
            return jsonify({'error': 'Survey not found'}), 404
        
        survey_id, user_id = survey
        
        # Save response
        cursor.execute("""
            INSERT INTO responses (survey_id, user_id, response_data)
            VALUES (?, ?, ?)
        """, (survey_id, user_id, json.dumps(response_data)))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Response submitted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    db_path = get_db_path()
    print(f"Database path: {db_path}")
    print(f"Starting Flask app on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)