# Import all models to ensure Alembic can discover them
from app.models.profile import Profile, PatientProfile, ConsentRecord
from app.models.audit import AuditLog
from app.models.breast_awareness import BreastAwarenessSession, BreastSymptomEntry, BreastLocationEntry, BreastAnswer, BreastTriageResult, BreastSummaryReport
from app.models.research import ResearchDataset, DatasetVersion, DatasetValidationRun
from app.models.uploads import Upload, UploadedDocument, DocumentExtraction, ExtractedClinicalValue, FileAccessLog
from app.models.imaging import ImagingStudy, ImagingSeries, ImagingInstance, RadiologyReport, ImagingAccessLog
from app.models.patient_workflow import PatientNote, SavedNextStep, SpecialistContactRequest, ReferralResource, PatientActivityLog
from app.models.reports import SavedReport, ReportVersion, ReportAccessLog
from app.models.directory import Specialist, SpecialistLocation, SpecialistContactMethod
