from __future__ import annotations
import json
from datetime import datetime, timezone
from pathlib import Path
import joblib

ROOT=Path(__file__).resolve().parent
def export_model(pipeline, version: str, metrics: dict) -> str:
    target=ROOT.parent / "models" / f"breast_tabular_{version}.joblib"; target.parent.mkdir(exist_ok=True)
    joblib.dump(pipeline,target); (target.with_suffix(".metrics.json")).write_text(json.dumps(metrics,indent=2)); return str(target)
def log_experiment(record: dict) -> None:
    target=ROOT.parent / "experiments" / "experiments.jsonl"; target.parent.mkdir(exist_ok=True)
    record["recorded_at"]=datetime.now(timezone.utc).isoformat(); target.open("a").write(json.dumps(record)+"\n")
def write_model_card(version:str, selected:str, metrics:dict, dataset:str, limitations:str) -> None:
    text=f"# Breast Tabular Research Model Card\n\n## Status\nResearch-only. Not for patient diagnosis or clinical decision-making.\n\n## Version\n{version}\n\n## Selected candidate\n{selected}\n\n## Dataset\n{dataset}\n\n## Evaluation\n```json\n{json.dumps(metrics,indent=2)}\n```\n\n## Limitations\n{limitations}\n\nSelection prioritizes sensitivity, specificity, calibration, false-negative review, and documented limitations; it is not selected by accuracy alone.\n"
    (ROOT / "model_card.md").write_text(text)
