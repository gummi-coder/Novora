from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
import os

# Create base class
Base = declarative_base()

# Simple User model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    role = Column(String(20), nullable=False, default='manager')
    company_name = Column(String(120))
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    is_email_verified = Column(Boolean, default=False)

# Database setup
DATABASE_URL = "sqlite:///./novora.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    company_name: str

class SurveyLaunchRequest(BaseModel):
    title: str
    description: str
    questions: list
    target_audience: str = "all"
    path: str = "template"
    schedule: dict = {}
    branding: dict = {}

class SurveyLaunchResponse(BaseModel):
    success: bool
    message: str
    survey_id: str
    invite_count: int

# FastAPI app
app = FastAPI(title="Novora Auth API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user_by_email(db, email: str):
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = get_user_by_email(db, email=email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@app.post("/api/v1/auth/login", response_model=LoginResponse)
def login(request: LoginRequest, db = Depends(get_db)):
    user = authenticate_user(db, request.email, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "company_name": user.company_name
        }
    )

@app.get("/api/v1/auth/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        company_name=current_user.company_name
    )

@app.post("/api/v1/surveys/launch", response_model=SurveyLaunchResponse)
def launch_survey(request: SurveyLaunchRequest, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    """Launch a survey and generate invitations for employees"""
    try:
        # Generate a unique survey ID
        import uuid
        survey_id = str(uuid.uuid4())
        
        # Simulate employee count (in real app, this would come from database)
        employee_count = 25  # Mock data
        
        # Simulate generating unique tokens and sending emails
        print(f"Launching survey: {request.title}")
        print(f"Target audience: {request.target_audience}")
        print(f"Questions: {len(request.questions)}")
        print(f"Generating {employee_count} unique invitation tokens...")
        print(f"Sending emails to {employee_count} employees...")
        
        # In a real implementation, you would:
        # 1. Save survey to database
        # 2. Generate unique tokens for each employee
        # 3. Send emails with unique links
        # 4. Schedule reminders
        
        return SurveyLaunchResponse(
            success=True,
            message=f"Survey '{request.title}' launched successfully! {employee_count} invitations sent.",
            survey_id=survey_id,
            invite_count=employee_count
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to launch survey: {str(e)}")

@app.get("/api/v1/surveys", response_model=dict)
def get_surveys(current_user: User = Depends(get_current_user)):
    """Get all surveys for the current user"""
    # Mock survey data
    surveys = [
        {
            "id": "1",
            "title": "Employee Satisfaction Survey",
            "status": "active",
            "response_rate": 78,
            "total_participants": 25,
            "created_at": "2024-01-15T10:00:00Z"
        },
        {
            "id": "2", 
            "title": "Team Collaboration Feedback",
            "status": "draft",
            "response_rate": 0,
            "total_participants": 0,
            "created_at": "2024-01-14T15:30:00Z"
        }
    ]
    
    return {"surveys": surveys}

@app.get("/api/v1/dashboard/stats", response_model=dict)
def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    """Get dashboard statistics"""
    return {
        "total_teams": 5,
        "active_surveys": 2,
        "total_responses": 234,
        "avg_participation": 78,
        "response_rate": 78,
        "alerts_count": 3,
        "avg_score": 7.2,
        "score_change": 0.3
    }

@app.get("/")
def read_root():
    return {"message": "Novora Auth API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
