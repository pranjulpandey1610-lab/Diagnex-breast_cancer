"""Train a research-only IDC histopathology patch baseline.

This deliberately accepts only the prepared, patient-grouped manifest.  It is
not connected to patient uploads and its output must never be shown as a
medical conclusion.
"""
from __future__ import annotations

import argparse
import csv
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
from PIL import Image
from sklearn.calibration import calibration_curve
from sklearn.linear_model import SGDClassifier
from sklearn.metrics import (
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)


def load_batch(rows: list[dict[str, str]], root: Path) -> tuple[np.ndarray, np.ndarray]:
    images = []
    labels = []
    for row in rows:
        with Image.open(root / row["image_path"]) as image:
            pixels = image.convert("L").resize((25, 25), Image.Resampling.BILINEAR)
            images.append(np.asarray(pixels, dtype=np.float32).reshape(-1) / 255.0)
        labels.append(int(row["label_id"]))
    return np.stack(images), np.asarray(labels, dtype=np.int8)


def predict_rows(model: SGDClassifier, rows: list[dict[str, str]], root: Path, batch_size: int) -> tuple[np.ndarray, np.ndarray]:
    labels, probabilities = [], []
    for start in range(0, len(rows), batch_size):
        features, y = load_batch(rows[start : start + batch_size], root)
        labels.append(y)
        probabilities.append(model.predict_proba(features)[:, 1])
    return np.concatenate(labels), np.concatenate(probabilities)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--processed-root", type=Path, required=True)
    parser.add_argument("--model-output", type=Path, required=True)
    parser.add_argument("--metrics-output", type=Path, required=True)
    parser.add_argument("--batch-size", type=int, default=512)
    parser.add_argument("--epochs", type=int, default=2)
    args = parser.parse_args()

    with args.manifest.open(newline="", encoding="utf-8") as handle:
        records = list(csv.DictReader(handle))
    partitions = {name: [row for row in records if row["split"] == name] for name in ("train", "validation", "test")}
    if not all(partitions.values()):
        raise SystemExit("Manifest must include non-empty train, validation, and test partitions.")
    subject_splits: dict[str, set[str]] = {}
    for row in records:
        subject_splits.setdefault(row["subject_id_hash"], set()).add(row["split"])
    if any(len(splits) != 1 for splits in subject_splits.values()):
        raise SystemExit("Patient-level split leakage detected; refusing to train.")

    train_counts = Counter(int(row["label_id"]) for row in partitions["train"])
    total_train = sum(train_counts.values())
    class_weight = {label: total_train / (2 * count) for label, count in train_counts.items()}
    model = SGDClassifier(loss="log_loss", class_weight=class_weight, alpha=0.0001, random_state=42)
    rng = np.random.default_rng(42)
    first_batch = True
    for epoch in range(args.epochs):
        order = rng.permutation(len(partitions["train"]))
        train_rows = [partitions["train"][index] for index in order]
        for start in range(0, len(train_rows), args.batch_size):
            features, labels = load_batch(train_rows[start : start + args.batch_size], args.processed_root)
            if first_batch:
                model.partial_fit(features, labels, classes=np.array([0, 1]))
                first_batch = False
            else:
                model.partial_fit(features, labels)
        print(f"completed epoch {epoch + 1}/{args.epochs}", flush=True)

    y_test, probability = predict_rows(model, partitions["test"], args.processed_root, args.batch_size)
    prediction = (probability >= 0.5).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_test, prediction, labels=[0, 1]).ravel()
    calibration_true, calibration_pred = calibration_curve(y_test, probability, n_bins=10, strategy="quantile")
    metrics = {
        "model_version": "idc_patch_sgd_v1",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "research_only": True,
        "not_for_patient_diagnosis": True,
        "task": "IDC-positive versus IDC-negative histopathology patch annotation",
        "input": "50x50 H&E histopathology PNG patch; resized to grayscale 25x25 for baseline",
        "patient_level_split": True,
        "split_rows": {name: len(rows) for name, rows in partitions.items()},
        "training_class_weight": class_weight,
        "test_label_balance": dict(sorted(Counter(map(str, y_test)).items())),
        "sensitivity": float(recall_score(y_test, prediction, zero_division=0)),
        "specificity": float(tn / (tn + fp)) if tn + fp else 0.0,
        "precision": float(precision_score(y_test, prediction, zero_division=0)),
        "f1": float(f1_score(y_test, prediction, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, probability)),
        "pr_auc": float(average_precision_score(y_test, probability)),
        "confusion_matrix": [[int(tn), int(fp)], [int(fn), int(tp)]],
        "false_negative_count": int(fn),
        "false_positive_count": int(fp),
        "calibration_curve": {"mean_predicted_probability": calibration_pred.tolist(), "fraction_of_positives": calibration_true.tolist()},
        "limitations": [
            "Single public source dataset; no external test set.",
            "Patch-level source annotations are not a patient-level conclusion.",
            "This baseline does not process DICOM mammograms, ultrasound, MRI, reports, or photographs.",
        ],
    }
    args.model_output.parent.mkdir(parents=True, exist_ok=True)
    args.metrics_output.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "version": metrics["model_version"], "input_shape": [25, 25], "research_only": True}, args.model_output)
    args.metrics_output.write_text(json.dumps(metrics, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
