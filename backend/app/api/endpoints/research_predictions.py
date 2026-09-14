from io import BytesIO
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from PIL import Image
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

@router.post("/histopathology/score")
async def score_histopathology_patch(
    version: str = Form(...),
    file: UploadFile = File(...),
    user=Depends(deps.require_role(["admin", "researcher"])),
):
    """Restricted research scoring for a public 50x50 H&E patch only.

    This route must never be used with patient uploads, clinical reports, DICOM,
    or photographs. It returns a research annotation score, not a conclusion.
    """
    if version != "idc_patch_sgd_v1":
        raise HTTPException(404, "No approved histopathology research model for this version")
    content = await file.read()
    if not content.startswith(b"\x89PNG\r\n\x1a\n"):
        raise HTTPException(400, "Only a 50x50 PNG histopathology research patch is accepted")
    try:
        image = Image.open(BytesIO(content)).convert("L")
    except Exception as exc:
        raise HTTPException(400, "The uploaded research patch could not be read") from exc
    if image.size != (50, 50):
        raise HTTPException(400, "Only 50x50 histopathology research patches are accepted")
    path = MODEL_ROOT / "breast_histopathology_idc_patch_v1.joblib"
    if not path.exists():
        raise HTTPException(503, "Research model artifact is not installed")
    payload = joblib.load(path)
    features = np.asarray(image.resize((25, 25), Image.Resampling.BILINEAR), dtype=np.float32).reshape(1, -1) / 255.0
    score = float(payload["model"].predict_proba(features)[0, 1])
    return {
        "version": payload["version"],
        "research_annotation_score": score,
        "disclaimer": "Research analysis is not a diagnosis. This output is restricted to approved research use and requires qualified pathology interpretation.",
    }
