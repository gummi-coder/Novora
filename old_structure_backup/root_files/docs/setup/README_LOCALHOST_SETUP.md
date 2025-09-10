# Novora Localhost Setup - Complete Guide

## 🚀 Quick Start

Your Novora survey platform is now running locally! Here's everything you need to know:

### 📍 URLs
- **Frontend (Home Page)**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### 🔐 Login Credentials

You can login with any of these accounts:

#### Admin User
- **Email**: admin@novora.com
- **Password**: admin123
- **Role**: Admin (Full access to all features)

#### Manager User  
- **Email**: manager@novora.com
- **Password**: manager123
- **Role**: Manager (Team-specific access)

#### Owner User
- **Email**: owner@novora.com
- **Password**: owner123
- **Role**: Owner (Company-wide access)

## 🎯 How to Use

### 1. Login from Home Page
1. Go to http://localhost:3000
2. Click "Login" or "Sign In"
3. Use any of the credentials above
4. You'll be redirected to the dashboard

### 2. Access Dashboard
After login, you'll see:
- **Overview**: Company-wide statistics and team performance
- **Team Trends**: Performance trends over time
- **Feedback**: Employee feedback and comments
- **Alerts**: Early warning system for issues
- **Surveys**: Create and manage surveys

### 3. Send Surveys to Employees
1. Navigate to the Surveys section
2. Click "Create New Survey" or "Launch Survey"
3. Fill in survey details:
   - Title and description
   - Questions (rating, multiple choice, text)
   - Target audience (all employees or specific teams)
4. Click "Launch Survey"
5. The system will automatically:
   - Generate unique invitation tokens
   - Send emails to employees
   - Track responses

## 🔧 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user info

### Dashboard
- `GET /api/v1/dashboard/stats` - Get dashboard statistics

### Surveys
- `GET /api/v1/surveys` - Get all surveys
- `POST /api/v1/surveys/launch` - Launch a new survey

### Example API Usage
```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@novora.com", "password": "admin123"}'

# Get dashboard stats (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/dashboard/stats

# Launch a survey
curl -X POST http://localhost:8000/api/v1/surveys/launch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Employee Satisfaction",
    "description": "Monthly pulse survey",
    "questions": [
      {"question": "How satisfied are you with your work?", "type": "rating"},
      {"question": "What could we improve?", "type": "text"}
    ],
    "target_audience": "all"
  }'
```

## 🎨 Features Available

### Dashboard Features
- **Real-time Statistics**: Live updates of survey responses
- **Team Performance**: Compare teams and track trends
- **Alert System**: Get notified of issues early
- **Feedback Analysis**: Sentiment analysis of comments

### Survey Features
- **Multiple Question Types**: Rating, multiple choice, text, etc.
- **Targeted Distribution**: Send to specific teams or all employees
- **Response Tracking**: Monitor participation and completion rates
- **Auto-pilot**: Schedule recurring surveys

### Role-based Access
- **Admin**: Full platform access
- **Manager**: Team-specific data and surveys
- **Owner**: Company-wide overview and management

## 🛠️ Troubleshooting

### If servers aren't running:
```bash
# Start backend
cd backend
source venv/bin/activate
python simple_auth_server.py

# Start frontend (in new terminal)
cd frontend
npm run dev
```

### If login doesn't work:
```bash
# Recreate test users
cd backend
source venv/bin/activate
python create_simple_users.py
```

### If you get CORS errors:
The backend is configured to allow requests from localhost:3000. If you see CORS errors, make sure both servers are running on the correct ports.

## 📊 Sample Data

The system comes with sample data including:
- 3 test users (admin, manager, owner)
- 2 sample surveys (active and draft)
- Mock dashboard statistics
- Sample team performance data

## 🚀 Next Steps

1. **Login** with admin@novora.com / admin123
2. **Explore** the dashboard features
3. **Create** your first survey
4. **Send** it to employees
5. **Monitor** responses and analytics

## 📞 Support

If you encounter any issues:
1. Check that both servers are running
2. Verify the URLs are correct
3. Try recreating the test users
4. Check the browser console for errors

---

**Happy surveying! 🎉**
