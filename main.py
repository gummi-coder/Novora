#!/usr/bin/env python3
"""
Simple FastAPI app with basic survey endpoints for MVP
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import os

app = FastAPI(
    title="Novora MVP Survey Platform API",
    description="Backend API for MVP survey management platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database path - try multiple locations
import os
DB_PATHS = [
    "backend/mvp_surveys.db",
    "mvp_surveys.db", 
    "/app/backend/mvp_surveys.db",
    "/app/mvp_surveys.db"
]

def get_db_path():
    for path in DB_PATHS:
        if os.path.exists(path):
            return path
    # If no database found, return the first path as default
    return DB_PATHS[0]

DB_PATH = get_db_path()

class SurveyResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    survey_token: Optional[str]
    survey_link: Optional[str]
    status: str
    created_at: str

@app.get("/")
async def root():
    return {"message": "Novora MVP API is running!"}

@app.get("/health")
async def health():
    return {"status": "healthy", "message": "API is working"}

@app.get("/api/v1/health")
async def api_health():
    return {"status": "healthy", "api_version": "v1", "message": "API v1 is working"}

@app.get("/api/v1/surveys", response_model=List[SurveyResponse])
async def get_surveys():
    """Get all surveys with survey links"""
    try:
        # Debug: return database info
        return {
            "debug": {
                "db_path": DB_PATH,
                "db_exists": os.path.exists(DB_PATH),
                "current_dir": os.getcwd(),
                "files": os.listdir(".") if os.path.exists(".") else []
            }
        }
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, title, description, survey_token, status, created_at 
            FROM surveys 
            ORDER BY created_at DESC
        """)
        
        surveys = []
        for row in cursor.fetchall():
            survey_id, title, description, survey_token, status, created_at = row
            
            survey_link = None
            if survey_token:
                survey_link = f"https://novorasurveys.com/survey/{survey_token}"
            
            surveys.append(SurveyResponse(
                id=survey_id,
                title=title,
                description=description,
                survey_token=survey_token,
                survey_link=survey_link,
                status=status,
                created_at=created_at
            ))
        
        conn.close()
        return surveys
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/v1/surveys/{survey_id}", response_model=SurveyResponse)
async def get_survey(survey_id: int):
    """Get a specific survey by ID"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, title, description, survey_token, status, created_at 
            FROM surveys 
            WHERE id = ?
        """, (survey_id,))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        survey_id, title, description, survey_token, status, created_at = row
        
        survey_link = None
        if survey_token:
            survey_link = f"https://novorasurveys.com/survey/{survey_token}"
        
        conn.close()
        return SurveyResponse(
            id=survey_id,
            title=title,
            description=description,
            survey_token=survey_token,
            survey_link=survey_link,
            status=status,
            created_at=created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get('PORT', 8000))
    uvicorn.run(app, host='0.0.0.0', port=port)
