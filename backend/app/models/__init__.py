# Import all models to ensure Alembic can discover them
from app.models.profile import Profile, PatientProfile, ConsentRecord
from app.models.audit import AuditLog
from app.models.breast_awareness import BreastAwarenessSession, BreastSymptomEntry, BreastLocationEntry, BreastTriageResult, BreastSummaryReport
