from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Employee Survey Backend!"}

def test_create_survey():
    response = client.post(
        "/surveys",
        json={"title": "Test Survey", "questions": [{"text": "How satisfied are you?", "type": "scale"}]}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Survey"
    assert "id" in data

def test_submit_response():
    # First create a survey
    survey_response = client.post(
        "/surveys",
        json={"title": "Test Survey", "questions": [{"text": "How satisfied are you?", "type": "scale"}]}
    )
    survey_id = survey_response.json()["id"]

    # Submit a response
    response = client.post(
        f"/surveys/{survey_id}/respond",
        json={"survey_id": survey_id, "answers": [{"question_id": 1, "answer": 5}]}
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Response submitted successfully"}

def test_send_survey():
    # First create a survey
    survey_response = client.post(
        "/surveys",
        json={"title": "Test Survey", "questions": [{"text": "How satisfied are you?", "type": "scale"}]}
    )
    survey_id = survey_response.json()["id"]

    # Send survey email
    response = client.post(
        f"/surveys/{survey_id}/send",
        params={"to_email": "test@example.com"}
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Survey email sent"}

def test_trigger_monthly_survey():
    # First create a survey
    survey_response = client.post(
        "/surveys",
        json={"title": "Test Survey", "questions": [{"text": "How satisfied are you?", "type": "scale"}]}
    )
    survey_id = survey_response.json()["id"]

    # Trigger monthly survey
    response = client.post(
        f"/surveys/{survey_id}/send-monthly",
        json={"emails": ["test@example.com"]}
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Monthly survey task queued"} 