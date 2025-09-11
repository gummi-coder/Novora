#!/usr/bin/env python3
"""
FastAPI app for Render deployment
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app.main import create_app
import uvicorn

# Create the FastAPI app
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"Starting FastAPI app on port {port}")
    uvicorn.run(app, host='0.0.0.0', port=port)
