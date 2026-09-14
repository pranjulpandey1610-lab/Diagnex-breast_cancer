from pathlib import Path
import json
def register(version:str,metadata:dict):
 target=Path(__file__).parent.parent/"models"/f"breast_imaging_{version}.json";target.parent.mkdir(exist_ok=True);metadata.update({"version":version,"research_only":True,"patient_access":False});target.write_text(json.dumps(metadata,indent=2));return str(target)
