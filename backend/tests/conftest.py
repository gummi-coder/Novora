"""
Pytest configuration and fixtures for Novora Survey Platform tests
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import tempfile
import os

from app.main import app
from app.core.database import get_db, Base
from app.models.base import User, Survey, Question, Response, Answer, FileAttachment
from app.core.security import get_password_hash

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test"""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database dependency override"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db_session):
    """Create a test user"""
    user = User(
        email="test@example.com",
        password_hash=get_password_hash("testpassword"),
        role="core",
        company_name="Test Company",
        is_active=True,
        is_email_verified=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def test_admin_user(db_session):
    """Create a test admin user"""
    admin = User(
        email="admin@example.com",
        password_hash=get_password_hash("adminpassword"),
        role="admin",
        company_name="Admin Company",
        is_active=True,
        is_email_verified=True
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin

@pytest.fixture
def test_survey(db_session, test_user):
    """Create a test survey"""
    survey = Survey(
        title="Test Survey",
        description="A test survey for testing",
        creator_id=test_user.id,
        status="draft",
        is_anonymous=True,
        allow_comments=False,
        category="general"
    )
    db_session.add(survey)
    db_session.commit()
    db_session.refresh(survey)
    return survey

@pytest.fixture
def test_question(db_session, test_survey):
    """Create a test question"""
    question = Question(
        survey_id=test_survey.id,
        text="What is your favorite color?",
        type="text",
        required=True,
        order=1
    )
    db_session.add(question)
    db_session.commit()
    db_session.refresh(question)
    return question

@pytest.fixture
def auth_headers(client, test_user):
    """Get authentication headers for a test user"""
    response = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "testpassword"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def admin_headers(client, test_admin_user):
    """Get authentication headers for a test admin user"""
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@example.com",
        "password": "adminpassword"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def temp_upload_dir():
    """Create a temporary upload directory for file tests"""
    with tempfile.TemporaryDirectory() as temp_dir:
        yield temp_dir 