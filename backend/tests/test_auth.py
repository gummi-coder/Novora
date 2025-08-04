"""
Unit tests for authentication endpoints
"""
import pytest
from fastapi import status

def test_register_success(client):
    """Test successful user registration"""
    response = client.post("/api/v1/auth/register", json={
        "email": "newuser@example.com",
        "password": "newpassword123",
        "company_name": "New Company"
    })
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert "user_id" in data
    assert "User registered successfully" in data["message"]

def test_register_duplicate_email(client, test_user):
    """Test registration with existing email"""
    response = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "newpassword123"
    })
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Email already registered" in response.json()["detail"]

def test_login_success(client, test_user):
    """Test successful login"""
    response = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "testpassword"
    })
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["email"] == "test@example.com"
    assert data["user_id"] == test_user.id

def test_login_invalid_credentials(client):
    """Test login with invalid credentials"""
    response = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "wrongpassword"
    })
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Invalid email or password" in response.json()["detail"]

def test_login_nonexistent_user(client):
    """Test login with non-existent user"""
    response = client.post("/api/v1/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "testpassword"
    })
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Invalid email or password" in response.json()["detail"]

def test_get_current_user(client, auth_headers):
    """Test getting current user info"""
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["role"] == "core"
    assert data["is_active"] == True

def test_get_current_user_unauthorized(client):
    """Test getting current user without authentication"""
    response = client.get("/api/v1/auth/me")
    
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_refresh_token(client, test_user):
    """Test token refresh"""
    # First login to get refresh token
    login_response = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "testpassword"
    })
    refresh_token = login_response.json()["refresh_token"]
    
    # Refresh the token
    response = client.post(f"/api/v1/auth/refresh?refresh_token={refresh_token}")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_refresh_token_invalid(client):
    """Test token refresh with invalid token"""
    response = client.post("/api/v1/auth/refresh?refresh_token=invalid_token")
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_logout(client, test_user):
    """Test logout"""
    # First login to get token
    login_response = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "testpassword"
    })
    access_token = login_response.json()["access_token"]
    
    # Logout
    response = client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {access_token}"})
    
    assert response.status_code == status.HTTP_200_OK
    assert "Logged out successfully" in response.json()["message"]

def test_forgot_password(client, test_user):
    """Test forgot password request"""
    response = client.post("/api/v1/auth/forgot-password", json={
        "email": "test@example.com"
    })
    
    assert response.status_code == status.HTTP_200_OK
    assert "password reset link has been sent" in response.json()["message"]

def test_forgot_password_nonexistent_user(client):
    """Test forgot password with non-existent user (should not reveal user existence)"""
    response = client.post("/api/v1/auth/forgot-password", json={
        "email": "nonexistent@example.com"
    })
    
    assert response.status_code == status.HTTP_200_OK
    assert "password reset link has been sent" in response.json()["message"]

def test_verify_email_invalid_token(client):
    """Test email verification with invalid token"""
    response = client.post("/api/v1/auth/verify-email", params={"token": "invalid_token"})
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Invalid or expired verification token" in response.json()["detail"]

def test_resend_verification(client, db_session):
    """Test resend verification email"""
    # Create an unverified user for this test
    from app.models.base import User
    from app.core.security import get_password_hash
    
    unverified_user = User(
        email="unverified@example.com",
        password_hash=get_password_hash("testpassword"),
        role="core",
        company_name="Test Company",
        is_active=True,
        is_email_verified=False  # Not verified
    )
    db_session.add(unverified_user)
    db_session.commit()
    
    response = client.post("/api/v1/auth/resend-verification?email=unverified@example.com")
    
    assert response.status_code == status.HTTP_200_OK
    assert "Verification email sent successfully" in response.json()["message"]

def test_resend_verification_nonexistent_user(client):
    """Test resend verification with non-existent user"""
    response = client.post("/api/v1/auth/resend-verification", params={"email": "nonexistent@example.com"})
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "User not found" in response.json()["detail"] 