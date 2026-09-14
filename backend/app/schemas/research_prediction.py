from pydantic import BaseModel
from typing import Any
class ResearchPredictionRequest(BaseModel):
    version: str
    features: dict[str, Any]
class ResearchPredictionResponse(BaseModel):
    version: str
    research_score: float
    disclaimer: str = "Research-only output. Not a patient diagnosis or clinical decision."
