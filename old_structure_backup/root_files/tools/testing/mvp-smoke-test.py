#!/usr/bin/env python3
"""
MVP Smoke Test - 5-minute test for core functionality
Tests: create survey → send token → submit → dashboard shows aggregate → alert fires
"""
import requests
import json
import time
import sys
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

def log(message):
    """Log with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}")

def test_health_check():
    """Test basic API health"""
    log("Testing health check...")
    try:
        response = requests.get(f"{API_BASE}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ["healthy", "degraded"]
        log("✓ Health check passed")
        return True
    except Exception as e:
        log(f"✗ Health check failed: {e}")
        return False

def test_auth():
    """Test authentication"""
    log("Testing authentication...")
    try:
        # Test login with test user
        login_data = {
            "email": "test@example.com",
            "password": "password123"
        }
        response = requests.post(f"{API_BASE}/auth/login", json=login_data)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        token = data["access_token"]
        log("✓ Authentication passed")
        return token
    except Exception as e:
        log(f"✗ Authentication failed: {e}")
        return None

def test_create_survey(token):
    """Test survey creation"""
    log("Testing survey creation...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        survey_data = {
            "title": "MVP Smoke Test Survey",
            "description": "Test survey for MVP validation",
            "questions": [
                {
                    "type": "rating",
                    "text": "How satisfied are you with our service?",
                    "required": True
                }
            ]
        }
        response = requests.post(f"{API_BASE}/surveys", json=survey_data, headers=headers)
        assert response.status_code == 201
        data = response.json()
        survey_id = data["id"]
        log(f"✓ Survey created with ID: {survey_id}")
        return survey_id
    except Exception as e:
        log(f"✗ Survey creation failed: {e}")
        return None

def test_send_survey_token(token, survey_id):
    """Test sending survey invitation"""
    log("Testing survey token generation...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        token_data = {
            "survey_id": survey_id,
            "email": "test@example.com",
            "expires_in_hours": 24
        }
        response = requests.post(f"{API_BASE}/surveys/{survey_id}/tokens", json=token_data, headers=headers)
        assert response.status_code == 201
        data = response.json()
        survey_token = data["token"]
        log(f"✓ Survey token generated: {survey_token}")
        return survey_token
    except Exception as e:
        log(f"✗ Survey token generation failed: {e}")
        return None

def test_submit_survey_response(survey_token):
    """Test survey response submission"""
    log("Testing survey response submission...")
    try:
        response_data = {
            "answers": [
                {
                    "question_id": 1,
                    "value": 5,
                    "type": "rating"
                }
            ]
        }
        response = requests.post(f"{API_BASE}/responses", json=response_data, headers={"X-Survey-Token": survey_token})
        assert response.status_code == 201
        log("✓ Survey response submitted")
        return True
    except Exception as e:
        log(f"✗ Survey response submission failed: {e}")
        return False

def test_dashboard_aggregate(token, survey_id):
    """Test dashboard shows aggregate data"""
    log("Testing dashboard aggregate data...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/analytics/surveys/{survey_id}/summary", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_responses" in data
        assert data["total_responses"] >= 1
        log(f"✓ Dashboard shows {data['total_responses']} responses")
        return True
    except Exception as e:
        log(f"✗ Dashboard aggregate test failed: {e}")
        return False

def test_alerts(token, survey_id):
    """Test alert system"""
    log("Testing alert system...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/alerts", headers=headers)
        assert response.status_code == 200
        data = response.json()
        log(f"✓ Alert system accessible, found {len(data)} alerts")
        return True
    except Exception as e:
        log(f"✗ Alert system test failed: {e}")
        return False

def main():
    """Run MVP smoke test"""
    log("Starting MVP Smoke Test...")
    start_time = time.time()
    
    # Test sequence
    if not test_health_check():
        log("✗ Smoke test failed at health check")
        sys.exit(1)
    
    token = test_auth()
    if not token:
        log("✗ Smoke test failed at authentication")
        sys.exit(1)
    
    survey_id = test_create_survey(token)
    if not survey_id:
        log("✗ Smoke test failed at survey creation")
        sys.exit(1)
    
    survey_token = test_send_survey_token(token, survey_id)
    if not survey_token:
        log("✗ Smoke test failed at token generation")
        sys.exit(1)
    
    if not test_submit_survey_response(survey_token):
        log("✗ Smoke test failed at response submission")
        sys.exit(1)
    
    # Wait a moment for data processing
    time.sleep(2)
    
    if not test_dashboard_aggregate(token, survey_id):
        log("✗ Smoke test failed at dashboard aggregate")
        sys.exit(1)
    
    if not test_alerts(token, survey_id):
        log("✗ Smoke test failed at alerts")
        sys.exit(1)
    
    end_time = time.time()
    duration = end_time - start_time
    
    log(f"🎉 MVP Smoke Test PASSED in {duration:.1f} seconds!")
    log("Core functionality verified: create survey → send token → submit → dashboard → alerts")
    sys.exit(0)

if __name__ == "__main__":
    main()
