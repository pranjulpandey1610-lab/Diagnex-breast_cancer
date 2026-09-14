from typing import Dict, Any

class TriageEngine:
    """
    Evaluates extracted symptoms and assigns one of 4 strict triage categories.
    """
    
    LEVELS = {
        "LEVEL_1": {"label": "Level 1 — Discuss with a qualified clinician", "action": "Arrange a routine clinical appointment if the change is new or persists."},
        "LEVEL_2": {"label": "Level 2 — Prompt clinical appointment recommended", "action": "Please arrange a prompt appointment with a qualified healthcare professional."},
        "LEVEL_3": {"label": "Level 3 — Same-day clinical assessment recommended", "action": "Please seek same-day assessment from a qualified healthcare professional or an appropriate urgent-care service."},
    }

    def evaluate(self, finalized_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Takes the finalized entities and evaluates the clinical priority.
        """
        symptoms = set(finalized_data.get("symptoms", []))
        
        # 1. SAME DAY CRITERIA
        # Bloody discharge is highly alarming. 
        # Infection signs (redness + warmth + swelling) also warrant urgent care to rule out inflammatory breast cancer or mastitis.
        infection_count = sum(1 for s in ["redness", "warmth", "swelling", "pain"] if s in symptoms)
        if "bloody discharge" in symptoms or infection_count >= 3:
            return self.result("LEVEL_3", finalized_data)
            
        # 2. PROMPT CRITERIA (Within a few days to a week)
        # New lumps, skin dimpling, nipple inversion, underarm lumps are classic "red flags"
        prompt_flags = {"new lump", "skin dimpling/puckering", "nipple inversion", "underarm lump"}
        if symptoms.intersection(prompt_flags):
            return self.result("LEVEL_2", finalized_data)
            
        # 3. BOOK CRITERIA (Routine booking)
        # Persistent issues that aren't classic red flags but shouldn't be ignored
        book_flags = {"pain", "change in breast size or shape", "nipple discharge", "nipple rash or scaling", "firm/thickened area"}
        if symptoms.intersection(book_flags):
            return self.result("LEVEL_2", finalized_data)
            
        # 4. MONITOR CRITERIA
        # Default fallback for vague symptoms or when user has already seen a doctor
        return self.result("LEVEL_1", finalized_data)

    def result(self, level: str, finalized_data: Dict[str, Any]) -> Dict[str, Any]:
        answered = sum(bool(finalized_data.get(key)) for key in ("side", "location", "symptoms", "context"))
        completion_percent = int(answered / 4 * 100)
        result = {"level": level, "completion_percent": completion_percent, **self.LEVELS[level]}
        if level in {"LEVEL_2", "LEVEL_3"}:
            result["assessment_options"] = [
                "A clinical breast examination by a qualified healthcare professional",
                "Diagnostic mammography or targeted breast ultrasound when the clinician considers it appropriate",
                "Review of any existing imaging or pathology reports",
            ]
        else:
            result["assessment_options"] = []
        return result

triage_service = TriageEngine()
