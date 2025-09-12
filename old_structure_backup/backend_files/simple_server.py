from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from datetime import datetime
from typing import List, Optional
import os

# Create database engine
DATABASE_URL = "sqlite:///./novora.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Define models
class Metric(Base):
    __tablename__ = "metrics"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String, nullable=False)
    is_core = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    questions = relationship("QuestionBank", back_populates="metric")

class QuestionBank(Base):
    __tablename__ = "question_bank"
    id = Column(Integer, primary_key=True)
    metric_id = Column(Integer, ForeignKey('metrics.id'), nullable=False)
    question_text_en = Column(Text, nullable=False)
    question_text_es = Column(Text)
    question_text_is = Column(Text)
    question_text_de = Column(Text)
    question_text_fr = Column(Text)
    active = Column(Boolean, default=True)
    variation_order = Column(Integer, default=0)
    sensitive = Column(Boolean, default=False)
    reverse_scored = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    metric = relationship("Metric", back_populates="questions")
    
    def get_question_text(self, language='en'):
        text_field = f"question_text_{language}"
        if hasattr(self, text_field) and getattr(self, text_field):
            return getattr(self, text_field)
        return self.question_text_en

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create FastAPI app
app = FastAPI(title="Novora Question Bank API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "environment": "development",
        "version": "1.0.0",
        "services": {
            "database": "connected",
            "redis": "disconnected"
        }
    }

# Test endpoint for frontend debugging
@app.get("/api/v1/test")
def test_endpoint():
    return {
        "message": "Backend is working!",
        "timestamp": datetime.utcnow().isoformat(),
        "endpoint": "/api/v1/test"
    }

# Public question bank endpoints
@app.get("/api/v1/question-bank/public/metrics")
def get_metrics_public(
    db: Session = Depends(get_db),
    include_core_only: bool = Query(False, description="Only return core metrics")
):
    """Get all metrics (public endpoint for survey builder)"""
    query = db.query(Metric).order_by(Metric.display_order)
    
    if include_core_only:
        query = query.filter(Metric.is_core == True)
    
    metrics = query.all()
    return [
        {
            "id": metric.id,
            "name": metric.name,
            "category": metric.category,
            "description": metric.description,
            "is_core": metric.is_core,
            "display_order": metric.display_order
        }
        for metric in metrics
    ]

@app.get("/api/v1/question-bank/public/questions")
def get_questions_public(
    db: Session = Depends(get_db),
    metric_id: Optional[int] = Query(None, description="Filter by metric ID"),
    category: Optional[str] = Query(None, description="Filter by metric category"),
    active_only: bool = Query(True, description="Only return active questions"),
    language: str = Query('en', description="Language for question text")
):
    """Get questions with optional filtering (public endpoint for survey builder)"""
    query = db.query(QuestionBank).join(Metric)
    
    if metric_id:
        query = query.filter(QuestionBank.metric_id == metric_id)
    
    if category:
        query = query.filter(Metric.category == category)
    
    if active_only:
        query = query.filter(QuestionBank.active == True)
    
    questions = query.order_by(Metric.display_order, QuestionBank.variation_order).all()
    
    return [
        {
            "id": q.id,
            "metric_id": q.metric_id,
            "metric_name": q.metric.name,
            "metric_category": q.metric.category,
            "question_text": q.get_question_text(language),
            "variation_order": q.variation_order,
            "sensitive": q.sensitive,
            "reverse_scored": q.reverse_scored,
            "active": q.active
        }
        for q in questions
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
