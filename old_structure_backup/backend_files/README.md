# Novora Survey Platform - Backend API

A comprehensive survey platform built with FastAPI, featuring user management, survey creation, file uploads, and analytics.

## 🚀 Features

### Core Functionality
- **User Authentication**: JWT-based authentication with email verification
- **Survey Management**: Create, edit, activate, and close surveys
- **Question Types**: Text, multiple choice, rating, and more
- **File Attachments**: Upload and manage survey-related files
- **Response Collection**: Anonymous and authenticated survey responses
- **Analytics**: Survey response analytics and insights

### Admin Features
- **User Management**: Admin panel for user administration
- **Role-based Access**: Core, Pro, Enterprise, and Admin roles
- **Statistics Dashboard**: User and survey statistics
- **Password Management**: Admin password reset capabilities

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt password encryption
- **Email Verification**: Account verification system
- **File Validation**: Secure file upload with type validation
- **CORS Protection**: Cross-origin request protection
- **Rate Limiting**: API rate limiting to prevent abuse

## 🛠️ Technology Stack

- **Framework**: FastAPI (Python 3.13+)
- **Database**: SQLAlchemy with SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT with python-jose
- **Password Hashing**: bcrypt with passlib
- **File Uploads**: FastAPI UploadFile with validation
- **Email**: SMTP integration for notifications
- **Testing**: pytest with FastAPI TestClient
- **Documentation**: Auto-generated OpenAPI/Swagger docs

## 📋 Prerequisites

- Python 3.13 or higher
- pip (Python package manager)
- Virtual environment (recommended)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Navigate to backend directory
cd Novora/backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=sqlite:///./novora.db

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email (optional for development)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# File Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB in bytes
```

### 3. Initialize Database

```bash
# Initialize database and create admin user
python init_database.py
```

This creates:
- All database tables
- Admin user: `admin@novora.com` / `admin123`

### 4. Start the Server

```bash
# Development server with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Access the API

- **API Base URL**: http://localhost:8000/api/v1
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/api/v1/health

## 📚 API Documentation

### Authentication

```bash
# Register a new user
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "company_name": "My Company"}'

# Login
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Surveys

```bash
# Create a survey (requires authentication)
curl -X POST "http://localhost:8000/api/v1/surveys/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Customer Satisfaction",
    "description": "Help us improve our services",
    "questions": [
      {
        "text": "How satisfied are you?",
        "type": "rating",
        "required": true,
        "order": 1
      }
    ]
  }'

# Get user's surveys
curl -X GET "http://localhost:8000/api/v1/surveys/" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Admin Operations

```bash
# Get all users (admin only)
curl -X GET "http://localhost:8000/api/v1/admin/users" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Get user statistics
curl -X GET "http://localhost:8000/api/v1/admin/stats/users" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## 🧪 Testing

### Run All Tests

```bash
# Run complete test suite
pytest

# Run with verbose output
pytest -v

# Run specific test categories
pytest -m auth      # Authentication tests
pytest -m admin     # Admin tests
pytest -m surveys   # Survey tests
```

### Test Results

- **Total Tests**: 58
- **Pass Rate**: 72.4% (42 passed, 16 failed)
- **Coverage**: Comprehensive test suite implemented

See [TEST_SUMMARY.md](tests/TEST_SUMMARY.md) for detailed test results.

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── deps.py              # FastAPI dependencies
│   │   └── v1/
│   │       ├── api.py           # Main API router
│   │       └── endpoints/
│   │           ├── auth.py      # Authentication endpoints
│   │           ├── surveys.py   # Survey management
│   │           ├── admin.py     # Admin endpoints
│   │           ├── uploads.py   # File uploads
│   │           ├── responses.py # Survey responses
│   │           └── analytics.py # Analytics
│   ├── core/
│   │   ├── config.py            # Configuration settings
│   │   ├── database.py          # Database setup
│   │   ├── security.py          # Security utilities
│   │   └── email.py             # Email service
│   ├── models/
│   │   └── base.py              # SQLAlchemy models
│   └── main.py                  # FastAPI application
├── tests/
│   ├── conftest.py              # Pytest configuration
│   ├── test_auth.py             # Authentication tests
│   ├── test_surveys.py          # Survey tests
│   ├── test_admin.py            # Admin tests
│   └── TEST_SUMMARY.md          # Test results
├── docs/
│   └── API_DOCUMENTATION.md     # Comprehensive API docs
├── migrations/                  # Database migrations
├── requirements.txt             # Python dependencies
├── init_database.py            # Database initialization
└── README.md                   # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `sqlite:///./novora.db` |
| `SECRET_KEY` | JWT secret key | `your-super-secret-key` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT access token expiry | `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | JWT refresh token expiry | `7` |
| `SMTP_SERVER` | SMTP server for emails | `None` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USERNAME` | SMTP username | `None` |
| `SMTP_PASSWORD` | SMTP password | `None` |
| `UPLOAD_DIR` | File upload directory | `./uploads` |
| `MAX_FILE_SIZE` | Maximum file size in bytes | `10485760` (10MB) |

### Database Models

- **User**: User accounts with roles and verification
- **Survey**: Survey definitions with questions
- **Question**: Survey questions with different types
- **Response**: Survey responses from users
- **Answer**: Individual question answers
- **FileAttachment**: Survey file attachments
- **EmailVerificationToken**: Email verification tokens
- **PasswordResetToken**: Password reset tokens
- **UserSession**: User session management

## 🚀 Deployment

### Production Setup

1. **Database**: Use PostgreSQL instead of SQLite
2. **Environment**: Set production environment variables
3. **Security**: Change default secret keys
4. **Email**: Configure SMTP for production
5. **File Storage**: Use cloud storage (AWS S3, etc.)

### Docker Deployment

```dockerfile
FROM python:3.13-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables for Production

```env
DATABASE_URL=postgresql://user:password@localhost/novora
SECRET_KEY=your-production-secret-key
SMTP_SERVER=smtp.provider.com
SMTP_USERNAME=your-email@domain.com
SMTP_PASSWORD=your-app-password
UPLOAD_DIR=/app/uploads
```

## 🔒 Security Considerations

- **JWT Tokens**: Secure token generation and validation
- **Password Hashing**: bcrypt with salt for password security
- **File Uploads**: Type validation and size limits
- **CORS**: Configured for cross-origin requests
- **Rate Limiting**: API rate limiting implementation
- **Input Validation**: Pydantic models for request validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: [API Documentation](docs/API_DOCUMENTATION.md)
- **Issues**: Create an issue on GitHub
- **Email**: support@novora.com

## 🎯 Roadmap

### Completed ✅
- [x] User authentication and authorization
- [x] Survey CRUD operations
- [x] Admin user management
- [x] File upload functionality
- [x] Email integration
- [x] Comprehensive testing suite
- [x] API documentation

### Planned 🔄
- [ ] Advanced analytics and reporting
- [ ] Survey templates and cloning
- [ ] Real-time notifications
- [ ] API rate limiting improvements
- [ ] Performance optimizations
- [ ] Mobile API endpoints

---

**Novora Survey Platform** - Building better surveys, one response at a time! 📊 