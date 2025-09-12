from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime

class SurveyCreate(BaseModel):
    title: str
    questions: List[Dict]  # e.g., [{"text": "How satisfied are you?", "type": "scale"}]

class SurveyResponse(BaseModel):
    survey_id: int
    answers: List[Dict]  # e.g., [{"question_id": 1, "answer": 5}]

class SurveyOut(BaseModel):
    id: int
    title: str
    questions: List[Dict]
    created_at: datetime

    class Config:
        orm_mode = True

class ItemCreate(BaseModel):
    name: str

class ItemOut(ItemCreate):
    id: int
    class Config:
        from_attributes = True 