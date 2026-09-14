import os
import json
import joblib
from datetime import datetime
from typing import Dict, Any, Tuple
from sklearn.pipeline import Pipeline

REGISTRY_DIR = os.path.join(os.path.dirname(__file__), "registry")
METRICS_FILE = os.path.join(REGISTRY_DIR, "metrics.json")
MODEL_CARD_FILE = os.path.join(REGISTRY_DIR, "model_card.md")
MODEL_BIN_FILE = os.path.join(REGISTRY_DIR, "production_model.joblib")

def save_model(
    model: Pipeline, 
    metrics: Dict[str, Any], 
    features: list[str], 
    version: str, 
    algorithm_name: str,
    dataset_version: str
):
    os.makedirs(REGISTRY_DIR, exist_ok=True)
    
    joblib.dump(model, MODEL_BIN_FILE)
    
    metadata = {
        "model_version": version,
        "algorithm": algorithm_name,
        "dataset_version": dataset_version,
        "training_date": datetime.utcnow().isoformat(),
        "features": features,
        "metrics": metrics,
        "limitations": [
            "This model was trained on synthetic/mock data for demonstration.",
            "Not validated for clinical use.",
            "Does not replace professional medical advice."
        ]
    }
    
    with open(METRICS_FILE, "w") as f:
        json.dump(metadata, f, indent=4)
        
    _generate_model_card(metadata)

def load_production_model() -> Tuple[Pipeline, Dict[str, Any]]:
    if not os.path.exists(MODEL_BIN_FILE) or not os.path.exists(METRICS_FILE):
        raise FileNotFoundError("Production model or metrics not found in registry. Please run train.py first.")
        
    model = joblib.load(MODEL_BIN_FILE)
    with open(METRICS_FILE, "r") as f:
        metadata = json.load(f)
        
    return model, metadata

def _generate_model_card(metadata: Dict[str, Any]):
    metrics = metadata["metrics"]
    
    md = f"""# Model Card: Breast Health Screening Module

## Model Details
- **Version:** {metadata["model_version"]}
- **Algorithm:** {metadata["algorithm"]}
- **Training Date:** {metadata["training_date"]}
- **Dataset Version:** {metadata["dataset_version"]}

## Intended Use
- **Primary Use:** To estimate risk patterns for breast cancer based on structured clinical inputs.
- **Out of Scope:** Definitive diagnosis. 

## Features Used
{', '.join(metadata['features'])}

## Metrics (Test Set)
- **Accuracy:** {metrics['accuracy']:.4f}
- **Precision:** {metrics['precision']:.4f}
- **Recall (Sensitivity):** {metrics['recall_sensitivity']:.4f}
- **Specificity:** {metrics['specificity']:.4f}
- **F1 Score:** {metrics['f1_score']:.4f}
- **ROC-AUC:** {metrics['roc_auc']:.4f}
- **PR-AUC:** {metrics['pr_auc']:.4f}

## Limitations & Ethical Considerations
"""
    for limit in metadata["limitations"]:
        md += f"- {limit}\n"
        
    md += "\n> **Disclaimer:** SCREENING ESTIMATE ONLY — NOT A DIAGNOSTIC DEVICE.\n"
    
    with open(MODEL_CARD_FILE, "w") as f:
        f.write(md)
