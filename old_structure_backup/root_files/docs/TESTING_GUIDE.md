# Testing Guide for Novora Survey Platform

This guide covers all aspects of testing the Novora Survey Platform, including unit tests, integration tests, end-to-end tests, and production testing.

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Backend Testing](#backend-testing)
3. [Frontend Testing](#frontend-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [Production Testing](#production-testing)
6. [Test Data Management](#test-data-management)
7. [Continuous Integration](#continuous-integration)
8. [Performance Testing](#performance-testing)
9. [Security Testing](#security-testing)
10. [Best Practices](#best-practices)

## Testing Overview

### Testing Pyramid

The Novora platform follows the testing pyramid approach:

```
    /\
   /  \     E2E Tests (Few)
  /____\    Integration Tests (Some)
 /______\   Unit Tests (Many)
```

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test API endpoints and component interactions
- **End-to-End Tests**: Test complete user workflows
- **Production Tests**: Test production-specific features

### Test Types

1. **Unit Tests**: Fast, isolated tests for individual functions
2. **Component Tests**: Frontend component testing with React Testing Library
3. **API Tests**: Backend endpoint testing with FastAPI TestClient
4. **Integration Tests**: Cross-component and service integration testing
5. **E2E Tests**: Full user workflow testing with Playwright
6. **Production Tests**: SSL, monitoring, backup, and deployment testing

## Backend Testing

### Setup

**Install Dependencies:**
```bash
cd Novora/backend
pip install -r requirements/dev.txt
```

**Run Tests:**
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_api_integration.py

# Run with verbose output
pytest -v

# Run tests in parallel
pytest -n auto
```

### Test Structure

```
Novora/backend/tests/
├── test_api_integration.py      # API integration tests
├── test_production_features.py  # Production feature tests
├── conftest.py                  # Test configuration
└── fixtures/                    # Test fixtures
    ├── users.py
    ├── surveys.py
    └── responses.py
```

### API Integration Tests

**Example Test:**
```python
def test_create_survey(client, auth_headers):
    """Test survey creation endpoint"""
    survey_data = {
        "title": "Test Survey",
        "description": "A test survey",
        "survey_type": "employee_feedback"
    }
    
    response = client.post("/api/v1/surveys", 
                          json=survey_data, 
                          headers=auth_headers)
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == survey_data["title"]
```

### Test Fixtures

**User Authentication:**
```python
@pytest.fixture
def auth_headers(client, test_user):
    """Get authentication headers"""
    # Register and login user
    response = client.post("/api/v1/auth/register", json=test_user)
    response = client.post("/api/v1/auth/login", data={
        "username": test_user["email"],
        "password": test_user["password"]
    })
    
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
```

### Database Testing

**Test Database Setup:**
```python
@pytest.fixture(autouse=True)
def setup_database():
    """Setup test database"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
```

## Frontend Testing

### Setup

**Install Dependencies:**
```bash
cd Novora/frontend
npm install
```

**Run Tests:**
```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- SurveyBuilder.test.tsx
```

### Test Structure

```
Novora/frontend/src/tests/
├── components/                  # Component tests
│   ├── SurveyBuilder.test.tsx
│   ├── Dashboard.test.tsx
│   └── Auth.test.tsx
├── hooks/                       # Custom hook tests
│   ├── useAuth.test.ts
│   └── useSurvey.test.ts
├── utils/                       # Utility function tests
│   └── helpers.test.ts
├── setup.ts                     # Test setup
└── mocks/                       # Mock data
    ├── api.ts
    └── auth.ts
```

### Component Testing

**Example Test:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { SurveyBuilderSteps } from '../SurveyBuilderSteps';

describe('SurveyBuilderSteps', () => {
  it('renders all steps correctly', () => {
    render(<SurveyBuilderSteps />);
    
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Questions')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('allows navigation between steps', async () => {
    render(<SurveyBuilderSteps />);
    
    fireEvent.change(screen.getByLabelText(/Survey Title/i), {
      target: { value: 'Test Survey' }
    });
    
    fireEvent.click(screen.getByText('Next'));
    
    await waitFor(() => {
      expect(screen.getByText('Add Questions')).toBeInTheDocument();
    });
  });
});
```

### Mocking

**API Service Mocking:**
```typescript
vi.mock('../../services/survey', () => ({
  createSurvey: vi.fn(),
  updateSurvey: vi.fn(),
  getSurvey: vi.fn(),
  getQuestionBank: vi.fn(() => Promise.resolve([
    {
      id: 1,
      text: "How satisfied are you?",
      category: "employee_satisfaction",
      question_type: "rating"
    }
  ]))
}));
```

**Auth Context Mocking:**
```typescript
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'test@example.com', role: 'owner' },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn()
  })
}));
```

## End-to-End Testing

### Setup

**Install Playwright:**
```bash
cd Novora/frontend
npm run test:e2e:install
```

**Run E2E Tests:**
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug

# Run specific test
npm run test:e2e -- surveyWorkflow.test.ts
```

### Test Structure

```
Novora/frontend/src/tests/e2e/
├── surveyWorkflow.test.ts       # Survey creation workflow
├── authWorkflow.test.ts         # Authentication workflow
├── analyticsWorkflow.test.ts    # Analytics workflow
├── global-setup.ts              # Global test setup
└── global-teardown.ts           # Global test cleanup
```

### E2E Test Example

```typescript
test('Complete survey creation workflow', async ({ page }) => {
  await login(page);
  await createSurvey(page);
  
  // Verify survey was created
  await page.goto('/surveys');
  await expect(page.locator(`text=${testSurvey.title}`)).toBeVisible();
});

async function createSurvey(page: Page) {
  await page.goto('/surveys/create');
  
  // Step 1: Basic Information
  await page.fill('[data-testid="survey-title-input"]', testSurvey.title);
  await page.fill('[data-testid="survey-description-input"]', testSurvey.description);
  await page.click('[data-testid="next-step-button"]');
  
  // Step 2: Questions
  await page.waitForSelector('[data-testid="questions-step"]');
  await page.click('[data-testid="add-question-bank-button"]');
  await page.click('[data-testid="question-item-1"]');
  await page.click('[data-testid="add-question-button"]');
  await page.click('[data-testid="next-step-button"]');
  
  // Continue through all steps...
}
```

### Test Data Management

**Global Setup:**
```typescript
async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Setup test database and data
  await setupTestData(page);
  
  await browser.close();
}
```

## Production Testing

### SSL/TLS Testing

**Test SSL Configuration:**
```python
def test_ssl_config_initialization(self):
    """Test SSL configuration initialization"""
    config = SSLConfig()
    assert config.cert_file == "certs/cert.pem"
    assert config.key_file == "certs/key.pem"
    assert config.enable_ssl is False

def test_ssl_context_creation_enabled(self):
    """Test SSL context creation when SSL is enabled"""
    config = SSLConfig()
    config.enable_ssl = True
    
    with patch('ssl.create_default_context') as mock_ssl:
        mock_context = MagicMock()
        mock_ssl.return_value = mock_context
        config.get_ssl_context()
        
        mock_ssl.assert_called_once()
        mock_context.load_cert_chain.assert_called_once()
```

### Monitoring Testing

**Test Health Checks:**
```python
def test_database_health_check(self):
    """Test database health check"""
    checker = HealthChecker()
    
    # Test healthy database
    with patch('app.core.database.check_database_connection', return_value=True):
        result = checker._check_database()
        assert result["status"] == "healthy"
    
    # Test unhealthy database
    with patch('app.core.database.check_database_connection', return_value=False):
        result = checker._check_database()
        assert result["status"] == "unhealthy"
```

### Backup Testing

**Test Backup Creation:**
```python
def test_sqlite_backup_creation(self):
    """Test SQLite backup creation"""
    manager = BackupManager()
    
    with patch('pathlib.Path.exists', return_value=True):
        with patch('shutil.copy2'):
            with patch('builtins.open', create=True):
                success, message = manager._create_sqlite_backup("test_backup")
                
                assert success is True
                assert "SQLite backup created" in message
```

## Test Data Management

### Test Fixtures

**User Fixtures:**
```python
@pytest.fixture
def test_user():
    return {
        "email": "test@example.com",
        "password": "testpassword123",
        "first_name": "Test",
        "last_name": "User",
        "role": "owner"
    }

@pytest.fixture
def test_company():
    return {
        "name": "Test Company",
        "industry": "Technology",
        "size": "10-50"
    }
```

**Survey Fixtures:**
```python
@pytest.fixture
def test_survey():
    return {
        "title": "Employee Satisfaction Survey",
        "description": "A comprehensive survey",
        "survey_type": "employee_feedback",
        "status": "draft"
    }
```

### Database Seeding

**Test Data Setup:**
```python
def setup_test_data():
    """Setup test data for all tests"""
    # Create test users
    test_users = [
        {"email": "owner@test.com", "role": "owner"},
        {"email": "admin@test.com", "role": "admin"},
        {"email": "user@test.com", "role": "user"}
    ]
    
    for user_data in test_users:
        create_test_user(user_data)
    
    # Create test companies
    test_companies = [
        {"name": "Tech Corp", "industry": "Technology"},
        {"name": "Finance Inc", "industry": "Finance"}
    ]
    
    for company_data in test_companies:
        create_test_company(company_data)
```

## Continuous Integration

### GitHub Actions

**Backend CI:**
```yaml
name: Backend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install -r requirements/dev.txt
      - name: Run tests
        run: |
          pytest --cov=app --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

**Frontend CI:**
```yaml
name: Frontend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm run test:run
      - name: Run E2E tests
        run: npm run test:e2e
```

### Test Reports

**Coverage Reports:**
```bash
# Generate HTML coverage report
pytest --cov=app --cov-report=html

# Generate XML coverage report for CI
pytest --cov=app --cov-report=xml

# Generate coverage badge
pytest --cov=app --cov-report=term-missing
```

## Performance Testing

### Load Testing

**API Load Testing:**
```python
import asyncio
import aiohttp
import time

async def load_test_api():
    """Load test the API endpoints"""
    async with aiohttp.ClientSession() as session:
        tasks = []
        for i in range(100):
            task = asyncio.create_task(
                session.get('http://localhost:8000/api/v1/health')
            )
            tasks.append(task)
        
        start_time = time.time()
        responses = await asyncio.gather(*tasks)
        end_time = time.time()
        
        success_count = sum(1 for r in responses if r.status == 200)
        print(f"Success rate: {success_count/len(responses)*100}%")
        print(f"Total time: {end_time - start_time:.2f}s")
```

### Frontend Performance Testing

**Component Performance:**
```typescript
import { render } from '@testing-library/react';
import { performance } from 'perf_hooks';

test('SurveyBuilder renders within performance budget', () => {
  const start = performance.now();
  
  render(<SurveyBuilderSteps />);
  
  const end = performance.now();
  const renderTime = end - start;
  
  expect(renderTime).toBeLessThan(100); // 100ms budget
});
```

## Security Testing

### Authentication Testing

**Test Authentication Flow:**
```python
def test_authentication_flow(client):
    """Test complete authentication flow"""
    # Test registration
    user_data = {
        "email": "test@example.com",
        "password": "securepassword123",
        "first_name": "Test",
        "last_name": "User"
    }
    
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 201
    
    # Test login
    login_data = {
        "username": user_data["email"],
        "password": user_data["password"]
    }
    
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
    
    # Test protected endpoint
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
```

### Authorization Testing

**Test Role-Based Access:**
```python
def test_role_based_access(client):
    """Test role-based access control"""
    # Create users with different roles
    owner_user = create_test_user({"role": "owner"})
    admin_user = create_test_user({"role": "admin"})
    regular_user = create_test_user({"role": "user"})
    
    # Test owner access
    owner_token = login_user(owner_user)
    response = client.get("/api/v1/admin/users", 
                         headers={"Authorization": f"Bearer {owner_token}"})
    assert response.status_code == 200
    
    # Test regular user access (should be denied)
    user_token = login_user(regular_user)
    response = client.get("/api/v1/admin/users", 
                         headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 403
```

## Best Practices

### Test Organization

1. **Group Related Tests**: Use describe blocks to group related tests
2. **Clear Test Names**: Use descriptive test names that explain the scenario
3. **Arrange-Act-Assert**: Structure tests with clear sections
4. **Test Isolation**: Each test should be independent and not rely on others

### Test Data

1. **Use Fixtures**: Create reusable test data with fixtures
2. **Clean Up**: Always clean up test data after tests
3. **Realistic Data**: Use realistic test data that matches production
4. **Edge Cases**: Test edge cases and error conditions

### Performance

1. **Fast Tests**: Keep unit tests fast (< 100ms each)
2. **Parallel Execution**: Run tests in parallel when possible
3. **Mock External Dependencies**: Mock external services and APIs
4. **Database Transactions**: Use database transactions for test isolation

### Maintenance

1. **Update Tests**: Keep tests updated with code changes
2. **Remove Obsolete Tests**: Remove tests for removed functionality
3. **Monitor Test Coverage**: Maintain good test coverage
4. **Review Test Quality**: Regularly review and improve test quality

### Documentation

1. **Test Documentation**: Document complex test scenarios
2. **Setup Instructions**: Provide clear setup instructions
3. **Troubleshooting**: Document common test issues and solutions
4. **Examples**: Provide examples of common test patterns

## Running All Tests

**Complete Test Suite:**
```bash
# Backend tests
cd Novora/backend
pytest --cov=app --cov-report=html

# Frontend tests
cd Novora/frontend
npm run test:all

# All tests together
npm run test:all && cd ../backend && pytest
```

**Test Coverage Goals:**
- Unit Tests: > 90%
- Integration Tests: > 80%
- E2E Tests: > 70%
- Overall Coverage: > 85%

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure test database is properly configured
2. **Environment Variables**: Set required environment variables for tests
3. **Dependencies**: Install all required test dependencies
4. **Port Conflicts**: Use different ports for test servers

### Debugging Tests

1. **Verbose Output**: Use `-v` flag for detailed test output
2. **Debug Mode**: Use `--pdb` for Python tests or `--debug` for Playwright
3. **Test Isolation**: Run individual tests to isolate issues
4. **Logs**: Check test logs for error details

This testing guide provides comprehensive coverage of all testing aspects for the Novora Survey Platform. Regular testing ensures code quality, reliability, and maintainability.
