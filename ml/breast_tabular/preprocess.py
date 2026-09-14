"""Leakage-aware preprocessing for approved, structured research CSV data."""
from __future__ import annotations
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

IDENTIFIER_TOKENS = ("patient", "patient_id", "subject", "mrn", "name", "email", "phone", "address", "dob")

def load_research_data(path: str, label_column: str, group_column: str | None = None):
    data = pd.read_csv(path)
    if label_column not in data: raise ValueError(f"Missing label column: {label_column}")
    prohibited = [c for c in data if any(token in c.lower() for token in IDENTIFIER_TOKENS) and c != group_column]
    if prohibited: raise ValueError(f"Identifier leakage risk; remove columns: {prohibited}")
    groups = data[group_column] if group_column and group_column in data else None
    features = data.drop(columns=[label_column] + ([group_column] if groups is not None else []))
    if features.empty: raise ValueError("No usable feature columns remain")
    return features, data[label_column], groups

def make_preprocessor(features: pd.DataFrame, select_k: int | None = None) -> Pipeline:
    numeric = features.select_dtypes(include="number").columns.tolist()
    categorical = [c for c in features.columns if c not in numeric]
    transforms = []
    if numeric: transforms.append(("numeric", Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), numeric))
    if categorical: transforms.append(("categorical", Pipeline([("impute", SimpleImputer(strategy="most_frequent")), ("encode", OneHotEncoder(handle_unknown="ignore"))]), categorical))
    steps = [("columns", ColumnTransformer(transforms))]
    if select_k: steps.append(("select", SelectKBest(f_classif, k=select_k)))
    return Pipeline(steps)
