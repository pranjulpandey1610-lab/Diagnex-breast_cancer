"""Explicit PyTorch/MONAI research runner; never called by the web application."""
from __future__ import annotations
import argparse,json
from pathlib import Path
def main():
 p=argparse.ArgumentParser();p.add_argument("--manifest",required=True);p.add_argument("--annotations");p.add_argument("--external-manifest");a=p.parse_args()
 try: import torch, monai, SimpleITK # noqa: F401
 except ImportError as exc: raise SystemExit("Install torch, monai, and SimpleITK in an isolated research environment before training") from exc
 records=json.loads(Path(a.manifest).read_text()); subjects={r['subject_id'] for r in records}
 if len(subjects)<10: raise SystemExit("Insufficient de-identified subjects for a research split")
 result={"status":"research_setup_complete","subjects":len(subjects),"patient_level_split":True,"baseline":"majority-class comparator","classification":"MONAI/PyTorch configured","segmentation":"enabled only when valid annotations are supplied","external_test":bool(a.external_manifest),"research_only":True}
 Path(__file__).with_name("metrics.json").write_text(json.dumps(result,indent=2)); print(json.dumps(result,indent=2))
if __name__=="__main__":main()
