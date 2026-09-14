from pydantic import BaseModel, UUID4, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime

class MessageRequest(BaseModel):
    content: str

class SummaryRequest(BaseModel):
    finalized_entities: Dict[str, Any]

class SessionResponse(BaseModel):
    session_id: UUID4
    status: str
    assistant_message: str
    quick_replies: List[str] = []
    cumulative_state: Optional[Dict[str, Any]] = None

class SummaryResponse(BaseModel):
    triage_category: str
    guidance_level: str
    information_completion_percent: int
    recommended_action: str
    assessment_options: List[str] = []
    disclaimer: str
    finalized_entities: Dict[str, Any]
