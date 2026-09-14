"""Prepare the public IDC histopathology patches for research-only training.

The source patient folder name is never written to the manifest.  Splits are
assigned by source patient before image records are created, preventing a
patient's patches from appearing in more than one partition.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path


FILENAME = re.compile(
    r"^(?P<subject>.+?)_idx\d+_x\d+_y\d+_class(?P<label>[01])\.png$",
    re.IGNORECASE,
)
SPLIT_RATIOS = (("train", 0.70), ("validation", 0.15), ("test", 0.15))


def pseudonymize(subject: str, salt: str) -> str:
    return hashlib.sha256(f"{salt}:{subject}".encode("utf-8")).hexdigest()[:24]


def patient_split(patient_labels: dict[str, int]) -> dict[str, str]:
    """Create a deterministic, label-stratified split at the patient level."""
    by_label: dict[int, list[str]] = defaultdict(list)
    for patient, label in patient_labels.items():
        by_label[label].append(patient)

    assignments: dict[str, str] = {}
    for label, patients in by_label.items():
        ordered = sorted(
            patients, key=lambda value: hashlib.sha256(value.encode("utf-8")).hexdigest()
        )
        counts = [round(len(ordered) * ratio) for _, ratio in SPLIT_RATIOS]
        counts[0] += len(ordered) - sum(counts)
        start = 0
        for (split, _), count in zip(SPLIT_RATIOS, counts):
            for patient in ordered[start : start + count]:
                assignments[patient] = split
            start += count
    return assignments


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--processed-root", type=Path, required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--salt-env", default="IDC_MANIFEST_SALT")
    args = parser.parse_args()
    salt = os.environ.get(args.salt_env)
    if not salt:
        raise SystemExit(f"Set {args.salt_env} to a private random value before running.")

    images: list[tuple[Path, str, int]] = []
    labels_by_patient: dict[str, set[int]] = defaultdict(set)
    for image in sorted(args.source.rglob("*.png")):
        match = FILENAME.match(image.name)
        if not match:
            continue
        patient, label = match.group("subject"), int(match.group("label"))
        images.append((image, patient, label))
        labels_by_patient[patient].add(label)
    if not images:
        raise SystemExit("No IDC PNG patches found at the supplied source path.")

    # Positive means this source patient has at least one IDC-positive patch;
    # this is used only to balance groups, never as an inference target.
    patient_labels = {patient: int(1 in labels) for patient, labels in labels_by_patient.items()}
    assignments = patient_split(patient_labels)
    args.manifest.parent.mkdir(parents=True, exist_ok=True)
    args.processed_root.mkdir(parents=True, exist_ok=True)
    counts: Counter[str] = Counter()
    fieldnames = [
        "image_path", "subject_id_hash", "label_id", "label_definition", "split",
        "source_dataset", "source_version", "image_width", "image_height", "modality",
        "deidentification_status", "research_only",
    ]
    with args.manifest.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for image, patient, label in images:
            split = assignments[patient]
            subject_hash = pseudonymize(patient, salt)
            image_key = hashlib.sha256(
                f"{salt}:{image.relative_to(args.source)}".encode("utf-8")
            ).hexdigest()[:32]
            relative_path = Path("idc_regular_ps50_idx5") / subject_hash / str(label) / f"{image_key}.png"
            processed_path = args.processed_root / relative_path
            processed_path.parent.mkdir(parents=True, exist_ok=True)
            if not processed_path.exists():
                processed_path.symlink_to(image.resolve())
            counts[f"{split}:{label}"] += 1
            writer.writerow({
                "image_path": str(relative_path),
                "subject_id_hash": subject_hash,
                "label_id": label,
                "label_definition": "IDC-positive patch annotation" if label else "IDC-negative patch annotation",
                "split": split,
                "source_dataset": "IDC_regular_ps50_idx5",
                "source_version": "public archive dated 2020-02-06",
                "image_width": 50,
                "image_height": 50,
                "modality": "H&E histopathology patch",
                "deidentification_status": "source identifier pseudonymized in manifest",
                "research_only": True,
            })
    metadata = {
        "dataset_id": "idc_regular_ps50_idx5",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "archive_sha256": "55022d403bb3b738ef5df518e62a11d6de52daddaf3850e05134e669133b51c9",
        "source": "https://andrewjanowczyk.com/wp-static/IDC_regular_ps50_idx5.zip",
        "records": len(images),
        "source_subjects": len(labels_by_patient),
        "patient_grouped_split": True,
        "split_label_counts": dict(sorted(counts.items())),
        "research_only": True,
        "not_for_patient_diagnosis": True,
    }
    args.manifest.with_suffix(".json").write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()
