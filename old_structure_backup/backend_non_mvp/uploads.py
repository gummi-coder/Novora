"""
File upload endpoints for survey attachments
"""
import os
import uuid
import shutil
from pathlib import Path
from typing import List
from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.config import settings
from app.models.base import Survey, FileAttachment, User
from app.api.deps import get_current_user

router = APIRouter()

class FileAttachmentResponse(BaseModel):
    id: int
    survey_id: int
    filename: str
    original_filename: str
    file_size: int
    mime_type: str
    uploaded_by: int
    uploaded_at: datetime
    description: str

    class Config:
        from_attributes = True

# Create upload directory if it doesn't exist
UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {
    '.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif', 
    '.csv', '.xlsx', '.xls', '.ppt', '.pptx', '.zip', '.rar'
}

ALLOWED_MIME_TYPES = {
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-rar-compressed'
}

def validate_file(file: UploadFile) -> bool:
    """Validate file type and size"""
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return False
    
    # Check MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        return False
    
    return True

@router.post("/surveys/{survey_id}/attachments", response_model=FileAttachmentResponse)
async def upload_survey_attachment(
    survey_id: int,
    file: UploadFile = File(...),
    description: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a file attachment for a survey"""
    # Check if survey exists and user has access
    survey = db.query(Survey).filter(
        Survey.id == survey_id,
        Survey.creator_id == current_user.id
    ).first()
    
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )
    
    # Validate file
    if not validate_file(file):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Allowed types: PDF, DOC, DOCX, TXT, Images, CSV, Excel, PowerPoint, ZIP, RAR"
        )
    
    # Check file size
    file_size = 0
    file_content = b""
    while chunk := await file.read(8192):
        file_size += len(chunk)
        file_content += chunk
        if file_size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE // (1024*1024)}MB"
            )
    
    # Generate unique filename
    file_ext = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    
    # Save file
    file_path = UPLOAD_DIR / unique_filename
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # Create database record
    attachment = FileAttachment(
        survey_id=survey_id,
        filename=unique_filename,
        original_filename=file.filename,
        file_path=str(file_path),
        file_size=file_size,
        mime_type=file.content_type,
        uploaded_by=current_user.id,
        description=description
    )
    
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    
    return attachment

@router.get("/surveys/{survey_id}/attachments", response_model=List[FileAttachmentResponse])
async def get_survey_attachments(
    survey_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all attachments for a survey"""
    # Check if survey exists and user has access
    survey = db.query(Survey).filter(
        Survey.id == survey_id,
        Survey.creator_id == current_user.id
    ).first()
    
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )
    
    attachments = db.query(FileAttachment).filter(
        FileAttachment.survey_id == survey_id
    ).all()
    
    return attachments

@router.get("/attachments/{attachment_id}/download")
async def download_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download a file attachment"""
    attachment = db.query(FileAttachment).filter(
        FileAttachment.id == attachment_id
    ).first()
    
    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found"
        )
    
    # Check if user has access to the survey
    survey = db.query(Survey).filter(
        Survey.id == attachment.survey_id,
        Survey.creator_id == current_user.id
    ).first()
    
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Check if file exists
    file_path = Path(attachment.file_path)
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on server"
        )
    
    return FileResponse(
        path=file_path,
        filename=attachment.original_filename,
        media_type=attachment.mime_type
    )

@router.delete("/attachments/{attachment_id}")
async def delete_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a file attachment"""
    attachment = db.query(FileAttachment).filter(
        FileAttachment.id == attachment_id
    ).first()
    
    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found"
        )
    
    # Check if user has access to the survey
    survey = db.query(Survey).filter(
        Survey.id == attachment.survey_id,
        Survey.creator_id == current_user.id
    ).first()
    
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Delete file from filesystem
    file_path = Path(attachment.file_path)
    if file_path.exists():
        file_path.unlink()
    
    # Delete from database
    db.delete(attachment)
    db.commit()
    
    return {"message": "Attachment deleted successfully"}

@router.put("/attachments/{attachment_id}", response_model=FileAttachmentResponse)
async def update_attachment_description(
    attachment_id: int,
    description: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update attachment description"""
    attachment = db.query(FileAttachment).filter(
        FileAttachment.id == attachment_id
    ).first()
    
    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found"
        )
    
    # Check if user has access to the survey
    survey = db.query(Survey).filter(
        Survey.id == attachment.survey_id,
        Survey.creator_id == current_user.id
    ).first()
    
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    attachment.description = description
    db.commit()
    db.refresh(attachment)
    
    return attachment 