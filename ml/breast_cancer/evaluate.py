import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix
)
from sklearn.calibration import calibration_curve

def compute_metrics(y_true, y_pred, y_prob) -> dict:
    """
    Computes a comprehensive suite of clinical metrics.
    """
    acc = accuracy_score(y_true, y_pred)
    precision = precision_score(y_true, y_pred, zero_division=0)
    recall = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
    
    try:
        roc_auc = roc_auc_score(y_true, y_prob)
    except ValueError:
        roc_auc = 0.5
        
    try:
        pr_auc = average_precision_score(y_true, y_prob)
    except ValueError:
        pr_auc = 0.0
        
    fraction_of_positives, mean_predicted_value = calibration_curve(y_true, y_prob, n_bins=5)
    
    metrics = {
        "accuracy": float(acc),
        "precision": float(precision),
        "recall_sensitivity": float(recall),
        "specificity": float(specificity),
        "f1_score": float(f1),
        "roc_auc": float(roc_auc),
        "pr_auc": float(pr_auc),
        "confusion_matrix": {
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp)
        },
        "calibration_curve": {
            "fraction_of_positives": fraction_of_positives.tolist(),
            "mean_predicted_value": mean_predicted_value.tolist()
        }
    }
    
    return metrics
