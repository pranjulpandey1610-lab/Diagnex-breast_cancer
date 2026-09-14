import sys
import os
import pandas as pd
import numpy as np
import logging

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from sklearn.datasets import make_classification
from sklearn.model_selection import GroupShuffleSplit, StratifiedGroupKFold, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.pipeline import Pipeline

from ml.breast_cancer.preprocess import build_preprocessing_pipeline, BREAST_CANCER_FEATURES
from ml.breast_cancer.evaluate import compute_metrics
from ml.breast_cancer.model_registry import save_model

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def generate_synthetic_breast_cancer_data(n_samples=2000, n_patients=1500):
    """
    Generate synthetic clinical data mimicking breast cancer risk screening features.
    """
    logging.info(f"Generating synthetic dataset with {n_samples} records for {n_patients} patients...")
    X, y = make_classification(
        n_samples=n_samples,
        n_features=len(BREAST_CANCER_FEATURES),
        n_informative=4,
        n_redundant=1,
        weights=[0.8, 0.2], # highly imbalanced screening data
        random_state=42
    )
    
    df = pd.DataFrame(X, columns=BREAST_CANCER_FEATURES)
    df["outcome"] = y
    
    # Scale continuous synthetic features into realistic ranges
    df["age"] = np.clip(df["age"] * 10 + 55, 30, 90).astype(int)
    df["age_at_menarche"] = np.clip(df["age_at_menarche"] * 2 + 12, 9, 17).astype(int)
    
    # Convert some features to boolean or categorical
    df["history_of_biopsy"] = (df["history_of_biopsy"] > 0).astype(bool)
    df["family_history_breast_cancer"] = (df["family_history_breast_cancer"] > 0.5).astype(bool)
    df["birads_density_category"] = np.clip((df["birads_density_category"] + 2).round(), 1, 4).astype(int)
    
    # Age at first birth: some nulliparous (simulated as NaN or 0, we use NaN or extreme val, let's use null)
    df["age_at_first_birth"] = np.clip(df["age_at_first_birth"] * 4 + 25, 15, 45).astype(float)
    df.loc[df.sample(frac=0.2).index, "age_at_first_birth"] = np.nan
    
    # Assign patient IDs
    patient_ids = np.random.choice(range(1, n_patients + 1), size=n_samples, replace=True)
    df["patient_id"] = patient_ids
    
    return df

def train_and_evaluate():
    df = generate_synthetic_breast_cancer_data()
    
    X = df[BREAST_CANCER_FEATURES]
    y = df["outcome"]
    groups = df["patient_id"]
    
    gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    train_idx, test_idx = next(gss.split(X, y, groups))
    
    X_train, y_train, groups_train = X.iloc[train_idx], y.iloc[train_idx], groups.iloc[train_idx]
    X_test, y_test = X.iloc[test_idx], y.iloc[test_idx]
    
    logging.info(f"Training set: {len(X_train)} records. Test set: {len(X_test)} records.")
    
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, class_weight="balanced", random_state=42, max_depth=5),
        "Naive Bayes": GaussianNB()
    }
    
    best_model_name = None
    best_model_pipeline = None
    best_metrics = None
    best_score = -1 
    
    cv = StratifiedGroupKFold(n_splits=5)
    
    for name, estimator in models.items():
        logging.info(f"--- Training {name} ---")
        pipeline = Pipeline([
            ('preprocessor', build_preprocessing_pipeline()),
            ('classifier', estimator)
        ])
        
        cv_scores = cross_val_score(pipeline, X_train, y_train, groups=groups_train, cv=cv, scoring='roc_auc')
        logging.info(f"{name} CV ROC-AUC: {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")
        
        pipeline.fit(X_train, y_train)
        
        y_pred = pipeline.predict(X_test)
        y_prob = pipeline.predict_proba(X_test)[:, 1]
        
        metrics = compute_metrics(y_test, y_pred, y_prob)
        logging.info(f"{name} Test Recall: {metrics['recall_sensitivity']:.4f}, PR-AUC: {metrics['pr_auc']:.4f}")
        
        combined_score = (metrics['pr_auc'] + metrics['recall_sensitivity']) / 2
        
        if combined_score > best_score:
            best_score = combined_score
            best_model_name = name
            best_model_pipeline = pipeline
            best_metrics = metrics

    logging.info("=================================")
    logging.info(f"Selected Best Model: {best_model_name} (Score: {best_score:.4f})")
    
    save_model(
        model=best_model_pipeline,
        metrics=best_metrics,
        features=BREAST_CANCER_FEATURES,
        version="v1.0.0",
        algorithm_name=best_model_name,
        dataset_version="synthetic-breast-v1"
    )
    logging.info("Model saved to registry successfully.")

if __name__ == "__main__":
    train_and_evaluate()
