# Novora Survey Platform API Documentation

## Overview

The Novora Survey Platform API is a comprehensive REST API built with FastAPI that provides survey creation, management, and analytics capabilities. The API supports user authentication, survey management, file uploads, and admin functionality.

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require authentication via Bearer token in the Authorization header.

```
Authorization: Bearer <your_access_token>
```

## API Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "company_name": "Company Name"
}
```

**Response:**
```json
{
  "message": "User registered successfully. Please check your email for verification.",
  "user_id": 1,
  "email": "user@example.com"
}
```

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": 1,
  "email": "user@example.com",
  "role": "core"
}
```

#### Get Current User
```http
GET /auth/me
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "core",
  "company_name": "Company Name",
  "is_active": true,
  "is_email_verified": true,
  "created_at": "2024-01-01T00:00:00"
}
```

#### Refresh Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout
```http
POST /auth/logout
```

**Headers:** `Authorization: Bearer <token>`

#### Forgot Password
```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset_token_here",
  "new_password": "newpassword123"
}
```

#### Verify Email
```http
POST /auth/verify-email?token=verification_token_here
```

#### Resend Verification
```http
POST /auth/resend-verification?email=user@example.com
```

### Surveys

#### Get All Surveys
```http
GET /surveys?skip=0&limit=100
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Maximum number of records to return (default: 100)

**Response:**
```json
[
  {
    "id": 1,
    "title": "Customer Satisfaction Survey",
    "description": "Help us improve our services",
    "creator_id": 1,
    "status": "active",
    "start_date": "2024-01-01T00:00:00",
    "end_date": null,
    "is_anonymous": true,
    "allow_comments": false,
    "reminder_frequency": "weekly",
    "category": "customer_feedback",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00",
    "questions": [...],
    "response_count": 25,
    "attachments": [...]
  }
]
```

#### Create Survey
```http
POST /surveys
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Customer Satisfaction Survey",
  "description": "Help us improve our services",
  "is_anonymous": true,
  "allow_comments": false,
  "reminder_frequency": "weekly",
  "category": "customer_feedback",
  "questions": [
    {
      "text": "How satisfied are you with our service?",
      "type": "rating",
      "required": true,
      "order": 1,
      "options": {
        "min": 1,
        "max": 5,
        "labels": ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"]
      }
    },
    {
      "text": "What can we improve?",
      "type": "text",
      "required": false,
      "order": 2,
      "allow_comments": true
    }
  ]
}
```

#### Get Survey by ID
```http
GET /surveys/{survey_id}
```

**Headers:** `Authorization: Bearer <token>`

#### Update Survey
```http
PUT /surveys/{survey_id}
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Survey Title",
  "description": "Updated description",
  "status": "active"
}
```

#### Delete Survey
```http
DELETE /surveys/{survey_id}
```

**Headers:** `Authorization: Bearer <token>`

#### Activate Survey
```http
POST /surveys/{survey_id}/activate
```

**Headers:** `Authorization: Bearer <token>`

#### Close Survey
```http
POST /surveys/{survey_id}/close
```

**Headers:** `Authorization: Bearer <token>`

### File Uploads

#### Upload Survey Attachment
```http
POST /uploads/surveys/{survey_id}/attachments
```

**Headers:** `Authorization: Bearer <token>`

**Form Data:**
- `file`: File to upload (PDF, DOC, DOCX, TXT, Images, CSV, Excel, PowerPoint, ZIP, RAR)
- `description` (optional): Description of the attachment

**Response:**
```json
{
  "id": 1,
  "survey_id": 1,
  "filename": "unique_filename.pdf",
  "original_filename": "document.pdf",
  "file_size": 1024000,
  "mime_type": "application/pdf",
  "uploaded_by": 1,
  "uploaded_at": "2024-01-01T00:00:00",
  "description": "Survey instructions"
}
```

#### Get Survey Attachments
```http
GET /uploads/surveys/{survey_id}/attachments
```

**Headers:** `Authorization: Bearer <token>`

#### Download Attachment
```http
GET /uploads/attachments/{attachment_id}/download
```

**Headers:** `Authorization: Bearer <token>`

#### Delete Attachment
```http
DELETE /uploads/attachments/{attachment_id}
```

**Headers:** `Authorization: Bearer <token>`

#### Update Attachment Description
```http
PUT /uploads/attachments/{attachment_id}
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "description": "Updated description"
}
```

### Admin Endpoints

*Note: All admin endpoints require admin privileges*

#### Get All Users
```http
GET /admin/users?skip=0&limit=100&role=core&is_active=true&search=company
```

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `skip` (optional): Number of records to skip
- `limit` (optional): Maximum number of records to return
- `role` (optional): Filter by user role (core, pro, enterprise, admin)
- `is_active` (optional): Filter by active status
- `search` (optional): Search in email or company name

#### Get User by ID
```http
GET /admin/users/{user_id}
```

**Headers:** `Authorization: Bearer <admin_token>`

#### Update User
```http
PUT /admin/users/{user_id}
```

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "email": "updated@example.com",
  "role": "pro",
  "company_name": "Updated Company",
  "is_active": true,
  "is_email_verified": true
}
```

#### Deactivate User
```http
DELETE /admin/users/{user_id}
```

**Headers:** `Authorization: Bearer <admin_token>`

#### Activate User
```http
POST /admin/users/{user_id}/activate
```

**Headers:** `Authorization: Bearer <admin_token>`

#### Reset User Password
```http
POST /admin/users/{user_id}/reset-password
```

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "new_password": "newpassword123"
}
```

#### Get User Statistics
```http
GET /admin/stats/users
```

**Headers:** `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "total_users": 150,
  "active_users": 145,
  "verified_users": 140,
  "admin_users": 3,
  "core_users": 100,
  "pro_users": 35,
  "enterprise_users": 12
}
```

### Responses

#### Get Survey Responses
```http
GET /responses?survey_id=1&skip=0&limit=100
```

**Headers:** `Authorization: Bearer <token>`

#### Submit Survey Response
```http
POST /responses
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "survey_id": 1,
  "answers": [
    {
      "question_id": 1,
      "value": "5",
      "comment": "Great service!"
    },
    {
      "question_id": 2,
      "value": "Faster response times would be helpful",
      "comment": null
    }
  ]
}
```

### Analytics

#### Get Survey Analytics
```http
GET /analytics/surveys/{survey_id}
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "survey_id": 1,
  "total_responses": 150,
  "completion_rate": 85.5,
  "average_time": 180,
  "question_analytics": [
    {
      "question_id": 1,
      "question_text": "How satisfied are you?",
      "response_count": 150,
      "average_rating": 4.2,
      "rating_distribution": {
        "1": 5,
        "2": 10,
        "3": 25,
        "4": 60,
        "5": 50
      }
    }
  ]
}
```

## Error Responses

### Standard Error Format
```json
{
  "detail": "Error message description"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

### Example Error Responses

#### Authentication Error
```json
{
  "detail": "Invalid email or password"
}
```

#### Permission Error
```json
{
  "detail": "Admin privileges required"
}
```

#### Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- Authentication endpoints: 5 requests per minute
- General endpoints: 100 requests per minute
- File uploads: 10 requests per minute

## File Upload Limits

- Maximum file size: 10MB
- Allowed file types: PDF, DOC, DOCX, TXT, Images (JPG, PNG, GIF), CSV, Excel, PowerPoint, ZIP, RAR
- Files are stored securely with unique filenames

## Security Features

- JWT-based authentication with access and refresh tokens
- Password hashing using bcrypt
- Email verification for new accounts
- Password reset functionality
- Role-based access control (core, pro, enterprise, admin)
- File upload validation and sanitization
- CORS protection
- Rate limiting

## Development

### Running the API

```bash
# Install dependencies
pip install -r requirements.txt

# Initialize database
python init_database.py

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Interactive API Documentation

Once the server is running, you can access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Testing

```bash
# Run all tests
pytest

# Run specific test categories
pytest -m auth
pytest -m admin
pytest -m surveys

# Run with coverage
pytest --cov=app tests/
```

## Support

For API support and questions:
- Email: support@novora.com
- Documentation: https://docs.novora.com
- GitHub Issues: https://github.com/novora/survey-platform/issues 