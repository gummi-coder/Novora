"""
Unit tests for admin endpoints
"""
import pytest
from fastapi import status

def test_get_all_users_admin(client, admin_headers, test_user, test_admin_user):
    """Test admin getting all users"""
    response = client.get("/api/v1/admin/users", headers=admin_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 2  # admin user and test user
    user_emails = [user["email"] for user in data]
    assert "test@example.com" in user_emails
    assert "admin@example.com" in user_emails

def test_get_all_users_unauthorized(client, auth_headers):
    """Test non-admin user trying to get all users"""
    response = client.get("/api/v1/admin/users", headers=auth_headers)
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "Admin privileges required" in response.json()["detail"]

def test_get_all_users_no_auth(client):
    """Test getting all users without authentication"""
    response = client.get("/api/v1/admin/users")
    
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_get_user_admin(client, admin_headers, test_user):
    """Test admin getting specific user"""
    response = client.get(f"/api/v1/admin/users/{test_user.id}", headers=admin_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["role"] == "core"
    assert data["is_active"] == True

def test_get_user_not_found(client, admin_headers):
    """Test admin getting non-existent user"""
    response = client.get("/api/v1/admin/users/999", headers=admin_headers)
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "User not found" in response.json()["detail"]

def test_update_user_admin(client, admin_headers, test_user):
    """Test admin updating user"""
    update_data = {
        "role": "pro",
        "company_name": "Updated Company",
        "is_email_verified": True
    }
    
    response = client.put(f"/api/v1/admin/users/{test_user.id}", json=update_data, headers=admin_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["role"] == "pro"
    assert data["company_name"] == "Updated Company"
    assert data["is_email_verified"] == True

def test_update_user_not_found(client, admin_headers):
    """Test admin updating non-existent user"""
    update_data = {"role": "pro"}
    
    response = client.put("/api/v1/admin/users/999", json=update_data, headers=admin_headers)
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "User not found" in response.json()["detail"]

def test_delete_user_admin(client, admin_headers, test_user):
    """Test admin deactivating user"""
    response = client.delete(f"/api/v1/admin/users/{test_user.id}", headers=admin_headers)
    
    assert response.status_code == status.HTTP_200_OK
    assert "deactivated successfully" in response.json()["message"]

def test_delete_user_not_found(client, admin_headers):
    """Test admin deactivating non-existent user"""
    response = client.delete("/api/v1/admin/users/999", headers=admin_headers)
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "User not found" in response.json()["detail"]

def test_activate_user_admin(client, admin_headers, test_user):
    """Test admin activating user"""
    # First deactivate the user
    client.delete(f"/api/v1/admin/users/{test_user.id}", headers=admin_headers)
    
    # Then activate
    response = client.post(f"/api/v1/admin/users/{test_user.id}/activate", headers=admin_headers)
    
    assert response.status_code == status.HTTP_200_OK
    assert "activated successfully" in response.json()["message"]

def test_activate_user_not_found(client, admin_headers):
    """Test admin activating non-existent user"""
    response = client.post("/api/v1/admin/users/999/activate", headers=admin_headers)
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "User not found" in response.json()["detail"]

def test_reset_user_password_admin(client, admin_headers, test_user):
    """Test admin resetting user password"""
    response = client.post(f"/api/v1/admin/users/{test_user.id}/reset-password?new_password=newpassword123", 
                          headers=admin_headers)
    
    assert response.status_code == status.HTTP_200_OK
    assert "Password reset successfully" in response.json()["message"]

def test_reset_user_password_not_found(client, admin_headers):
    """Test admin resetting password for non-existent user"""
    response = client.post("/api/v1/admin/users/999/reset-password?new_password=newpassword123", 
                          headers=admin_headers)
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "User not found" in response.json()["detail"]

def test_get_user_stats_admin(client, admin_headers, test_user, test_admin_user):
    """Test admin getting user statistics"""
    response = client.get("/api/v1/admin/stats/users", headers=admin_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total_users"] == 2
    assert data["active_users"] == 2
    assert data["verified_users"] == 2
    assert data["admin_users"] == 1
    assert data["core_users"] == 1

def test_get_user_stats_unauthorized(client, auth_headers):
    """Test non-admin user trying to get user statistics"""
    response = client.get("/api/v1/admin/stats/users", headers=auth_headers)
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "Admin privileges required" in response.json()["detail"]

def test_admin_cannot_deactivate_self(client, admin_headers, test_admin_user):
    """Test admin cannot deactivate their own account"""
    update_data = {"is_active": False}
    
    response = client.put(f"/api/v1/admin/users/{test_admin_user.id}", 
                         json=update_data, 
                         headers=admin_headers)
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Cannot deactivate your own account" in response.json()["detail"]

def test_admin_cannot_delete_self(client, admin_headers, test_admin_user):
    """Test admin cannot delete their own account"""
    response = client.delete(f"/api/v1/admin/users/{test_admin_user.id}", headers=admin_headers)
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Cannot delete your own account" in response.json()["detail"]

def test_user_filtering_by_role(client, admin_headers, test_user, test_admin_user):
    """Test filtering users by role"""
    response = client.get("/api/v1/admin/users?role=core", headers=admin_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["role"] == "core"

def test_user_filtering_by_active_status(client, admin_headers, test_user, test_admin_user):
    """Test filtering users by active status"""
    response = client.get("/api/v1/admin/users?is_active=true", headers=admin_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 2
    assert all(user["is_active"] for user in data)

def test_user_search(client, admin_headers, test_user, test_admin_user):
    """Test searching users by email or company name"""
    response = client.get("/api/v1/admin/users?search=test", headers=admin_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert "test" in data[0]["email"]

def test_user_pagination(client, admin_headers, test_user, test_admin_user):
    """Test user pagination"""
    response = client.get("/api/v1/admin/users?skip=0&limit=1", headers=admin_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1  # Limited to 1 user 