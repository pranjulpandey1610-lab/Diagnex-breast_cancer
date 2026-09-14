"""
Diagnex Backend — Test Configuration

Pytest fixtures providing a test database, test client, and
authenticated tokens for each role.
"""

import os
import pytest

# Set test environment BEFORE importing app modules
os.environ["DATABASE_URL"] = "sqlite:///./test_diagnex.db"
os.environ["SECRET_KEY"] = "test-secret-key-do-not-use-in-production-1234567890"
os.environ["ENCRYPTION_KEY"] = ""  # Will auto-generate for tests
os.environ["ADMIN_EMAIL"] = "admin-seed@diagnex.local"
os.environ["ADMIN_PASSWORD"] = "AdminSeed1Pass"

# Clean up any leftover test DB
if os.path.exists("./test_diagnex.db"):
    os.remove("./test_diagnex.db")

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import hash_password, create_access_token
from app.db.base import Base, get_db
from app.db.models import User, UserRole

# Use in-memory SQLite with StaticPool so all connections share the same DB
test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Import app and override dependencies
from app.main import create_app

test_app = create_app()
test_app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function", autouse=True)
def setup_database():
    """Create fresh tables for each test, then drop after."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db():
    """Provide a test database session."""
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    """Provide a test HTTP client."""
    return TestClient(test_app)


@pytest.fixture
def patient_user(db) -> User:
    """Create and return a patient user."""
    user = User(
        email="patient@test.com",
        hashed_password=hash_password("Patient1Test"),
        full_name="Test Patient",
        role=UserRole.PATIENT,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def doctor_user(db) -> User:
    """Create and return a doctor user."""
    user = User(
        email="doctor@test.com",
        hashed_password=hash_password("Doctor1Test"),
        full_name="Dr. Test Doctor",
        role=UserRole.DOCTOR,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def admin_user(db) -> User:
    """Create and return an admin user."""
    user = User(
        email="admin@test.com",
        hashed_password=hash_password("Admin1Test"),
        full_name="Test Admin",
        role=UserRole.ADMIN,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def researcher_user(db) -> User:
    """Create and return a researcher user."""
    user = User(
        email="researcher@test.com",
        hashed_password=hash_password("Research1Test"),
        full_name="Test Researcher",
        role=UserRole.RESEARCHER,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _make_token(user: User) -> str:
    """Create an access token for a user."""
    return create_access_token({"sub": str(user.id), "role": user.role.value})


@pytest.fixture
def patient_token(patient_user) -> str:
    return _make_token(patient_user)


@pytest.fixture
def doctor_token(doctor_user) -> str:
    return _make_token(doctor_user)


@pytest.fixture
def admin_token(admin_user) -> str:
    return _make_token(admin_user)


@pytest.fixture
def researcher_token(researcher_user) -> str:
    return _make_token(researcher_user)


def auth_header(token: str) -> dict:
    """Build Authorization header dict."""
    return {"Authorization": f"Bearer {token}"}
