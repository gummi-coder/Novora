#!/usr/bin/env python3
"""
WSGI application for Render deployment - Flask with survey endpoints
"""
from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3
import os

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

@app.route('/')
def home():
    return "Hello from Novora MVP API!"

@app.route('/health')
def health():
    return "Health check OK"

@app.route('/api/v1/health')
def api_health():
    return "API v1 health OK"

@app.route('/api/v1/surveys')
def get_surveys():
    """Get all surveys with survey links"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, title, description, survey_token, status, created_at 
            FROM surveys 
            ORDER BY created_at DESC
        """)
        
        surveys = []
        for row in cursor.fetchall():
            survey_id, title, description, survey_token, status, created_at = row
            
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
                "created_at": created_at
            })
        
        conn.close()
        return jsonify(surveys)
        
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

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
