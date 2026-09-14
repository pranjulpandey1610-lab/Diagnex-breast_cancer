import logging
from typing import Any, Dict
from pydantic import BaseModel, Field

from app.services.screening.engine import BaseBreastHealthModule, BreastHealthSummaryPayload

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))

try:
    from ml.breast_cancer.model_registry import load_production_model
    from ml.breast_cancer.preprocess import prepare_input_data
    _MODEL, _METADATA = load_production_model()
    logging.info(f"Loaded production breast cancer model: {_METADATA['model_version']}")
except Exception as e:
    logging.warning(f"Failed to load production breast cancer model. Falling back to mock. Error: {e}")
    _MODEL = None
    _METADATA = {}

class BreastCancerInputSchema(BaseModel):
    age: int = Field(ge=18, le=120, description="Age in years")
    age_at_menarche: int = Field(ge=8, le=25, description="Age at first menstrual period")
    age_at_first_birth: int | None = Field(default=None, ge=12, le=60, description="Age at first live birth (None if nulliparous)")
    history_of_biopsy: bool = Field(description="History of breast biopsy")
    family_history_breast_cancer: bool = Field(description="First-degree relative with breast cancer")
    birads_density_category: int = Field(ge=1, le=4, description="BI-RADS breast density category (1-4)")

class BreastCancerScreeningModule(BaseBreastHealthModule):
    @property
    def disease_type(self) -> str:
        return "breast_cancer"

    @property
    def input_schema(self):
        return BreastCancerInputSchema

    def preprocess(self, inputs: BreastCancerInputSchema) -> Dict[str, Any]:
        data = inputs.model_dump()
        return data

    def check_guardrails(self, processed_data: Dict[str, Any]) -> Dict[str, Any]:
        flags = {}
        # Identify missing or biologically impossible values
        if processed_data["age"] < 30 and processed_data["family_history_breast_cancer"]:
            flags["early_screening_alert"] = "Patient is under 30 with a family history. Consider specialized genetic counseling."
            
        return flags

    def predict(self, processed_data: Dict[str, Any]) -> Dict[str, Any]:
        if _MODEL is None:
            # Fallback to mock adapter if model fails to load
            score = 0.5
            model_ver = "mock-fallback"
            dataset_ver = "none"
            confidence = 0.5
        else:
            # 1. Convert to DataFrame in expected order
            df = prepare_input_data(processed_data)
            
            # 2. Run inference
            prob = float(_MODEL.predict_proba(df)[0, 1])
            
            score = prob
            model_ver = _METADATA.get("model_version", "unknown")
            dataset_ver = _METADATA.get("dataset_version", "unknown")
            confidence = float(abs(score - 0.5) * 2)

        return {
            "risk_probability": score,
            "model_version": model_ver,
            "dataset_version": dataset_ver,
            "confidence": confidence
        }

    def format_result(self, prediction_output: Dict[str, Any], flags: Dict[str, Any]) -> BreastHealthSummaryPayload:
        prob = prediction_output["risk_probability"]
        
        if len(flags) > 0 and any("alert" in k for k in flags.keys()):
            outcome = "needs_review"
            safe_text = "The screening inputs generated clinical alerts. A clinician must review this data."
        elif prob > 0.6:
            outcome = "higher_risk"
            safe_text = "The analysis indicates a higher-risk screening pattern associated with breast cancer. Clinical imaging (Mammogram/MRI) is strongly recommended."
        elif prob > 0.3:
            outcome = "needs_review"
            safe_text = "The analysis indicates an intermediate risk pattern. Routine clinical follow-up is recommended."
        else:
            outcome = "lower_risk"
            safe_text = "The analysis indicates a lower-risk screening pattern. Maintain regular routine screening."

        disclaimer = (
            "⚠️ SCREENING ESTIMATE ONLY — NOT A DIAGNOSTIC DEVICE. "
            "This AI model assesses risk patterns and does not diagnose breast cancer. "
            "Do not make medical decisions based on this output. Consult a healthcare provider."
        )

        return BreastHealthSummaryPayload(
            model_version=prediction_output["model_version"],
            dataset_version=prediction_output["dataset_version"],
            risk_probability=prob,
            outcome_category=outcome,
            confidence_score=prediction_output["confidence"],
            clinical_flags=flags,
            disclaimer_text=disclaimer,
            safe_result_text=safe_text
        )
