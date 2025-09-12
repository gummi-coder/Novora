"""
Employee and Team Schemas
Pydantic models for employee and team data validation
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum

class EmployeeStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    TERMINATED = "terminated"

class EmployeeCreate(BaseModel):
    org_id: str = Field(..., description="Organization ID")
    team_id: Optional[str] = Field(None, description="Team ID")
    name: str = Field(..., min_length=1, max_length=200, description="Employee name")
    email: EmailStr = Field(..., description="Employee email")
    job_title: Optional[str] = Field(None, max_length=200, description="Job title")
    status: Optional[EmployeeStatus] = Field(EmployeeStatus.ACTIVE, description="Employee status")

class EmployeeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200, description="Employee name")
    email: Optional[EmailStr] = Field(None, description="Employee email")
    job_title: Optional[str] = Field(None, max_length=200, description="Job title")
    team_id: Optional[str] = Field(None, description="Team ID")
    status: Optional[EmployeeStatus] = Field(None, description="Employee status")

class EmployeeResponse(BaseModel):
    id: str = Field(..., description="Employee ID")
    org_id: str = Field(..., description="Organization ID")
    team_id: Optional[str] = Field(None, description="Team ID")
    name: str = Field(..., description="Employee name")
    email: str = Field(..., description="Employee email")
    job_title: Optional[str] = Field(None, description="Job title")
    status: str = Field(..., description="Employee status")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True

class TeamCreate(BaseModel):
    org_id: str = Field(..., description="Organization ID")
    department_id: Optional[str] = Field(None, description="Department ID")
    name: str = Field(..., min_length=1, max_length=200, description="Team name")
    description: Optional[str] = Field(None, max_length=1000, description="Team description")
    size: Optional[int] = Field(0, ge=0, description="Team size")

class TeamUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200, description="Team name")
    description: Optional[str] = Field(None, max_length=1000, description="Team description")
    department_id: Optional[str] = Field(None, description="Department ID")
    size: Optional[int] = Field(None, ge=0, description="Team size")

class TeamResponse(BaseModel):
    id: str = Field(..., description="Team ID")
    org_id: str = Field(..., description="Organization ID")
    department_id: Optional[str] = Field(None, description="Department ID")
    name: str = Field(..., description="Team name")
    description: Optional[str] = Field(None, description="Team description")
    size: int = Field(..., description="Team size")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True
