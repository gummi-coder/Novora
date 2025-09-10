# Integration Guide

This guide covers the integration between frontend and backend, including communication, CORS configuration, and authentication flow.

## Overview

The Novora Survey Platform consists of:
- **Frontend**: React + Vite application (port 3000)
- **Backend**: FastAPI application (port 8000)
- **Database**: SQLite (development) / PostgreSQL (production)
- **Cache**: Redis (optional)

## Quick Start

### 1. Start Backend
```bash
cd Novora/backend
source venv/bin/activate
python main.py
```

### 2. Start Frontend
```bash
cd Novora/frontend
npm run dev
```

### 3. Run Integration Tests
```bash
# Backend tests
cd Novora/backend
python scripts/test_integration.py

# Frontend tests (in browser console)
cd Novora/frontend
npm run dev
# Then open browser console and run:
# import('./src/utils/integrationTest').then(m => m.runFrontendIntegrationTests())
```

## API Communication

### Base URLs

**Development:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- API: `http://localhost:8000/api/v1`

**Production:**
- Frontend: `https://app.novora.com`
- Backend: `https://api.novora.com`
- API: `https://api.novora.com/api/v1`

### API Endpoints

#### Authentication
```typescript
// Register user
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "company_name": "Example Corp"
}

// Login
POST /api/v1/auth/login
{
  "username": "user@example.com",
  "password": "password123"
}

// Get current user
GET /api/v1/users/me
Authorization: Bearer <token>
```

#### Surveys
```typescript
// Get all surveys
GET /api/v1/surveys
Authorization: Bearer <token>

// Create survey
POST /api/v1/surveys
Authorization: Bearer <token>
{
  "title": "Employee Satisfaction",
  "description": "Annual employee satisfaction survey",
  "status": "DRAFT"
}
```

#### Health Checks
```typescript
// Basic health
GET /health

// API health with services
GET /api/v1/health

// Redis health
GET /api/v1/health/redis
```

## CORS Configuration

### Backend CORS Setup

The backend automatically configures CORS based on environment:

**Development:**
```python
# Allows all localhost origins
cors_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]
```

**Production:**
```python
# Only allows specific domains
cors_origins = [
    "https://novora.com",
    "https://www.novora.com",
    "https://app.novora.com",
]
```

### Frontend CORS Handling

The frontend uses a proxy in development mode:

**Development (Vite Proxy):**
```typescript
// Request to /api/surveys
fetch('/api/surveys')

// Gets proxied to http://localhost:8000/api/surveys
// No CORS issues
```

**Production (Direct Calls):**
```typescript
// Request to /api/surveys
fetch('/api/surveys')

// Goes directly to https://api.novora.com/api/v1/surveys
// CORS handled by backend
```

## Authentication Flow

### 1. User Registration
```typescript
// Frontend
const response = await api.register(email, password, companyName);

// Backend response
{
  "message": "User registered successfully",
  "user_id": 123,
  "email": "user@example.com"
}
```

### 2. User Login
```typescript
// Frontend
const response = await api.login(email, password);

// Backend response
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "email": "user@example.com",
  "user_id": 123
}
```

### 3. Token Storage
```typescript
// Store token in localStorage
localStorage.setItem('token', response.access_token);

// Include in API requests
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
};
```

### 4. Authenticated Requests
```typescript
// Frontend API client automatically includes token
const surveys = await api.getSurveys();

// Backend validates token
@router.get("/surveys")
async def get_surveys(current_user: User = Depends(get_current_user)):
    # current_user is automatically validated
    return db.query(Survey).filter(Survey.company_id == current_user.company_id).all()
```

## Error Handling

### Backend Error Responses
```typescript
// 401 Unauthorized
{
  "error": "Invalid email or password",
  "status_code": 401,
  "timestamp": "2024-12-19T10:00:00Z"
}

// 403 Forbidden
{
  "error": "Insufficient permissions",
  "status_code": 403,
  "timestamp": "2024-12-19T10:00:00Z"
}

// 500 Internal Server Error
{
  "error": "Internal server error",
  "status_code": 500,
  "timestamp": "2024-12-19T10:00:00Z"
}
```

### Frontend Error Handling
```typescript
// API client with retry logic
class ApiClient {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<T> {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(response.status, error.message || 'An error occurred');
      }
      
      return response.json();
    } catch (error) {
      // Retry on network errors
      if (retryCount < this.retryAttempts && this.shouldRetry(error)) {
        await this.delay(Math.pow(2, retryCount) * 1000);
        return this.makeRequest<T>(endpoint, options, retryCount + 1);
      }
      
      throw error;
    }
  }
}
```

## Integration Testing

### Backend Integration Tests
```bash
# Run all backend integration tests
cd Novora/backend
python scripts/test_integration.py

# Test specific endpoint
python scripts/test_integration.py --base-url http://localhost:8000
```

**Test Coverage:**
- ✅ Backend health check
- ✅ API health check
- ✅ CORS preflight requests
- ✅ User registration
- ✅ User login
- ✅ Authenticated endpoints
- ✅ Survey endpoints
- ✅ Frontend API compatibility

### Frontend Integration Tests
```typescript
// Run frontend integration tests
import { runFrontendIntegrationTests } from '@/utils/integrationTest';

const success = await runFrontendIntegrationTests();
console.log('Integration tests:', success ? 'PASSED' : 'FAILED');
```

**Test Coverage:**
- ✅ Environment configuration
- ✅ API health check
- ✅ User registration
- ✅ User login
- ✅ Authenticated endpoints
- ✅ Survey endpoints
- ✅ API error handling
- ✅ CORS compatibility
- ✅ Feature flags

## Environment Configuration

### Backend Environment
```bash
# Development
ENVIRONMENT=development
DEBUG=true
DATABASE_URL=sqlite:///./novora.db

# Production
ENVIRONMENT=production
DEBUG=false
DATABASE_URL=postgresql://user:pass@host:port/db
```

### Frontend Environment
```bash
# Development
VITE_APP_ENVIRONMENT=development
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_DEBUG=true

# Production
VITE_APP_ENVIRONMENT=production
VITE_API_BASE_URL=https://api.novora.com
VITE_APP_DEBUG=false
```

## Troubleshooting

### Common Issues

#### 1. CORS Errors
```bash
# Error: Access to fetch at 'http://localhost:8000/api/v1/health' from origin 'http://localhost:3000' has been blocked by CORS policy

# Solution: Check backend CORS configuration
# Ensure http://localhost:3000 is in BACKEND_CORS_ORIGINS
```

#### 2. Authentication Errors
```bash
# Error: 401 Unauthorized

# Solution: Check token storage and inclusion
localStorage.getItem('token')  # Should return valid token
# Ensure Authorization header is included: Bearer <token>
```

#### 3. API Connection Errors
```bash
# Error: Failed to fetch

# Solution: Check backend is running
curl http://localhost:8000/health
# Should return: {"status": "healthy", ...}
```

#### 4. Database Connection Errors
```bash
# Error: Database connection failed

# Solution: Check database setup
cd Novora/backend
python -c "from app.core.database import check_database_connection; print(check_database_connection())"
# Should return: True
```

### Debug Mode

#### Backend Debug
```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Check CORS headers
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    print(f"Response: {response.status_code}")
    return response
```

#### Frontend Debug
```typescript
// Enable API debugging
import { debug } from '@/config/environment';
debug('API request:', { url, method, headers });

// Check environment configuration
import { config } from '@/config/environment';
console.log('Environment:', config);
```

## Performance Optimization

### Backend Optimizations
```python
# Connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
)

# Caching
from app.core.cache import cache
@cache(ttl=3600)
def get_surveys(user_id: int):
    return db.query(Survey).filter(Survey.user_id == user_id).all()
```

### Frontend Optimizations
```typescript
// Request caching
const surveys = useQuery(['surveys'], api.getSurveys, {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});

// Retry logic
const apiClient = new ApiClient({
  retryAttempts: 3,
  timeout: 30000,
});
```

## Security Considerations

### Backend Security
```python
# JWT token validation
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user(user_id)
    if user is None:
        raise credentials_exception
    return user

# Rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
```

### Frontend Security
```typescript
// Secure token storage
const secureStorage = {
  setToken: (token: string) => {
    // In production, consider using httpOnly cookies
    localStorage.setItem('token', token);
  },
  
  getToken: () => {
    return localStorage.getItem('token');
  },
  
  clearToken: () => {
    localStorage.removeItem('token');
  }
};

// Token refresh
const refreshToken = async () => {
  try {
    const response = await api.refreshToken();
    secureStorage.setToken(response.access_token);
  } catch (error) {
    // Redirect to login
    window.location.href = '/login';
  }
};
```

## Monitoring and Logging

### Backend Monitoring
```python
# Health check endpoints
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": settings.VERSION,
        "timestamp": datetime.utcnow().isoformat()
    }

# Request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    logger.info(
        f"{request.method} {request.url} - {response.status_code} - {process_time:.3f}s"
    )
    return response
```

### Frontend Monitoring
```typescript
// API request monitoring
const apiMonitor = {
  logRequest: (endpoint: string, method: string, duration: number) => {
    console.log(`API ${method} ${endpoint} - ${duration}ms`);
  },
  
  logError: (endpoint: string, error: Error) => {
    console.error(`API Error ${endpoint}:`, error);
  }
};

// Performance monitoring
const performanceMonitor = {
  measureApiCall: async (apiCall: () => Promise<any>) => {
    const start = performance.now();
    try {
      const result = await apiCall();
      const duration = performance.now() - start;
      apiMonitor.logRequest('endpoint', 'GET', duration);
      return result;
    } catch (error) {
      apiMonitor.logError('endpoint', error);
      throw error;
    }
  }
};
```

## Deployment Checklist

### Pre-Deployment
- [ ] Run integration tests
- [ ] Check CORS configuration
- [ ] Verify authentication flow
- [ ] Test error handling
- [ ] Check performance metrics

### Production Deployment
- [ ] Set environment variables
- [ ] Configure SSL certificates
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test all endpoints

### Post-Deployment
- [ ] Monitor error rates
- [ ] Check response times
- [ ] Verify CORS headers
- [ ] Test authentication
- [ ] Monitor API usage

## Support

For integration issues:

1. **Check the logs** for error messages
2. **Run integration tests** to identify specific issues
3. **Verify CORS configuration** matches your environment
4. **Check authentication tokens** are properly stored and sent
5. **Test API endpoints** directly with curl or Postman
6. **Review this documentation** for common solutions

### Getting Help

- **Backend Issues**: Check `Novora/backend/logs/`
- **Frontend Issues**: Check browser console
- **CORS Issues**: Verify `BACKEND_CORS_ORIGINS` configuration
- **Authentication Issues**: Check token storage and validation
- **API Issues**: Test endpoints directly with curl
