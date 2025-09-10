#!/usr/bin/env python3
"""
Simple Flask app for Render deployment
"""
from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/')
def root():
    return "Novora MVP API is running!"

@app.route('/health')
def health():
    return "API is working"

@app.route('/api/v1/health')
def api_health():
    return "API v1 is working"

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"Starting Flask app on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
