"""
Settings Schemas
Pydantic models for settings and configuration data validation
"""
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum

class AlertSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class AlertType(str, Enum):
    LOW_SCORE = "LOW_SCORE"
    BIG_DROP_ABS = "BIG_DROP_ABS"
    BIG_DROP_REL = "BIG_DROP_REL"
    ENPS_NEG = "ENPS_NEG"
    LOW_PARTICIPATION = "LOW_PARTICIPATION"
    PARTICIPATION_DROP = "PARTICIPATION_DROP"
    NEG_SENT_SPIKE = "NEG_SENT_SPIKE"
    RECURRING = "RECURRING"

class ChannelType(str, Enum):
    EMAIL = "email"
    SLACK = "slack"
    TEAMS = "teams"

class OrgSettingsResponse(BaseModel):
    id: str = Field(..., description="Settings ID")
    org_id: str = Field(..., description="Organization ID")
    min_n: int = Field(..., ge=1, description="Minimum number of responses required")
    language: str = Field(..., description="Default language")
    cadence: str = Field(..., description="Survey cadence")
    pii_masking_enabled: bool = Field(..., description="PII masking enabled")
    safe_fallback_message: str = Field(..., description="Safe fallback message")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True

class OrgSettingsUpdate(BaseModel):
    min_n: Optional[int] = Field(None, ge=1, description="Minimum number of responses required")
    language: Optional[str] = Field(None, description="Default language")
    cadence: Optional[str] = Field(None, description="Survey cadence")
    pii_masking_enabled: Optional[bool] = Field(None, description="PII masking enabled")
    safe_fallback_message: Optional[str] = Field(None, description="Safe fallback message")

class AlertThresholdsResponse(BaseModel):
    id: str = Field(..., description="Threshold ID")
    org_id: str = Field(..., description="Organization ID")
    alert_type: AlertType = Field(..., description="Alert type")
    threshold_value: float = Field(..., description="Threshold value")
    severity: AlertSeverity = Field(..., description="Alert severity")
    enabled: bool = Field(..., description="Threshold enabled")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True

class AlertThresholdsUpdate(BaseModel):
    alert_type: AlertType = Field(..., description="Alert type")
    threshold_value: Optional[float] = Field(None, description="Threshold value")
    severity: Optional[AlertSeverity] = Field(None, description="Alert severity")
    enabled: Optional[bool] = Field(None, description="Threshold enabled")

class NotificationChannelResponse(BaseModel):
    id: str = Field(..., description="Channel ID")
    org_id: str = Field(..., description="Organization ID")
    channel_type: ChannelType = Field(..., description="Channel type")
    enabled: bool = Field(..., description="Channel enabled")
    config: Dict[str, Any] = Field(..., description="Channel configuration")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True

class NotificationChannelCreate(BaseModel):
    org_id: str = Field(..., description="Organization ID")
    channel_type: ChannelType = Field(..., description="Channel type")
    enabled: bool = Field(True, description="Channel enabled")
    config: Dict[str, Any] = Field(default_factory=dict, description="Channel configuration")

class NotificationChannelUpdate(BaseModel):
    enabled: Optional[bool] = Field(None, description="Channel enabled")
    config: Optional[Dict[str, Any]] = Field(None, description="Channel configuration")

class DriverResponse(BaseModel):
    id: str = Field(..., description="Driver ID")
    org_id: str = Field(..., description="Organization ID")
    key: str = Field(..., description="Driver key")
    label: str = Field(..., description="Driver label")
    description: Optional[str] = Field(None, description="Driver description")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True

class DriverCreate(BaseModel):
    org_id: str = Field(..., description="Organization ID")
    key: str = Field(..., pattern="^[a-z_]+$", description="Driver key (lowercase with underscores)")
    label: str = Field(..., min_length=1, max_length=200, description="Driver label")
    description: Optional[str] = Field(None, max_length=1000, description="Driver description")

class DriverUpdate(BaseModel):
    label: Optional[str] = Field(None, min_length=1, max_length=200, description="Driver label")
    description: Optional[str] = Field(None, max_length=1000, description="Driver description")

class QuestionResponse(BaseModel):
    id: str = Field(..., description="Question ID")
    driver_id: str = Field(..., description="Driver ID")
    text: str = Field(..., description="Question text")
    type: str = Field(..., description="Question type")
    required: bool = Field(..., description="Question required")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True

class QuestionCreate(BaseModel):
    driver_id: str = Field(..., description="Driver ID")
    text: str = Field(..., min_length=1, max_length=500, description="Question text")
    type: str = Field(..., description="Question type")
    required: bool = Field(True, description="Question required")

class QuestionUpdate(BaseModel):
    text: Optional[str] = Field(None, min_length=1, max_length=500, description="Question text")
    type: Optional[str] = Field(None, description="Question type")
    required: Optional[bool] = Field(None, description="Question required")
