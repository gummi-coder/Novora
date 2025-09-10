#!/usr/bin/env python3
"""
WSGI application for Render deployment
"""
from flask import Flask
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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"Starting WSGI app on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
