from pydantic import BaseModel, Field
from typing import Optional, List

class DatasetRegistration(BaseModel):
    dataset_id: str = Field(pattern=r"^[a-zA-Z0-9_-]+$")
    name: str
    source_description: str
    source_url: Optional[str] = None
    license: str
    intended_use: str
    source_institution: str
    dataset_version: str
    date_obtained: str
    number_of_patients: Optional[int] = Field(default=None, ge=0)
    number_of_records: Optional[int] = Field(default=None, ge=0)
    features: List[str] = []
    label_definition: str
    limitations: str
    approval_status: str = "pending"
    research_only: bool = True

class DatasetQualityReport(BaseModel):
    status: str
    rows: int
    columns: List[str]
    missing_values: dict[str, int]
    duplicate_rows: int
    possible_identifier_columns: List[str]
    class_balance: dict[str, int]
    invalid_ranges: dict[str, int]
    label_available: bool
    contamination_risk: List[str]
    issues: List[str]
    manifest_path: str
