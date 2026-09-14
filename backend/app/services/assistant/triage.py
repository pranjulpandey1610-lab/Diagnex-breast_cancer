from typing import List, Dict, Any

class TriageEngine:
    """
    Evaluates extracted symptoms and assigns one of 4 strict triage categories.
    """
    
    CATEGORIES = {
        "SAME_DAY": "Same-day clinical assessment recommended",
        "PROMPT": "Prompt clinical assessment recommended",
        "BOOK": "Book a clinical appointment",
        "MONITOR": "Monitor and discuss with a clinician"
    }

    def evaluate(self, finalized_data: Dict[str, Any]) -> str:
        """
        Takes the finalized entities and evaluates the clinical priority.
        """
        symptoms = set(finalized_data.get("symptoms", []))
        
        # 1. SAME DAY CRITERIA
        # Bloody discharge is highly alarming. 
        # Infection signs (redness + warmth + swelling) also warrant urgent care to rule out inflammatory breast cancer or mastitis.
        infection_count = sum(1 for s in ["redness", "warmth", "swelling", "pain"] if s in symptoms)
        if "bloody discharge" in symptoms or infection_count >= 3:
            return self.CATEGORIES["SAME_DAY"]
            
        # 2. PROMPT CRITERIA (Within a few days to a week)
        # New lumps, skin dimpling, nipple inversion, underarm lumps are classic "red flags"
        prompt_flags = {"new lump", "skin dimpling/puckering", "nipple inversion", "underarm lump"}
        if symptoms.intersection(prompt_flags):
            return self.CATEGORIES["PROMPT"]
            
        # 3. BOOK CRITERIA (Routine booking)
        # Persistent issues that aren't classic red flags but shouldn't be ignored
        book_flags = {"pain", "change in breast size or shape", "nipple discharge", "nipple rash or scaling", "firm/thickened area"}
        if symptoms.intersection(book_flags):
            return self.CATEGORIES["BOOK"]
            
        # 4. MONITOR CRITERIA
        # Default fallback for vague symptoms or when user has already seen a doctor
        return self.CATEGORIES["MONITOR"]

triage_service = TriageEngine()
