# Employee Survey Backend

A Flask-based backend for managing employee surveys.

## Setup

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file with the following content:
```
FLASK_APP=app.py
FLASK_ENV=development
DATABASE_URL=postgresql://localhost/employee_survey
JWT_SECRET_KEY=your-super-secret-key-2024
```

4. Initialize the database:
```bash
python init_db.py
```

5. Run the application:
```bash
flask run
```

The server will start on http://localhost:3000

## API Endpoints

### Authentication
- POST /api/auth/signin - Sign in
- POST /api/auth/signup - Sign up
- GET /api/auth/me - Get current user

### Surveys
- GET /api/surveys - List surveys
- POST /api/surveys - Create survey
- GET /api/surveys/<id> - Get survey
- PUT /api/surveys/<id> - Update survey
- DELETE /api/surveys/<id> - Delete survey

### Responses
- POST /api/responses - Submit response
- GET /api/responses/survey/<id> - Get survey responses
- GET /api/responses/user - Get user responses
- GET /api/responses/<id> - Get response

## Default Admin User
- Email: admin@novora.is
- Password: admin123 