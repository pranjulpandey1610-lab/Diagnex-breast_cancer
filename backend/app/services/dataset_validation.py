"""Local CSV validation for approved research datasets. Never consumes patient data."""
import csv, hashlib, json, re
from collections import Counter
from pathlib import Path
from typing import Any

IDENTIFIER_RE = re.compile(r"(patient|patient_id|mrn|name|email|phone|address|dob|date_of_birth|ssn)", re.I)
RANGE_HINTS = {"age": (0, 120), "radius": (0, 100), "texture": (0, 100), "area": (0, 100000), "perimeter": (0, 10000)}

def validate_csv(path: Path, dataset_id: str, label_column: str) -> dict[str, Any]:
    with path.open(newline="", encoding="utf-8-sig") as source:
        rows = list(csv.DictReader(source))
        columns = list(rows[0].keys()) if rows else []
    missing = {c: sum(not (row.get(c) or "").strip() for row in rows) for c in columns}
    duplicate_rows = len(rows) - len({tuple(sorted(r.items())) for r in rows})
    identifiers = [c for c in columns if IDENTIFIER_RE.search(c)]
    labels = Counter((r.get(label_column) or "").strip() for r in rows if (r.get(label_column) or "").strip())
    invalid = {}
    for column in columns:
        hint = next((v for key, v in RANGE_HINTS.items() if key in column.lower()), None)
        if hint:
            invalid[column] = sum(_not_in_range(row.get(column), hint) for row in rows)
    contamination = ["split column present; verify patient-level split before training"] if any(c.lower() in {"split", "set", "train_test"} for c in columns) else []
    issues = []
    if not rows: issues.append("Dataset has no records")
    if identifiers: issues.append("Possible patient identifier columns detected")
    if not labels: issues.append("Label column is missing or has no values")
    if duplicate_rows: issues.append("Duplicate rows detected")
    if labels and min(labels.values()) / max(1, len(rows)) < .1: issues.append("Class imbalance requires review")
    if any(invalid.values()): issues.append("Invalid numeric ranges detected")
    manifest_dir = Path("ml/data/manifests"); manifest_dir.mkdir(parents=True, exist_ok=True)
    manifest = {"dataset_id":dataset_id,"source_file":path.name,"sha256":hashlib.sha256(path.read_bytes()).hexdigest(),"validation":"local_rules_only","not_patient_data":True,"report": {"rows":len(rows),"columns":columns,"missing_values":missing,"duplicate_rows":duplicate_rows,"possible_identifier_columns":identifiers,"class_balance":dict(labels),"invalid_ranges":invalid,"label_available":bool(labels),"contamination_risk":contamination,"issues":issues}}
    manifest_path = manifest_dir / f"{dataset_id}.json"; manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return {**manifest["report"],"status":"approved_for_research_review" if not issues else "requires_review","manifest_path":str(manifest_path)}

def _not_in_range(value: str | None, bounds: tuple[int, int]) -> bool:
    if not value: return False
    try: return not bounds[0] <= float(value) <= bounds[1]
    except ValueError: return True
