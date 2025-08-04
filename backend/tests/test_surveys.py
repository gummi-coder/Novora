"""
Unit tests for survey endpoints
"""
import pytest
from fastapi import status

def test_create_survey_success(client, auth_headers):
    """Test successful survey creation"""
    survey_data = {
        "title": "Test Survey",
        "description": "A test survey",
        "is_anonymous": True,
        "allow_comments": False,
        "category": "general",
        "questions": [
            {
                "text": "What is your favorite color?",
                "type": "text",
                "required": True,
                "order": 1
            }
        ]
    }
    
    response = client.post("/api/v1/surveys/", json=survey_data, headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Test Survey"
    assert data["description"] == "A test survey"
    assert data["status"] == "draft"
    assert len(data["questions"]) == 1
    assert data["questions"][0]["text"] == "What is your favorite color?"

def test_create_survey_unauthorized(client):
    """Test survey creation without authentication"""
    survey_data = {
        "title": "Test Survey",
        "description": "A test survey"
    }
    
    response = client.post("/api/v1/surveys/", json=survey_data)
    
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_get_surveys(client, auth_headers, test_survey):
    """Test getting user's surveys"""
    response = client.get("/api/v1/surveys/", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Test Survey"
    assert data[0]["id"] == test_survey.id

def test_get_surveys_unauthorized(client):
    """Test getting surveys without authentication"""
    response = client.get("/api/v1/surveys/")
    
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_get_survey_success(client, auth_headers, test_survey):
    """Test getting a specific survey"""
    response = client.get(f"/api/v1/surveys/{test_survey.id}", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Test Survey"
    assert data["id"] == test_survey.id

def test_get_survey_not_found(client, auth_headers):
    """Test getting a non-existent survey"""
    response = client.get("/api/v1/surveys/999", headers=auth_headers)
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "Survey not found" in response.json()["detail"]

def test_get_survey_unauthorized(client, test_survey):
    """Test getting survey without authentication"""
    response = client.get(f"/api/v1/surveys/{test_survey.id}")
    
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_update_survey_success(client, auth_headers, test_survey):
    """Test successful survey update"""
    update_data = {
        "title": "Updated Survey Title",
        "description": "Updated description"
    }
    
    response = client.put(f"/api/v1/surveys/{test_survey.id}", json=update_data, headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Updated Survey Title"
    assert data["description"] == "Updated description"

def test_update_survey_not_found(client, auth_headers):
    """Test updating a non-existent survey"""
    update_data = {"title": "Updated Title"}
    
    response = client.put("/api/v1/surveys/999", json=update_data, headers=auth_headers)
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "Survey not found" in response.json()["detail"]

def test_delete_survey_success(client, auth_headers, test_survey):
    """Test successful survey deletion"""
    response = client.delete(f"/api/v1/surveys/{test_survey.id}", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    assert "deleted successfully" in response.json()["message"]

def test_delete_survey_not_found(client, auth_headers):
    """Test deleting a non-existent survey"""
    response = client.delete("/api/v1/surveys/999", headers=auth_headers)
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "Survey not found" in response.json()["detail"]

def test_activate_survey_success(client, auth_headers, test_survey):
    """Test successful survey activation"""
    response = client.post(f"/api/v1/surveys/{test_survey.id}/activate", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    assert "activated successfully" in response.json()["message"]

def test_activate_survey_already_active(client, auth_headers, test_survey):
    """Test activating an already active survey"""
    # First activate the survey
    client.post(f"/api/v1/surveys/{test_survey.id}/activate", headers=auth_headers)
    
    # Try to activate again
    response = client.post(f"/api/v1/surveys/{test_survey.id}/activate", headers=auth_headers)
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Only draft surveys can be activated" in response.json()["detail"]

def test_close_survey_success(client, auth_headers, test_survey):
    """Test successful survey closure"""
    response = client.post(f"/api/v1/surveys/{test_survey.id}/close", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    assert "closed successfully" in response.json()["message"]

def test_close_survey_already_closed(client, auth_headers, test_survey):
    """Test closing an already closed survey"""
    # First close the survey
    client.post(f"/api/v1/surveys/{test_survey.id}/close", headers=auth_headers)
    
    # Try to close again
    response = client.post(f"/api/v1/surveys/{test_survey.id}/close", headers=auth_headers)
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Survey is already closed" in response.json()["detail"]

def test_survey_pagination(client, auth_headers, test_survey):
    """Test survey pagination"""
    response = client.get("/api/v1/surveys/?skip=0&limit=10", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1  # Only one survey in test data

def test_create_survey_with_multiple_questions(client, auth_headers):
    """Test creating survey with multiple questions"""
    survey_data = {
        "title": "Multi-Question Survey",
        "description": "Survey with multiple questions",
        "questions": [
            {
                "text": "What is your name?",
                "type": "text",
                "required": True,
                "order": 1
            },
            {
                "text": "What is your age?",
                "type": "text",
                "required": False,
                "order": 2
            },
            {
                "text": "What is your favorite color?",
                "type": "multiple_choice",
                "required": True,
                "order": 3,
                "options": {
                    "choices": ["Red", "Blue", "Green", "Yellow"]
                }
            }
        ]
    }
    
    response = client.post("/api/v1/surveys/", json=survey_data, headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data["questions"]) == 3
    assert data["questions"][0]["text"] == "What is your name?"
    assert data["questions"][1]["text"] == "What is your age?"
    assert data["questions"][2]["text"] == "What is your favorite color?"
    assert data["questions"][2]["options"]["choices"] == ["Red", "Blue", "Green", "Yellow"] 