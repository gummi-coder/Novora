#!/usr/bin/env python3
"""
WSGI application for Render deployment - Flask with survey endpoints
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
import hashlib
import secrets
import json
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database path - try multiple locations
DB_PATHS = [
    "backend/mvp_surveys.db",
    "mvp_surveys.db", 
    "/app/backend/mvp_surveys.db",
    "/app/mvp_surveys.db"
]

def get_db_path():
    for path in DB_PATHS:
        if os.path.exists(path):
            return path
    # If no database found, return the first path as default
    return DB_PATHS[0]

DB_PATH = get_db_path()

# Helper functions for authentication
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hashed):
    return hash_password(password) == hashed

def create_token():
    return secrets.token_urlsafe(32)

def init_database():
    """Initialize database with users table if it doesn't exist"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Create users table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                company_name TEXT,
                role TEXT DEFAULT 'core',
                is_active BOOLEAN DEFAULT 1,
                is_email_verified BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                failed_login_attempts INTEGER DEFAULT 0,
                last_failed_login TIMESTAMP
            )
        """)
        
        # Create user_sessions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                refresh_token TEXT UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                is_revoked BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        # Create responses table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                survey_id INTEGER NOT NULL,
                response_data TEXT NOT NULL,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_address TEXT,
                FOREIGN KEY (survey_id) REFERENCES surveys (id)
            )
        """)
        
        # Add user_id column to surveys table if it doesn't exist
        try:
            cursor.execute("ALTER TABLE surveys ADD COLUMN user_id INTEGER")
        except:
            pass  # Column already exists
        
        conn.commit()
        conn.close()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Database initialization error: {e}")

# Initialize database on startup
init_database()

@app.route('/')
def home():
    return "Hello from Novora MVP API! Updated with authentication system!"

@app.route('/health')
def health():
    return "Health check OK"

@app.route('/api/v1/health')
def api_health():
    return "API v1 health OK"

# Authentication endpoints
@app.route('/api/v1/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Find user by email
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401
        
        user_id, user_email, password_hash, company_name, role, is_active, is_email_verified, created_at, last_login, failed_attempts, last_failed = user
        
        # Verify password
        if not verify_password(password, password_hash):
            # Update failed login attempts
            cursor.execute("""
                UPDATE users 
                SET failed_login_attempts = failed_login_attempts + 1, 
                    last_failed_login = CURRENT_TIMESTAMP 
                WHERE id = ?
            """, (user_id,))
            conn.commit()
            conn.close()
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Check if user is active
        if not is_active:
            conn.close()
            return jsonify({"error": "Account is deactivated"}), 401
        
        # Reset failed login attempts on successful login
        cursor.execute("""
            UPDATE users 
            SET failed_login_attempts = 0, last_login = CURRENT_TIMESTAMP 
            WHERE id = ?
        """, (user_id,))
        
        # Create refresh token
        refresh_token = create_token()
        expires_at = datetime.utcnow() + timedelta(days=7)
        
        cursor.execute("""
            INSERT INTO user_sessions (user_id, refresh_token, expires_at)
            VALUES (?, ?, ?)
        """, (user_id, refresh_token, expires_at))
        
        conn.commit()
        conn.close()
        
        # Create access token (simplified - in production use JWT)
        access_token = create_token()
        
        return jsonify({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "email": user_email,
            "user_id": user_id,
            "user": {
                "id": str(user_id),
                "email": user_email,
                "firstName": user_email.split('@')[0].title(),
                "lastName": "",
                "role": role,
                "status": "active" if is_active else "inactive",
                "createdAt": created_at,
                "updatedAt": created_at
            }
        })
        
    except Exception as e:
        return jsonify({"error": f"Login error: {str(e)}"}), 500

@app.route('/api/v1/auth/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        company_name = data.get('company_name')
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({"error": "Email already registered"}), 400
        
        # Create new user
        password_hash = hash_password(password)
        cursor.execute("""
            INSERT INTO users (email, password_hash, company_name, role, is_active, is_email_verified)
            VALUES (?, ?, ?, 'core', 1, 0)
        """, (email, password_hash, company_name))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            "message": "User registered successfully",
            "user_id": user_id,
            "email": email
        })
        
    except Exception as e:
        return jsonify({"error": f"Registration error: {str(e)}"}), 500

@app.route('/api/v1/auth/me', methods=['GET'])
def get_current_user():
    """Get current user information"""
    try:
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Authorization token required"}), 401
        
        token = auth_header.split(' ')[1]
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Find user by token (simplified - in production use JWT)
        cursor.execute("""
            SELECT u.* FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.refresh_token = ? AND s.is_revoked = 0 AND s.expires_at > CURRENT_TIMESTAMP
        """, (token,))
        
        user = cursor.fetchone()
        if not user:
            conn.close()
            return jsonify({"error": "Invalid token"}), 401
        
        user_id, user_email, password_hash, company_name, role, is_active, is_email_verified, created_at, last_login, failed_attempts, last_failed = user
        
        conn.close()
        
        return jsonify({
            "id": str(user_id),
            "email": user_email,
            "firstName": user_email.split('@')[0].title(),
            "lastName": "",
            "role": role,
            "is_active": bool(is_active),
            "status": "active" if is_active else "inactive",
            "createdAt": created_at,
            "updatedAt": created_at
        })
        
    except Exception as e:
        return jsonify({"error": f"Authentication error: {str(e)}"}), 500

@app.route('/api/v1/surveys')
def get_surveys():
    """Get all surveys with survey links - filtered by user if authenticated"""
    try:
        # Check if user is authenticated
        user_id = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            # Find user by token
            cursor.execute("""
                SELECT u.id FROM users u
                JOIN user_sessions s ON u.id = s.user_id
                WHERE s.refresh_token = ? AND s.is_revoked = 0 AND s.expires_at > CURRENT_TIMESTAMP
            """, (token,))
            
            user = cursor.fetchone()
            if user:
                user_id = user[0]
            conn.close()
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Get surveys - filter by user if authenticated, otherwise show all
        if user_id:
            cursor.execute("""
                SELECT id, title, description, survey_token, status, created_at, user_id
                FROM surveys 
                WHERE user_id = ?
                ORDER BY created_at DESC
            """, (user_id,))
        else:
            cursor.execute("""
                SELECT id, title, description, survey_token, status, created_at, user_id
                FROM surveys 
                ORDER BY created_at DESC
            """)
        
        surveys = []
        for row in cursor.fetchall():
            survey_id, title, description, survey_token, status, created_at, survey_user_id = row
            
            survey_link = None
            if survey_token:
                survey_link = f"https://novorasurveys.com/survey/{survey_token}"
            
            surveys.append({
                "id": survey_id,
                "title": title,
                "description": description,
                "survey_token": survey_token,
                "survey_link": survey_link,
                "status": status,
                "created_at": created_at,
                "user_id": survey_user_id
            })
        
        conn.close()
        return jsonify(surveys)
        
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@app.route('/api/v1/surveys', methods=['POST'])
def create_survey():
    """Create a new survey for authenticated user"""
    try:
        # Check authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Authentication required"}), 401
        
        token = auth_header.split(' ')[1]
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Find user by token
        cursor.execute("""
            SELECT u.id FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.refresh_token = ? AND s.is_revoked = 0 AND s.expires_at > CURRENT_TIMESTAMP
        """, (token,))
        
        user = cursor.fetchone()
        if not user:
            conn.close()
            return jsonify({"error": "Invalid token"}), 401
        
        user_id = user[0]
        
        # Get survey data
        data = request.get_json()
        title = data.get('title', 'New Survey')
        description = data.get('description', '')
        
        # Generate survey token
        survey_token = f"mvp-user-{user_id}_{create_token()}"
        
        # Create survey
        cursor.execute("""
            INSERT INTO surveys (title, description, survey_token, status, user_id, created_at)
            VALUES (?, ?, ?, 'active', ?, CURRENT_TIMESTAMP)
        """, (title, description, survey_token, user_id))
        
        survey_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        survey_link = f"https://novorasurveys.com/survey/{survey_token}"
        
        return jsonify({
            "id": survey_id,
            "title": title,
            "description": description,
            "survey_token": survey_token,
            "survey_link": survey_link,
            "status": "active",
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({"error": f"Survey creation error: {str(e)}"}), 500

@app.route('/api/v1/surveys/<survey_token>/responses', methods=['POST'])
def submit_survey_response(survey_token):
    """Submit survey response"""
    try:
        data = request.get_json()
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Find survey by token
        cursor.execute("SELECT id, user_id FROM surveys WHERE survey_token = ?", (survey_token,))
        survey = cursor.fetchone()
        
        if not survey:
            conn.close()
            return jsonify({"error": "Survey not found"}), 404
        
        survey_id, survey_user_id = survey
        
        # Store response
        cursor.execute("""
            INSERT INTO responses (survey_id, response_data, submitted_at, ip_address)
            VALUES (?, ?, CURRENT_TIMESTAMP, ?)
        """, (survey_id, json.dumps(data), request.remote_addr))
        
        conn.commit()
        conn.close()
        
        return jsonify({"message": "Response submitted successfully"})
        
    except Exception as e:
        return jsonify({"error": f"Response submission error: {str(e)}"}), 500

@app.route('/api/v1/surveys/<int:survey_id>/responses')
def get_survey_responses(survey_id):
    """Get responses for a specific survey (authenticated users only)"""
    try:
        # Check authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Authentication required"}), 401
        
        token = auth_header.split(' ')[1]
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Find user by token
        cursor.execute("""
            SELECT u.id FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.refresh_token = ? AND s.is_revoked = 0 AND s.expires_at > CURRENT_TIMESTAMP
        """, (token,))
        
        user = cursor.fetchone()
        if not user:
            conn.close()
            return jsonify({"error": "Invalid token"}), 401
        
        user_id = user[0]
        
        # Check if user owns this survey
        cursor.execute("SELECT user_id FROM surveys WHERE id = ?", (survey_id,))
        survey = cursor.fetchone()
        if not survey or survey[0] != user_id:
            conn.close()
            return jsonify({"error": "Survey not found or access denied"}), 404
        
        # Get responses
        cursor.execute("""
            SELECT id, response_data, submitted_at, ip_address
            FROM responses 
            WHERE survey_id = ?
            ORDER BY submitted_at DESC
        """, (survey_id,))
        
        responses = []
        for row in cursor.fetchall():
            response_id, response_data, submitted_at, ip_address = row
            responses.append({
                "id": response_id,
                "response_data": json.loads(response_data) if response_data else {},
                "submitted_at": submitted_at,
                "ip_address": ip_address
            })
        
        conn.close()
        return jsonify(responses)
        
    except Exception as e:
        return jsonify({"error": f"Error fetching responses: {str(e)}"}), 500

@app.route('/api/v1/surveys/<int:survey_id>')
def get_survey(survey_id):
    """Get a specific survey by ID"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, title, description, survey_token, status, created_at 
            FROM surveys 
            WHERE id = ?
        """, (survey_id,))
        
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Survey not found"}), 404
        
        survey_id, title, description, survey_token, status, created_at = row
        
        survey_link = None
        if survey_token:
            survey_link = f"https://novorasurveys.com/survey/{survey_token}"
        
        conn.close()
        return jsonify({
            "id": survey_id,
            "title": title,
            "description": description,
            "survey_token": survey_token,
            "survey_link": survey_link,
            "status": status,
            "created_at": created_at
        })
        
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"Starting Flask app on port {port}")
    print(f"Database path: {DB_PATH}")
    app.run(host='0.0.0.0', port=port, debug=True)
