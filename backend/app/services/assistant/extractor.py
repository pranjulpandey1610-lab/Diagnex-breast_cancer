import re
from typing import Dict, Any

class SymptomExtractor:
    """
    A rule-based NLP extractor that uses regex and keyword mapping to extract
    breast health symptoms from natural language text. Safely operates without
    external LLM APIs.
    """
    
    def __init__(self):
        # We define a mapping from the standardized entity name to a list of regex patterns
        self.rules = {
            "side": {
                "left": r"\b(left|l)\b",
                "right": r"\b(right|r)\b",
                "both": r"\b(both|bilateral)\b",
                "not sure": r"\b(not sure|unsure|don't know)\b"
            },
            "location": {
                "upper": r"\b(upper|top|above)\b",
                "lower": r"\b(lower|bottom|below)\b",
                "inner": r"\b(inner|inside|medial)\b",
                "outer": r"\b(outer|outside|lateral)\b",
                "nipple": r"\b(nipple|areola)\b",
                "underarm": r"\b(underarm|armpit|axilla|axillary)\b",
                "whole breast": r"\b(whole|entire|all over)\b"
            },
            "symptoms": {
                "new lump": r"\b(lump|bump|mass|nodule|knot)\b",
                "firm/thickened area": r"\b(firm|thick|thickened|thickening|hard area)\b",
                "underarm lump": r"\b(underarm lump|armpit lump|lump under arm|lump in armpit)\b",
                "pain": r"\b(pain|painful|hurt|hurts|ache|aching|sore|soreness)\b",
                "redness": r"\b(red|redness|erythema)\b",
                "warmth": r"\b(warm|warmth|hot)\b",
                "swelling": r"\b(swell|swelling|swollen|enlarged)\b",
                "skin dimpling/puckering": r"\b(dimple|dimpling|pucker|puckering|indentation|orange peel|peau d'orange)\b",
                "nipple inversion": r"\b(inverted nipple|nipple turning in|nipple inversion|nipple pulled in)\b",
                "nipple discharge": r"\b(discharge|leaking|fluid|liquid)\b",
                "bloody discharge": r"\b(blood|bloody)\b", # Requires logic to combine with discharge if needed, or standalone
                "nipple rash or scaling": r"\b(rash|scaling|flaky|scaly|itchy nipple)\b",
                "change in breast size or shape": r"\b(size change|shape change|changed shape|larger|smaller|asymmetric)\b"
            },
            "context": {
                "duration": r"\b(\d+\s+(days|weeks|months|years)|a few days|couple of weeks|since yesterday)\b",
                "progression": r"\b(getting worse|growing|increasing|spreading)\b",
                "previous specialist consultation": r"\b(saw a doctor|saw my doctor|went to doctor|physician|consulted|checked by|specialist)\b",
                "existing report": r"\b(mammogram|ultrasound|mri|biopsy|pathology report)\b"
            }
        }

    def extract(self, text: str) -> Dict[str, Any]:
        """
        Extracts entities from text and returns a dictionary of found items.
        """
        text = text.lower()
        extracted = {
            "side": None,
            "location": [],
            "symptoms": [],
            "context": []
        }
        
        # Extract side (take the first match, or handle conflicts later)
        for val, pattern in self.rules["side"].items():
            if re.search(pattern, text):
                extracted["side"] = val
                break
                
        # Extract locations
        for val, pattern in self.rules["location"].items():
            if re.search(pattern, text):
                extracted["location"].append(val)
                
        # Extract symptoms
        for val, pattern in self.rules["symptoms"].items():
            if re.search(pattern, text):
                extracted["symptoms"].append(val)
                
        # Refine symptoms: if "underarm lump" is found, ensure we don't double count generic "new lump" if it's the only one
        if "underarm lump" in extracted["symptoms"] and "new lump" in extracted["symptoms"]:
            # We keep both for safety, but UI will show them as distinct chips
            pass
            
        # Refine bloody discharge: if blood is mentioned near discharge, it's bloody discharge
        if "bloody discharge" in extracted["symptoms"] and "nipple discharge" in extracted["symptoms"]:
            extracted["symptoms"].remove("nipple discharge")
            
        # Extract context
        for val, pattern in self.rules["context"].items():
            if re.search(pattern, text):
                extracted["context"].append(val)
                
        return extracted

extractor_service = SymptomExtractor()
