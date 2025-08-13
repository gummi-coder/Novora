"""
API Integration Tests for Novora Survey Platform
"""
import pytest
import asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import json
import os
import sys

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from app.main import app
from app.core.database import get_db, Base
from app.core.config import settings
from app.models.base import User, Company, Survey, Question, Response
from app.core.auth import create_access_token

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

class TestAPIIntegration:
    """Comprehensive API integration tests"""
    
    @pytest.fixture(autouse=True)
    def setup_database(self):
        """Setup test database"""
        Base.metadata.create_all(bind=engine)
        yield
        Base.metadata.drop_all(bind=engine)
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)
    
    @pytest.fixture
    def test_user(self):
        """Create test user"""
        return {
            "email": "test@example.com",
            "password": "testpassword123",
            "first_name": "Test",
            "last_name": "User",
            "role": "owner"
        }
    
    @pytest.fixture
    def test_company(self):
        """Create test company"""
        return {
            "name": "Test Company",
            "industry": "Technology",
            "size": "10-50"
        }
    
    @pytest.fixture
    def auth_headers(self, client, test_user):
        """Get authentication headers"""
        # Register user
        response = client.post("/api/v1/auth/register", json=test_user)
        assert response.status_code == 201
        
        # Login to get token
        login_data = {
            "username": test_user["email"],
            "password": test_user["password"]
        }
        response = client.post("/api/v1/auth/login", data=login_data)
        assert response.status_code == 200
        
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_health_endpoints(self, client):
        """Test health check endpoints"""
        # Test root health check
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "environment" in data
        assert "version" in data
        
        # Test API health check
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "environment" in data
        assert "services" in data
        
        # Test Redis health check
        response = client.get("/api/v1/health/redis")
        assert response.status_code == 200
    
    def test_auth_endpoints(self, client, test_user):
        """Test authentication endpoints"""
        # Test user registration
        response = client.post("/api/v1/auth/register", json=test_user)
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["email"] == test_user["email"]
        assert "password" not in data
        
        # Test duplicate registration
        response = client.post("/api/v1/auth/register", json=test_user)
        assert response.status_code == 400
        
        # Test login
        login_data = {
            "username": test_user["email"],
            "password": test_user["password"]
        }
        response = client.post("/api/v1/auth/login", data=login_data)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        
        # Test invalid login
        invalid_login = {
            "username": test_user["email"],
            "password": "wrongpassword"
        }
        response = client.post("/api/v1/auth/login", data=invalid_login)
        assert response.status_code == 401
        
        # Test refresh token
        refresh_data = {"refresh_token": data.get("refresh_token", "")}
        if refresh_data["refresh_token"]:
            response = client.post("/api/v1/auth/refresh", json=refresh_data)
            assert response.status_code == 200
    
    def test_user_management(self, client, auth_headers, test_user):
        """Test user management endpoints"""
        # Test get current user
        response = client.get("/api/v1/users/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user["email"]
        
        # Test update user profile
        update_data = {
            "first_name": "Updated",
            "last_name": "Name"
        }
        response = client.put("/api/v1/users/me", json=update_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "Updated"
        assert data["last_name"] == "Name"
        
        # Test change password
        password_data = {
            "current_password": test_user["password"],
            "new_password": "newpassword123"
        }
        response = client.put("/api/v1/users/me/password", json=password_data, headers=auth_headers)
        assert response.status_code == 200
    
    def test_company_management(self, client, auth_headers, test_company):
        """Test company management endpoints"""
        # Test create company
        response = client.post("/api/v1/companies", json=test_company, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == test_company["name"]
        company_id = data["id"]
        
        # Test get company
        response = client.get(f"/api/v1/companies/{company_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == test_company["name"]
        
        # Test update company
        update_data = {"name": "Updated Company"}
        response = client.put(f"/api/v1/companies/{company_id}", json=update_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Company"
        
        # Test list companies
        response = client.get("/api/v1/companies", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
    
    def test_survey_management(self, client, auth_headers):
        """Test survey management endpoints"""
        # Create test company first
        company_data = {"name": "Test Company", "industry": "Technology", "size": "10-50"}
        response = client.post("/api/v1/companies", json=company_data, headers=auth_headers)
        company_id = response.json()["id"]
        
        # Test create survey
        survey_data = {
            "title": "Test Survey",
            "description": "A test survey",
            "company_id": company_id,
            "survey_type": "employee_feedback",
            "status": "draft"
        }
        response = client.post("/api/v1/surveys", json=survey_data, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == survey_data["title"]
        survey_id = data["id"]
        
        # Test get survey
        response = client.get(f"/api/v1/surveys/{survey_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == survey_data["title"]
        
        # Test update survey
        update_data = {"title": "Updated Survey"}
        response = client.put(f"/api/v1/surveys/{survey_id}", json=update_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Survey"
        
        # Test list surveys
        response = client.get("/api/v1/surveys", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        
        # Test delete survey
        response = client.delete(f"/api/v1/surveys/{survey_id}", headers=auth_headers)
        assert response.status_code == 204
    
    def test_question_management(self, client, auth_headers):
        """Test question management endpoints"""
        # Create test survey first
        company_data = {"name": "Test Company", "industry": "Technology", "size": "10-50"}
        response = client.post("/api/v1/companies", json=company_data, headers=auth_headers)
        company_id = response.json()["id"]
        
        survey_data = {
            "title": "Test Survey",
            "description": "A test survey",
            "company_id": company_id,
            "survey_type": "employee_feedback",
            "status": "draft"
        }
        response = client.post("/api/v1/surveys", json=survey_data, headers=auth_headers)
        survey_id = response.json()["id"]
        
        # Test create question
        question_data = {
            "text": "How satisfied are you with your work?",
            "question_type": "rating",
            "survey_id": survey_id,
            "required": True,
            "options": ["1", "2", "3", "4", "5"]
        }
        response = client.post("/api/v1/questions", json=question_data, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["text"] == question_data["text"]
        question_id = data["id"]
        
        # Test get question
        response = client.get(f"/api/v1/questions/{question_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["text"] == question_data["text"]
        
        # Test update question
        update_data = {"text": "Updated question text"}
        response = client.put(f"/api/v1/questions/{question_id}", json=update_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["text"] == "Updated question text"
        
        # Test list questions
        response = client.get(f"/api/v1/surveys/{survey_id}/questions", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
    
    def test_response_management(self, client, auth_headers):
        """Test response management endpoints"""
        # Create test survey and question
        company_data = {"name": "Test Company", "industry": "Technology", "size": "10-50"}
        response = client.post("/api/v1/companies", json=company_data, headers=auth_headers)
        company_id = response.json()["id"]
        
        survey_data = {
            "title": "Test Survey",
            "description": "A test survey",
            "company_id": company_id,
            "survey_type": "employee_feedback",
            "status": "active"
        }
        response = client.post("/api/v1/surveys", json=survey_data, headers=auth_headers)
        survey_id = response.json()["id"]
        
        question_data = {
            "text": "How satisfied are you?",
            "question_type": "rating",
            "survey_id": survey_id,
            "required": True,
            "options": ["1", "2", "3", "4", "5"]
        }
        response = client.post("/api/v1/questions", json=question_data, headers=auth_headers)
        question_id = response.json()["id"]
        
        # Test submit response
        response_data = {
            "survey_id": survey_id,
            "answers": [
                {
                    "question_id": question_id,
                    "answer": "4"
                }
            ]
        }
        response = client.post("/api/v1/responses", json=response_data, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["survey_id"] == survey_id
        response_id = data["id"]
        
        # Test get response
        response = client.get(f"/api/v1/responses/{response_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["survey_id"] == survey_id
        
        # Test list responses
        response = client.get(f"/api/v1/surveys/{survey_id}/responses", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
    
    def test_analytics_endpoints(self, client, auth_headers):
        """Test analytics endpoints"""
        # Test get survey analytics
        response = client.get("/api/v1/analytics/surveys", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_surveys" in data
        assert "active_surveys" in data
        assert "completed_surveys" in data
        
        # Test get response analytics
        response = client.get("/api/v1/analytics/responses", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_responses" in data
        assert "response_rate" in data
    
    def test_question_bank_endpoints(self, client, auth_headers):
        """Test question bank endpoints"""
        # Test get question bank
        response = client.get("/api/v1/question-bank", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Test get questions by category
        response = client.get("/api/v1/question-bank/category/employee_satisfaction", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_auto_pilot_endpoints(self, client, auth_headers):
        """Test auto-pilot endpoints"""
        # Test get auto-pilot plans
        response = client.get("/api/v1/auto-pilot/plans", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Test create auto-pilot plan
        plan_data = {
            "name": "Test Auto-Pilot Plan",
            "description": "A test auto-pilot plan",
            "schedule_type": "weekly",
            "survey_template_id": 1,
            "is_active": True
        }
        response = client.post("/api/v1/auto-pilot/plans", json=plan_data, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == plan_data["name"]
        plan_id = data["id"]
        
        # Test get auto-pilot plan
        response = client.get(f"/api/v1/auto-pilot/plans/{plan_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == plan_data["name"]
    
    def test_production_endpoints(self, client, auth_headers):
        """Test production management endpoints"""
        # Test SSL status
        response = client.get("/api/v1/production/ssl/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "ssl_enabled" in data
        assert "certificate_exists" in data
        
        # Test system metrics
        response = client.get("/api/v1/production/metrics/system", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "timestamp" in data
        assert "system" in data
        
        # Test health check
        response = client.post("/api/v1/production/health/check", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "checks" in data
        
        # Test system info
        response = client.get("/api/v1/production/system/info", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "platform" in data
        assert "python_version" in data
        
        # Test backup list
        response = client.get("/api/v1/production/backup/list", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "backups" in data
        assert "count" in data
    
    def test_error_handling(self, client, auth_headers):
        """Test error handling"""
        # Test 404 for non-existent resource
        response = client.get("/api/v1/surveys/999999", headers=auth_headers)
        assert response.status_code == 404
        
        # Test 400 for invalid data
        invalid_data = {"invalid_field": "invalid_value"}
        response = client.post("/api/v1/surveys", json=invalid_data, headers=auth_headers)
        assert response.status_code == 422
        
        # Test 401 for missing authentication
        response = client.get("/api/v1/users/me")
        assert response.status_code == 401
        
        # Test 403 for invalid token
        invalid_headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/v1/users/me", headers=invalid_headers)
        assert response.status_code == 401
    
    def test_cors_headers(self, client):
        """Test CORS headers"""
        response = client.options("/api/v1/health")
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers
    
    def test_rate_limiting(self, client, auth_headers):
        """Test rate limiting (if implemented)"""
        # Make multiple requests to test rate limiting
        for _ in range(10):
            response = client.get("/api/v1/users/me", headers=auth_headers)
            # Should not be rate limited for normal usage
            assert response.status_code in [200, 429]

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
