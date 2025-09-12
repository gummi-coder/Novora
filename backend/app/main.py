"""
FastAPI application entry point for Novora Survey Platform MVP
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os

logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    app = FastAPI(
        title="Novora MVP Survey Platform API",
        description="Backend API for MVP survey management platform",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all origins for MVP
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health check endpoint
    @app.get("/health")
    async def health_check():
        """Basic health check endpoint"""
        return {
            "status": "healthy",
            "environment": os.getenv("ENVIRONMENT", "production"),
            "version": "1.0.0",
            "message": "Novora MVP API is running"
        }

    # API health check endpoint
    @app.get("/api/v1/health")
    async def api_health_check():
        """API health check endpoint"""
        return {
            "status": "healthy",
            "api_version": "v1",
            "message": "Novora MVP API v1 is running"
        }

    # Root endpoint
    @app.get("/")
    async def root():
        """Root endpoint"""
        return {
            "message": "Welcome to Novora MVP API",
            "docs": "/docs",
            "health": "/health",
            "api_health": "/api/v1/health"
        }

    # CRUD routes for Item model
    from fastapi import Depends, HTTPException
    from sqlalchemy.orm import Session
    from app.core.database import Base, engine
    from app.core.deps import get_db
    from app import models, schemas

    # Create tables if not using Alembic yet (only for Item model)
    from app.models.base import Item
    Item.__table__.create(bind=engine, checkfirst=True)

    @app.post("/items", response_model=schemas.ItemOut)
    def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
        db_item = models.Item(name=item.name)
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @app.get("/items/{item_id}", response_model=schemas.ItemOut)
    def read_item(item_id: int, db: Session = Depends(get_db)):
        item = db.query(models.Item).filter(models.Item.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        return item

    @app.put("/items/{item_id}", response_model=schemas.ItemOut)
    def update_item(item_id: int, new: schemas.ItemCreate, db: Session = Depends(get_db)):
        item = db.query(models.Item).filter(models.Item.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        item.name = new.name
        db.commit()
        db.refresh(item)
        return item

    @app.delete("/items/{item_id}")
    def delete_item(item_id: int, db: Session = Depends(get_db)):
        item = db.query(models.Item).filter(models.Item.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        db.delete(item)
        db.commit()
        return {"ok": True}

    # Include API routes (commented out due to missing advanced models)
    # from app.api.v1.api import api_router
    # app.include_router(api_router, prefix="/api/v1")

    return app

# Create the FastAPI app
app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )