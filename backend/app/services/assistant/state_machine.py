from typing import Dict, Any, Tuple, List
from .extractor import extractor_service

class AssistantStateMachine:
    """
    Manages the conversational flow. Prevents asking questions the user already answered
    by tracking cumulative extracted entities.
    """
    
    def process_message(self, text: str, cumulative_state: Dict[str, Any]) -> Tuple[str, List[str], Dict[str, Any]]:
        """
        Process the user's message, update state, and return (next_question, quick_replies, updated_state)
        """
        if cumulative_state is None or not cumulative_state:
            cumulative_state = {
                "side": None,
                "location": [],
                "symptoms": [],
                "context": []
            }
            
        # 1. Extract from new message
        new_extractions = extractor_service.extract(text)
        
        # 2. Merge into cumulative state
        if new_extractions["side"] and not cumulative_state["side"]:
            cumulative_state["side"] = new_extractions["side"]
            
        for loc in new_extractions["location"]:
            if loc not in cumulative_state["location"]:
                cumulative_state["location"].append(loc)
                
        for sym in new_extractions["symptoms"]:
            if sym not in cumulative_state["symptoms"]:
                cumulative_state["symptoms"].append(sym)
                
        for ctx in new_extractions["context"]:
            if ctx not in cumulative_state["context"]:
                cumulative_state["context"].append(ctx)
                
        # 3. Determine next question based on missing data
        
        # If we have absolutely no symptoms, keep asking for symptoms
        if len(cumulative_state["symptoms"]) == 0:
            return (
                "Could you describe the specific changes you've noticed? For example: a new lump, pain, or skin changes.",
                ["New lump", "Pain", "Skin dimpling", "Nipple discharge", "None of these"],
                cumulative_state
            )
            
        # If we have symptoms but no side
        if not cumulative_state["side"]:
            return (
                "Which side is affected?",
                ["Left breast", "Right breast", "Both", "Not sure"],
                cumulative_state
            )
            
        # If we have side and symptoms, but no location detail
        if len(cumulative_state["location"]) == 0:
            return (
                "Where exactly is it located?",
                ["Upper area", "Lower area", "Inner side", "Outer side", "Near the nipple", "Underarm", "Not sure"],
                cumulative_state
            )
            
        # If we have side, symptom, location, but no duration
        if "duration" not in cumulative_state["context"]:
            return (
                "How long have you noticed this?",
                ["A few days", "A couple of weeks", "A few months", "More than a year"],
                cumulative_state
            )
            
        # If we have all required fields, ask if they have seen a specialist or if they want to review
        if "previous specialist consultation" not in cumulative_state["context"]:
            return (
                "Have you already seen a specialist or clinician about this specific issue?",
                ["Yes, saw a specialist", "No, not yet"],
                cumulative_state
            )
            
        # If everything is mostly filled out, suggest reviewing the summary
        return (
            "I think I have enough information. Are there any other symptoms, or are you ready to review the summary?",
            ["Ready to review", "Add more symptoms"],
            cumulative_state
        )

state_machine = AssistantStateMachine()
