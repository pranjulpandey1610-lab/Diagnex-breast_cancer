"""
Diagnex Backend — Breast Cancer Risk Screening Model

Self-hosted scikit-learn Random Forest trained on the Wisconsin
Breast Cancer Dataset (sklearn built-in).

⚠️ RESEARCH-ONLY SCREENING ESTIMATE — NOT A DIAGNOSTIC DEVICE
"""

import json
import logging
from pathlib import Path

import joblib
import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, recall_score, precision_score, f1_score

logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).parent / "models"
MODEL_PATH = MODEL_DIR / "breast_cancer_rf_v1.joblib"
SCALER_PATH = MODEL_DIR / "breast_cancer_scaler_v1.joblib"

# We use only the 10 "mean" features for the screening form
FEATURE_NAMES = [
    "mean_radius",
    "mean_texture",
    "mean_perimeter",
    "mean_area",
    "mean_smoothness",
    "mean_compactness",
    "mean_concavity",
    "mean_concave_points",
    "mean_symmetry",
    "mean_fractal_dimension",
]

MODEL_VERSION = "1.0.0"
DATASET_VERSION = "wisconsin_v1"


def _categorize_risk(score: float) -> str:
    """Categorize a probability score into a risk level."""
    if score < 0.20:
        return "low"
    elif score < 0.45:
        return "moderate"
    elif score < 0.70:
        return "high"
    else:
        return "very_high"


# ── In-Memory Model Cache ───────────────────────────────────

_model: RandomForestClassifier | None = None
_scaler: StandardScaler | None = None


def _load_model():
    """Load the trained model and scaler from disk."""
    global _model, _scaler
    if _model is not None and _scaler is not None:
        return

    if not MODEL_PATH.exists() or not SCALER_PATH.exists():
        logger.warning("Breast cancer model not found. Training a new one...")
        train_and_save()

    _model = joblib.load(MODEL_PATH)
    _scaler = joblib.load(SCALER_PATH)
    logger.info(f"Breast cancer model loaded: v{MODEL_VERSION}")


def train_and_save() -> dict:
    """
    Train the breast cancer screening model using the Wisconsin dataset
    and save to disk.

    Returns metrics dict.
    """
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    # Load Wisconsin Breast Cancer dataset
    data = load_breast_cancer()
    X_full = data.data
    y_raw = data.target  # 0 = malignant, 1 = benign

    # Invert labels so 1 = malignant (risk) for our risk scoring
    y = 1 - y_raw

    # Use only the first 10 features (mean values)
    X = X_full[:, :10]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=12,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "recall": round(recall_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred), 4),
        "f1": round(f1_score(y_test, y_pred), 4),
    }

    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    logger.info(f"Breast cancer model trained and saved. Metrics: {metrics}")
    return metrics


def predict(features: dict) -> dict:
    """
    Run breast cancer risk screening inference.

    Args:
        features: Dict with keys matching FEATURE_NAMES

    Returns:
        Dict with risk_score, risk_category, feature_importance, model metadata
    """
    _load_model()

    # Build feature vector in correct order
    feature_vector = np.array(
        [[features[name] for name in FEATURE_NAMES]]
    )

    # Scale
    scaled = _scaler.transform(feature_vector)

    # Predict probability
    probabilities = _model.predict_proba(scaled)[0]
    risk_score = float(probabilities[1])  # Probability of malignant class

    # Feature importance
    importances = _model.feature_importances_
    feature_importance = {
        name: round(float(imp), 4)
        for name, imp in zip(FEATURE_NAMES, importances)
    }

    # Sort by importance descending
    feature_importance = dict(
        sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
    )

    return {
        "risk_score": round(risk_score, 4),
        "risk_category": _categorize_risk(risk_score),
        "feature_importance": feature_importance,
        "model_name": "breast_cancer_rf",
        "model_version": MODEL_VERSION,
        "dataset_version": DATASET_VERSION,
    }
