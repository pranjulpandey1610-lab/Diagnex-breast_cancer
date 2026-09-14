"""
Diagnex Backend — Pydantic Schemas

Request/response models for API validation. PHI is never exposed
in response models unless the requesting user has the appropriate role.
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Auth Schemas ─────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=255)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit.")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserRoleUpdate(BaseModel):
    role: str = Field(..., pattern="^(patient|doctor|admin|researcher)$")


class UserActiveUpdate(BaseModel):
    is_active: bool


# ── Screening Schemas ────────────────────────────────────────

class DiabetesScreeningInput(BaseModel):
    """Input features for diabetes risk screening (Pima Indians dataset features)."""
    pregnancies: int = Field(..., ge=0, le=20, description="Number of pregnancies")
    glucose: float = Field(..., ge=0, le=300, description="Plasma glucose concentration (mg/dL)")
    blood_pressure: float = Field(..., ge=0, le=200, description="Diastolic blood pressure (mm Hg)")
    skin_thickness: float = Field(..., ge=0, le=100, description="Triceps skin fold thickness (mm)")
    insulin: float = Field(..., ge=0, le=900, description="2-Hour serum insulin (mu U/ml)")
    bmi: float = Field(..., ge=0, le=70, description="Body mass index (kg/m²)")
    diabetes_pedigree: float = Field(
        ..., ge=0, le=3.0, description="Diabetes pedigree function"
    )
    age: int = Field(..., ge=1, le=120, description="Age in years")


class BreastCancerScreeningInput(BaseModel):
    """Input features for breast cancer risk screening (Wisconsin dataset mean features)."""
    mean_radius: float = Field(..., ge=0, le=50, description="Mean radius of cell nuclei")
    mean_texture: float = Field(..., ge=0, le=50, description="Mean texture (std dev of gray-scale)")
    mean_perimeter: float = Field(..., ge=0, le=300, description="Mean perimeter")
    mean_area: float = Field(..., ge=0, le=3000, description="Mean area")
    mean_smoothness: float = Field(..., ge=0, le=1, description="Mean smoothness")
    mean_compactness: float = Field(..., ge=0, le=1, description="Mean compactness")
    mean_concavity: float = Field(..., ge=0, le=1, description="Mean concavity")
    mean_concave_points: float = Field(..., ge=0, le=1, description="Mean concave points")
    mean_symmetry: float = Field(..., ge=0, le=1, description="Mean symmetry")
    mean_fractal_dimension: float = Field(..., ge=0, le=1, description="Mean fractal dimension")


class ScreeningResultResponse(BaseModel):
    id: int
    session_id: int
    screening_type: str
    model_name: str
    model_version: str
    dataset_version: str
    risk_score: float
    risk_category: str
    explanation: str | None
    ai_disclaimer: str
    clinician_reviewed: bool
    reviewed_by: int | None
    clinical_notes: str | None
    reviewed_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ScreeningSessionResponse(BaseModel):
    id: int
    patient_id: int
    screening_type: str
    created_at: datetime
    result: ScreeningResultResponse | None = None

    model_config = {"from_attributes": True}


# ── Review Schemas ───────────────────────────────────────────

class ReviewSubmit(BaseModel):
    clinical_notes: str = Field(..., min_length=1, max_length=5000)
    clinician_approved: bool


class ReviewResponse(BaseModel):
    id: int
    session_id: int
    model_name: str
    risk_score: float
    risk_category: str
    clinician_reviewed: bool
    reviewed_by: int | None
    clinical_notes: str | None
    reviewed_at: datetime | None
    patient_name: str | None = None
    screening_type: str | None = None

    model_config = {"from_attributes": True}


# ── File Upload Schemas ──────────────────────────────────────

class FileUploadResponse(BaseModel):
    id: int
    original_filename: str
    file_type: str
    file_size_bytes: int
    description: str | None
    uploaded_at: datetime

    model_config = {"from_attributes": True}


# ── Admin Schemas ────────────────────────────────────────────

class AuditLogResponse(BaseModel):
    id: int
    user_id: int | None
    role: str
    action: str
    resource: str
    resource_id: str | None
    ip_address: str | None
    timestamp: datetime

    model_config = {"from_attributes": True}


class SystemStatsResponse(BaseModel):
    total_users: int
    active_users: int
    total_screenings: int
    pending_reviews: int
    total_uploads: int
    screenings_by_type: dict[str, int]
    users_by_role: dict[str, int]


class ModelRegistryResponse(BaseModel):
    id: int
    name: str
    version: str
    dataset_version: str
    description: str | None
    metrics_json: str | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ModelRegistryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    version: str = Field(..., min_length=1, max_length=50)
    dataset_version: str = Field(..., min_length=1, max_length=100)
    description: str | None = None
    metrics_json: str | None = None
    file_path: str = Field(..., min_length=1)


# ── Medical Disclaimer ──────────────────────────────────────

MEDICAL_DISCLAIMER = (
    "⚠️ SCREENING ESTIMATE ONLY — NOT A MEDICAL DIAGNOSIS\n\n"
    "This result was generated by a research-only AI model for informational "
    "purposes. It does NOT constitute a clinical diagnosis and should NOT be "
    "used as the sole basis for medical decisions.\n\n"
    "🔬 Research-Only AI Flag — Clinician Review Required\n\n"
    "If your screening indicates elevated risk, please consult a qualified "
    "healthcare provider for proper clinical evaluation, diagnostic testing, "
    "and personalized medical advice."
)

ESCALATION_GUIDANCE = (
    "🚨 ELEVATED RISK DETECTED — CLINICAL FOLLOW-UP RECOMMENDED\n\n"
    "Your screening results indicate a potentially elevated risk level. "
    "This is a preliminary screening estimate and does NOT mean you have "
    "been diagnosed with any condition.\n\n"
    "Recommended next steps:\n"
    "1. Schedule an appointment with your primary care physician.\n"
    "2. Bring these screening results to your clinician for review.\n"
    "3. Your clinician may order additional diagnostic tests.\n"
    "4. Do not self-diagnose or self-treat based on these results alone."
)
