#!/usr/bin/env python3
"""
WSGI application for Render deployment
"""
from flask import Flask, jsonify
import sqlite3
import os

app = Flask(__name__)

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
        # Try different database paths
        db_paths = ["backend/mvp_surveys.db", "mvp_surveys.db"]
        db_path = None
        for path in db_paths:
            if os.path.exists(path):
                db_path = path
                break
        
        if not db_path:
            return jsonify({"error": "Database not found"}), 500
            
        conn = sqlite3.connect(db_path)
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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"Starting WSGI app on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
