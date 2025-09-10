from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
import os
import uuid
import secrets
import hashlib
from typing import List, Optional

# Create base class
Base = declarative_base()

# Employee Model
class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True)
    email = Column(String(120), unique=True, nullable=False)
    name = Column(String(100))
    department = Column(String(100))
    team = Column(String(100))
    status = Column(String(20), default='active')  # active, inactive
    company_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    survey_invites = relationship("SurveyInvite", back_populates="employee")

# Survey Model
class Survey(Base):
    __tablename__ = "surveys"
    id = Column(String(36), primary_key=True)  # UUID
    title = Column(String(200), nullable=False)
    description = Column(Text)
    creator_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    status = Column(String(20), default='draft')  # draft, launched, closed
    launch_at = Column(DateTime)
    close_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    invites = relationship("SurveyInvite", back_populates="survey")

# Survey Invite Model (NO PII in token row)
class SurveyInvite(Base):
    __tablename__ = "survey_invites"
    id = Column(String(36), primary_key=True)  # UUID
    survey_id = Column(String(36), ForeignKey('surveys.id'), nullable=False)
    employee_id = Column(Integer, ForeignKey('employees.id'), nullable=True)  # nullable for privacy
    token = Column(String(64), unique=True, nullable=False)  # opaque random token
    token_hash = Column(String(64), unique=True, nullable=False, index=True)  # SHA-256 hash
    sent_at = Column(DateTime, default=datetime.utcnow)
    used_at = Column(DateTime, nullable=True)  # null until first valid submission
    channel = Column(String(20), default='email')  # email, slack, etc.
    department = Column(String(100))  # denormalized for aggregate stats
    
    # Relationships
    survey = relationship("Survey", back_populates="invites")
    employee = relationship("Employee", back_populates="survey_invites")
    responses = relationship("SurveyResponse", back_populates="invite")

# Survey Response Model
class SurveyResponse(Base):
    __tablename__ = "survey_responses"
    id = Column(String(36), primary_key=True)  # UUID
    survey_id = Column(String(36), ForeignKey('surveys.id'), nullable=False)
    invite_id = Column(String(36), ForeignKey('survey_invites.id'), nullable=False)
    answers_json = Column(JSON, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    invite = relationship("SurveyInvite", back_populates="responses")

# User Model (existing)
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

# Server pepper for token hashing
SERVER_PEPPER = "novora-server-pepper-2024"

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

class EmployeeCreate(BaseModel):
    email: str
    name: str
    department: str
    team: Optional[str] = None

class EmployeeResponse(BaseModel):
    id: int
    email: str
    name: str
    department: str
    team: Optional[str]
    status: str

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

class SurveyInviteResponse(BaseModel):
    id: str
    survey_id: str
    token: str
    sent_at: datetime
    used_at: Optional[datetime]

# FastAPI app
app = FastAPI(title="Novora Survey Invitation System")

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

def generate_unique_token():
    """Generate a unique, opaque token"""
    return secrets.token_urlsafe(32)  # 32 bytes = 256 bits

def hash_token(token: str):
    """Hash token with server pepper"""
    return hashlib.sha256((token + SERVER_PEPPER).encode()).hexdigest()

def create_sample_employees(db, company_id: int):
    """Create sample employees for testing"""
    sample_employees = [
        {"email": "john.doe@company.com", "name": "John Doe", "department": "Engineering", "team": "Frontend"},
        {"email": "jane.smith@company.com", "name": "Jane Smith", "department": "Marketing", "team": "Digital"},
        {"email": "mike.johnson@company.com", "name": "Mike Johnson", "department": "Sales", "team": "Enterprise"},
        {"email": "sarah.wilson@company.com", "name": "Sarah Wilson", "department": "HR", "team": "Recruitment"},
        {"email": "david.brown@company.com", "name": "David Brown", "department": "Engineering", "team": "Backend"},
        {"email": "lisa.garcia@company.com", "name": "Lisa Garcia", "department": "Design", "team": "UI/UX"},
        {"email": "tom.lee@company.com", "name": "Tom Lee", "department": "Product", "team": "Strategy"},
        {"email": "emma.davis@company.com", "name": "Emma Davis", "department": "Finance", "team": "Accounting"},
        {"email": "alex.chen@company.com", "name": "Alex Chen", "department": "Engineering", "team": "DevOps"},
        {"email": "rachel.green@company.com", "name": "Rachel Green", "department": "Customer Success", "team": "Support"}
    ]
    
    for emp_data in sample_employees:
        existing = db.query(Employee).filter(Employee.email == emp_data["email"]).first()
        if not existing:
            employee = Employee(
                email=emp_data["email"],
                name=emp_data["name"],
                department=emp_data["department"],
                team=emp_data["team"],
                company_id=company_id,
                status="active"
            )
            db.add(employee)
    
    db.commit()

# API Endpoints

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

@app.get("/api/v1/employees", response_model=List[EmployeeResponse])
def get_employees(current_user: User = Depends(get_current_user), db = Depends(get_db)):
    """Get all employees for the current user's company"""
    employees = db.query(Employee).filter(Employee.company_id == current_user.id).all()
    return [EmployeeResponse(
        id=emp.id,
        email=emp.email,
        name=emp.name,
        department=emp.department,
        team=emp.team,
        status=emp.status
    ) for emp in employees]

@app.post("/api/v1/employees", response_model=EmployeeResponse)
def create_employee(employee: EmployeeCreate, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    """Create a new employee"""
    existing = db.query(Employee).filter(Employee.email == employee.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee with this email already exists")
    
    new_employee = Employee(
        email=employee.email,
        name=employee.name,
        department=employee.department,
        team=employee.team,
        company_id=current_user.id,
        status="active"
    )
    
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    
    return EmployeeResponse(
        id=new_employee.id,
        email=new_employee.email,
        name=new_employee.name,
        department=new_employee.department,
        team=new_employee.team,
        status=new_employee.status
    )

@app.post("/api/v1/surveys/launch", response_model=SurveyLaunchResponse)
def launch_survey(request: SurveyLaunchRequest, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    """Launch a survey and generate invitations for all employees"""
    try:
        # Generate unique survey ID
        survey_id = str(uuid.uuid4())
        
        # Create survey record
        survey = Survey(
            id=survey_id,
            title=request.title,
            description=request.description,
            creator_id=current_user.id,
            status="launched",
            launch_at=datetime.utcnow()
        )
        db.add(survey)
        
        # Get all active employees for this company
        employees = db.query(Employee).filter(
            Employee.company_id == current_user.id,
            Employee.status == "active"
        ).all()
        
        # If no employees exist, create sample employees for testing
        if not employees:
            create_sample_employees(db, current_user.id)
            employees = db.query(Employee).filter(
                Employee.company_id == current_user.id,
                Employee.status == "active"
            ).all()
        
        invite_count = 0
        
        # Generate unique invitation for each employee
        for employee in employees:
            # Generate unique token
            token = generate_unique_token()
            token_hash = hash_token(token)
            
            # Create survey invite
            invite = SurveyInvite(
                id=str(uuid.uuid4()),
                survey_id=survey_id,
                employee_id=employee.id,
                token=token,
                token_hash=token_hash,
                channel="email",
                department=employee.department
            )
            db.add(invite)
            invite_count += 1
            
            # In a real implementation, you would send email here
            print(f"📧 Sending survey invitation to {employee.email}")
            print(f"🔗 Unique link: https://app.novora.com/s/r/{token}")
            print(f"📊 Employee: {employee.name} ({employee.department})")
            print("---")
        
        db.commit()
        
        print(f"✅ Survey '{request.title}' launched successfully!")
        print(f"📨 {invite_count} invitations generated and sent")
        print(f"🆔 Survey ID: {survey_id}")
        
        return SurveyLaunchResponse(
            success=True,
            message=f"Survey '{request.title}' launched successfully! {invite_count} invitations sent.",
            survey_id=survey_id,
            invite_count=invite_count
        )
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error launching survey: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to launch survey: {str(e)}")

@app.get("/s/r/{token}")
def get_survey_by_token(token: str, db = Depends(get_db)):
    """Get survey by token (for employees)"""
    token_hash = hash_token(token)
    invite = db.query(SurveyInvite).filter(SurveyInvite.token_hash == token_hash).first()
    
    if not invite:
        raise HTTPException(status_code=404, detail="Link not found or expired")
    
    survey = db.query(Survey).filter(Survey.id == invite.survey_id).first()
    if not survey or survey.status != "launched":
        raise HTTPException(status_code=400, detail="Survey not available")
    
    # Check if already used
    if invite.used_at:
        return {
            "status": "completed",
            "message": "This survey has already been completed. Thank you for your response!",
            "survey_id": survey.id,
            "title": survey.title
        }
    
    # Return survey data for active survey
    return {
        "status": "active",
        "survey_id": survey.id,
        "title": survey.title,
        "description": survey.description,
        "message": "Your anonymous one-time link for employees. We don't collect names, emails, or IDs.",
        "questions": [
            {
                "id": 1,
                "text": "How satisfied are you with your work?",
                "type": "rating",
                "options": ["Very dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very satisfied"]
            },
            {
                "id": 2,
                "text": "How likely are you to recommend this company as a place to work?",
                "type": "rating",
                "options": ["Very unlikely", "Unlikely", "Neutral", "Likely", "Very likely"]
            },
            {
                "id": 3,
                "text": "Do you have any additional comments or suggestions?",
                "type": "text",
                "optional": True
            }
        ]
    }

@app.post("/s/r/{token}/submit")
def submit_survey_response(token: str, answers: dict, db = Depends(get_db)):
    """Submit survey response (for employees)"""
    token_hash = hash_token(token)
    invite = db.query(SurveyInvite).filter(SurveyInvite.token_hash == token_hash).first()
    
    if not invite:
        raise HTTPException(status_code=404, detail="Link not found or expired")
    
    if invite.used_at:
        raise HTTPException(status_code=400, detail="Link already used")
    
    survey = db.query(Survey).filter(Survey.id == invite.survey_id).first()
    if not survey or survey.status != "launched":
        raise HTTPException(status_code=400, detail="Survey not available")
    
    try:
        # Create response
        response = SurveyResponse(
            id=str(uuid.uuid4()),
            survey_id=survey.id,
            invite_id=invite.id,
            answers_json=answers
        )
        db.add(response)
        
        # Mark invite as used
        invite.used_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "success": True,
            "message": "Thank you for your response! Your answers are anonymous and secure."
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to submit response")

@app.get("/")
def read_root():
    return {"message": "Novora Survey Invitation System"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
