"""
Survey Schemas
Pydantic models for survey-related data validation
"""
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum

class SurveyStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    CLOSED = "closed"
    DELETED = "deleted"

class SurveyCreate(BaseModel):
    org_id: str = Field(..., description="Organization ID")
    name: str = Field(..., min_length=1, max_length=200, description="Survey name")
    description: Optional[str] = Field(None, max_length=1000, description="Survey description")
    opens_at: datetime = Field(..., description="Survey opening date")
    closes_at: datetime = Field(..., description="Survey closing date")
    question_set: Dict[str, Any] = Field(..., description="Question set configuration")
    settings: Dict[str, Any] = Field(default_factory=dict, description="Survey settings")

class SurveyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200, description="Survey name")
    description: Optional[str] = Field(None, max_length=1000, description="Survey description")
    opens_at: Optional[datetime] = Field(None, description="Survey opening date")
    closes_at: Optional[datetime] = Field(None, description="Survey closing date")
    status: Optional[SurveyStatus] = Field(None, description="Survey status")
    question_set: Optional[Dict[str, Any]] = Field(None, description="Question set configuration")
    settings: Optional[Dict[str, Any]] = Field(None, description="Survey settings")

class SurveyResponse(BaseModel):
    id: str = Field(..., description="Survey ID")
    org_id: str = Field(..., description="Organization ID")
    name: str = Field(..., description="Survey name")
    description: Optional[str] = Field(None, description="Survey description")
    status: str = Field(..., description="Survey status")
    opens_at: datetime = Field(..., description="Survey opening date")
    closes_at: datetime = Field(..., description="Survey closing date")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True

class TokenDeliveryConfig(BaseModel):
    org_name: str = Field(..., description="Organization name for email templates")
    delivery_method: str = Field(default="email", description="Delivery method (email, slack, teams)")
    custom_message: Optional[str] = Field(None, description="Custom message for invitations")
