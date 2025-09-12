#!/usr/bin/env python3
"""
Simple test script to verify deployment
"""
from flask import Flask
import os

app = Flask(__name__)

@app.route('/')
def root():
    return "DEPLOYMENT TEST - API is working!"

@app.route('/test')
def test():
    return "Test endpoint working!"

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"Starting test app on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
