import sys
import os
import uuid
import asyncio

# Add the backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User, Role
from app.models.profile import PatientProfile, PatientPreference
from app.models.breast_awareness import BreastAwarenessSession, BreastSymptomEntry, BreastSummaryReport, SessionStatus, EntrySource, BreastTriageResult
from app.core import security

def seed_data():
    db = SessionLocal()
    try:
        # Create Patient Role
        role_patient = db.query(Role).filter(Role.name == "patient").first()
        if not role_patient:
            role_patient = Role(name="patient", description="Patient Role")
            db.add(role_patient)
            db.commit()

        # Create Admin Role
        role_admin = db.query(Role).filter(Role.name == "admin").first()
        if not role_admin:
            role_admin = Role(name="admin", description="Admin Role")
            db.add(role_admin)
            db.commit()

        # Create Test Patient
        patient_email = "test.patient@diagnex.com"
        patient = db.query(User).filter(User.email == patient_email).first()
        if not patient:
            patient = User(
                email=patient_email,
                full_name="Jane Doe",
                password_hash=security.get_password_hash("password123"),
                is_active=True,
                is_verified=True
            )
            patient.roles.append(role_patient)
            db.add(patient)
            db.commit()
            db.refresh(patient)

            # Profile
            profile = PatientProfile(user_id=patient.id, city="San Francisco", country="USA")
            db.add(profile)
            db.commit()
            db.refresh(profile)

            # Preferences
            prefs = PatientPreference(patient_id=profile.id)
            db.add(prefs)
            db.commit()
            
            # Create a mock session
            session = BreastAwarenessSession(patient_id=profile.id, status=SessionStatus.COMPLETED)
            db.add(session)
            db.commit()
            db.refresh(session)
            
            # Mock entries
            entry1 = BreastSymptomEntry(
                session_id=session.id,
                symptom_type="user_input",
                value="I found a small lump on my left side",
                source=EntrySource.NATURAL_LANGUAGE
            )
            db.add(entry1)
            
            # Mock Summary
            summary_data = {
                "affected_side": "left",
                "new_lump": True,
                "location": "unknown"
            }
            summary = BreastSummaryReport(
                session_id=session.id,
                structured_summary=summary_data
            )
            db.add(summary)
            
            triage = BreastTriageResult(
                session_id=session.id,
                triage_level="needs-review",
                disclaimer="⚠️ This is NOT a medical diagnosis."
            )
            db.add(triage)
            
            db.commit()
            print("Successfully seeded demo data.")
        else:
            print("Demo data already exists.")
            
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
