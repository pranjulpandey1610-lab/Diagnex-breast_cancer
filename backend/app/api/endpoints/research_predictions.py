from pathlib import Path
import joblib
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from app.api import deps
from app.schemas.research_prediction import ResearchPredictionRequest, ResearchPredictionResponse

router=APIRouter()
MODEL_ROOT=Path(__file__).resolve().parents[4] / "ml" / "models"
@router.post("/score",response_model=ResearchPredictionResponse)
def score(payload:ResearchPredictionRequest,user=Depends(deps.require_role(["admin","researcher"]))):
    if not payload.version.replace("_","").replace("-","").isalnum(): raise HTTPException(400,"Invalid model version")
    path=MODEL_ROOT / f"breast_tabular_{payload.version}.joblib"
    if not path.exists(): raise HTTPException(404,"No approved research model artifact for this version")
    model=joblib.load(path)
    probability=float(model.predict_proba(pd.DataFrame([payload.features]))[0,1])
    return {"version":payload.version,"research_score":probability}
