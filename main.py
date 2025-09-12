#!/usr/bin/env python3
"""
Simple Flask app for Render deployment
"""
from flask import Flask
import os

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST', 'PUT', 'DELETE'])
def root():
    return "Novora MVP API is running!"

@app.route('/health', methods=['GET', 'POST', 'PUT', 'DELETE'])
def health():
    return "API is working"

@app.route('/api/v1/health', methods=['GET', 'POST', 'PUT', 'DELETE'])
def api_health():
    return "API v1 is working"

@app.errorhandler(404)
def not_found(error):
    return "Endpoint not found", 404

@app.errorhandler(500)
def internal_error(error):
    return "Internal server error", 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"Starting Flask app on port {port}")
    print(f"App routes: {[rule.rule for rule in app.url_map.iter_rules()]}")
    app.run(host='0.0.0.0', port=port, debug=True)
