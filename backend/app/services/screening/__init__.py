from typing import Dict, Type
from app.services.screening.engine import BaseBreastHealthModule
from app.services.screening.modules.breast_cancer import BreastCancerScreeningModule

# Registry of available modules
MODULE_REGISTRY: Dict[str, Type[BaseBreastHealthModule]] = {
    "breast_cancer": BreastCancerScreeningModule
}

def get_screening_module(disease_type: str) -> BaseBreastHealthModule:
    module_class = MODULE_REGISTRY.get(disease_type)
    if not module_class:
        raise ValueError(f"No breast health module found for type: {disease_type}")
    return module_class()
