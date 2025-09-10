from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class FrequencyEnum(str, Enum):
    daily = "daily"
    weekly = "weekly"
    biweekly = "biweekly"
    monthly = "monthly"
    quarterly = "quarterly"

class ReminderFrequencyEnum(str, Enum):
    daily = "daily"
    weekly = "weekly"
    biweekly = "biweekly"

class ReminderSettings(BaseModel):
    enabled: bool = True
    frequency: ReminderFrequencyEnum = ReminderFrequencyEnum.weekly
    maxReminders: int = Field(2, ge=1, le=10)
    delayDays: int = Field(3, ge=1, le=30)
    messageTemplate: str = "Hi! We noticed you haven't completed our survey yet. Your feedback is important to us. Please take a moment to share your thoughts."
    excludeResponded: bool = True
    autoCloseAfterDays: int = Field(10, ge=1, le=30)
    reminderDays: List[int] = Field(default=[3, 7], description="Days after survey sent to send reminders")

class AutoPilotPlanCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    frequency: FrequencyEnum = FrequencyEnum.weekly
    startDate: datetime
    endDate: Optional[datetime] = None
    isActive: bool = False
    questionRotation: bool = True
    reminderSettings: ReminderSettings
    distributionChannels: List[str] = Field(default=["email"])
    targetAudience: List[str] = Field(default=["all_employees"])
    maxResponses: Optional[int] = Field(None, ge=1)

class AutoPilotPlanUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    frequency: Optional[FrequencyEnum] = None
    startDate: Optional[datetime] = None
    endDate: Optional[datetime] = None
    isActive: Optional[bool] = None
    questionRotation: Optional[bool] = None
    reminderSettings: Optional[ReminderSettings] = None
    distributionChannels: Optional[List[str]] = None
    targetAudience: Optional[List[str]] = None
    maxResponses: Optional[int] = Field(None, ge=1)

class AutoPilotPlanResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    frequency: str
    startDate: datetime
    endDate: Optional[datetime]
    isActive: bool
    questionRotation: bool
    reminderSettings: Dict[str, Any]
    distributionChannels: List[str]
    targetAudience: List[str]
    maxResponses: Optional[int]
    companyId: int
    createdBy: int
    createdAt: Optional[datetime]
    updatedAt: Optional[datetime]

    class Config:
        from_attributes = True

class AutoPilotSurveyResponse(BaseModel):
    id: int
    planId: int
    surveyId: int
    scheduledDate: datetime
    sentDate: Optional[datetime]
    status: str
    questionSet: Dict[str, Any]
    reminderCount: int
    lastReminderDate: Optional[datetime]
    responseCount: int
    targetCount: int
    createdAt: Optional[datetime]
    updatedAt: Optional[datetime]

    class Config:
        from_attributes = True

class AutoPilotMetricsResponse(BaseModel):
    totalSurveys: int
    activePlans: int
    averageResponseRate: float
    totalResponses: int
    nextScheduledSurvey: Optional[datetime]
    recentActivity: List[Dict[str, Any]]

class AutoPilotActivityResponse(BaseModel):
    id: str
    type: str
    description: str
    timestamp: datetime
    planId: Optional[int]
    surveyId: Optional[int]

class ReminderSettingsUpdate(BaseModel):
    enabled: Optional[bool] = None
    frequency: Optional[ReminderFrequencyEnum] = None
    maxReminders: Optional[int] = Field(None, ge=1, le=10)
    delayDays: Optional[int] = Field(None, ge=1, le=30)
    messageTemplate: Optional[str] = None
    excludeResponded: Optional[bool] = None
    autoCloseAfterDays: Optional[int] = Field(None, ge=1, le=30)
    reminderDays: Optional[List[int]] = None
