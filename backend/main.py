from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8080", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Models
class User(BaseModel):
    id: str
    email: str
    name: str
    role: str
    is_active: bool = True
    status: str = "active"
    createdAt: str = datetime.utcnow().isoformat()
    updatedAt: str = datetime.utcnow().isoformat()
    lastLogin: Optional[str] = None

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    role: str = "user"

class Company(BaseModel):
    id: str
    name: str
    description: str

class CompanyCreate(BaseModel):
    name: str
    description: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# Mock database
users_db = {}
companies_db = {}
invoices_db = {}

# Initialize test user
def init_test_user():
    if "test@example.com" not in users_db:
        users_db["test@example.com"] = {
            "id": "1",
            "email": "test@example.com",
            "name": "Test User",
            "role": "user",
            "is_active": True,
            "status": "active",
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat(),
            "lastLogin": None,
            "hashed_password": get_password_hash("password123")
        }

# Initialize test user
init_test_user()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = users_db.get(token_data.email)
    if user is None:
        raise credentials_exception
    return user

# CORS preflight handler
@app.options("/auth/login")
async def options_login():
    return {"message": "OK"}

# Auth endpoints - Removed conflicting endpoints, using proper auth router instead

# Auth endpoints - Removed conflicting endpoints, using proper auth router instead

# User management endpoints
@app.get("/users", response_model=dict)
async def list_users(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    users = [User(**user) for user in users_db.values()]
    return {"users": users, "total": len(users)}

@app.post("/users/{user_id}/activate")
async def activate_user(user_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    for user in users_db.values():
        if user["id"] == user_id:
            user["is_active"] = True
            user["status"] = "active"
            user["updatedAt"] = datetime.utcnow().isoformat()
            return User(**user)
    raise HTTPException(status_code=404, detail="User not found")

@app.post("/users/{user_id}/deactivate")
async def deactivate_user(user_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    for user in users_db.values():
        if user["id"] == user_id:
            user["is_active"] = False
            user["status"] = "inactive"
            user["updatedAt"] = datetime.utcnow().isoformat()
            return User(**user)
    raise HTTPException(status_code=404, detail="User not found")

@app.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    for email, user in users_db.items():
        if user["id"] == user_id:
            del users_db[email]
            return {"message": "User deleted successfully"}
    raise HTTPException(status_code=404, detail="User not found")

# Company management endpoints
@app.get("/companies", response_model=List[Company])
async def list_companies(current_user: User = Depends(get_current_user)):
    return [Company(**company) for company in companies_db.values()]

@app.post("/companies", response_model=Company)
async def create_company(company: CompanyCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    company_id = str(len(companies_db) + 1)
    company_dict = company.dict()
    company_dict["id"] = company_id
    companies_db[company_id] = company_dict
    return company_dict

@app.delete("/companies/{company_id}")
async def delete_company(company_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    if company_id not in companies_db:
        raise HTTPException(status_code=404, detail="Company not found")
    del companies_db[company_id]
    return {"message": "Company deleted"}

# Billing endpoints
@app.get("/billing/invoices")
async def list_invoices(current_user: User = Depends(get_current_user)):
    return list(invoices_db.values())

@app.get("/billing/subscription")
async def get_subscription(current_user: User = Depends(get_current_user)):
    return {
        "id": "1",
        "plan": "basic",
        "status": "active",
        "currentPeriodEnd": (datetime.utcnow() + timedelta(days=30)).isoformat()
    }

@app.put("/billing/subscription")
async def update_subscription(plan: dict, current_user: User = Depends(get_current_user)):
    return {
        "id": "1",
        "plan": plan["plan"],
        "status": "active",
        "currentPeriodEnd": (datetime.utcnow() + timedelta(days=30)).isoformat()
    }

# Dashboard endpoints
@app.get("/dashboard/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    return {
        "totalSurveys": 0,
        "activeUsers": len([u for u in users_db.values() if u["is_active"]]),
        "totalResponses": 0,
        "reportsGenerated": 0
    }

@app.get("/dashboard/recent-activity")
async def get_recent_activity(current_user: User = Depends(get_current_user)):
    return [
        {
            "id": "1",
            "type": "survey_created",
            "title": "Welcome to Novora",
            "timestamp": datetime.utcnow().isoformat()
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 