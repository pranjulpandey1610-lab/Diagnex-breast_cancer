from abc import ABC, abstractmethod
from typing import Any, Dict, Tuple, Type
from pydantic import BaseModel, ValidationError

class BreastHealthSummaryPayload(BaseModel):
    model_version: str
    dataset_version: str
    risk_probability: float
    outcome_category: str
    confidence_score: float
    clinical_flags: Dict[str, Any]
    disclaimer_text: str
    safe_result_text: str

class BaseBreastHealthModule(ABC):
    """
    Abstract base class for breast health modules.
    Enforces a strict execution pipeline to ensure clinical safety.
    """
    
    @property
    @abstractmethod
    def disease_type(self) -> str:
        """String identifier for the disease (e.g., 'breast_cancer')"""
        pass
        
    @property
    @abstractmethod
    def input_schema(self) -> Type[BaseModel]:
        """Pydantic model representing the expected clinical inputs"""
        pass

    def execute(self, raw_inputs: Dict[str, Any]) -> Tuple[Dict[str, Any], BreastHealthSummaryPayload]:
        """
        Main execution pipeline. 
        Returns (validated_inputs_dict, breast_health_summary_payload)
        """
        # 1. Validation
        try:
            validated_inputs = self.input_schema(**raw_inputs)
        except ValidationError as e:
            raise ValueError(f"Input validation failed: {e.errors()}")

        # 2. Preprocessing
        processed_data = self.preprocess(validated_inputs)

        # 3. Guardrails Check
        guardrail_flags = self.check_guardrails(processed_data)
        
        # 4. Model Prediction
        prediction_output = self.predict(processed_data)
        
        # 5. Format Result
        result = self.format_result(prediction_output, guardrail_flags)
        
        return validated_inputs.model_dump(), result

    @abstractmethod
    def preprocess(self, inputs: BaseModel) -> Dict[str, Any]:
        """Convert validated schema into model-ready features."""
        pass

    @abstractmethod
    def check_guardrails(self, processed_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Apply business logic to detect impossible values or urgent conditions.
        Returns a dictionary of clinical flags.
        """
        pass

    @abstractmethod
    def predict(self, processed_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the ML model.
        Returns raw predictions, probabilities, and model metadata.
        """
        pass

    @abstractmethod
    def format_result(self, prediction_output: Dict[str, Any], flags: Dict[str, Any]) -> BreastHealthSummaryPayload:
        """
        Convert raw model output into a clinically safe BreastHealthSummaryPayload.
        MUST NOT return definitive diagnosis statements.
        """
        pass
