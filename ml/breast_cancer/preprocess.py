import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer

BREAST_CANCER_FEATURES = [
    "age",
    "age_at_menarche",
    "age_at_first_birth",
    "history_of_biopsy",
    "family_history_breast_cancer",
    "birads_density_category"
]

def build_preprocessing_pipeline() -> Pipeline:
    """
    Builds a scikit-learn preprocessing pipeline for breast health features.
    """
    
    # Simple median imputation and scaling for all numeric features
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, list(range(len(BREAST_CANCER_FEATURES))))
        ],
        remainder='passthrough'
    )
    
    return Pipeline(steps=[
        ('preprocessor', preprocessor)
    ])

def prepare_input_data(data: dict) -> pd.DataFrame:
    """
    Converts a dictionary into a DataFrame with correct column order.
    """
    df = pd.DataFrame([data])
    return df[BREAST_CANCER_FEATURES]
