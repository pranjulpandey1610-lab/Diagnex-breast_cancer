import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import jwt
import uuid

from app.main import app
from app.db.base import Base
from app.api.deps import get_db, get_current_user
from app.models.profile import Profile, Role
from app.core.config import settings

# Setup in-memory SQLite DB for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    # Import all models to ensure they are created
    import app.models
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    # Ensure default roles exist
    for role_name in ["patient", "admin", "researcher"]:
        if not session.query(Role).filter_by(name=role_name).first():
            session.add(Role(name=role_name))
    session.commit()
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def patient_user(db_session):
    role = db_session.query(Role).filter_by(name="patient").first()
    profile = Profile(id=uuid.uuid4(), email="patient@example.com", full_name="Test Patient", is_active=True)
    profile.roles.append(role)
    db_session.add(profile)
    db_session.commit()
    return profile

def generate_mock_supabase_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "aud": "authenticated",
        "role": "authenticated"
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS256")

@pytest.fixture
def patient_token_headers(db_session, client):
    # Create the user directly
    role = db_session.query(Role).filter_by(name="patient").first()
    pid = uuid.uuid4()
    profile = Profile(id=pid, email="newpatient@example.com", full_name="New Patient", is_active=True)
    profile.roles.append(role)
    db_session.add(profile)
    db_session.commit()
    
    token = generate_mock_supabase_token(str(pid))
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def admin_token_headers(db_session, client):
    # Create the user directly
    role = db_session.query(Role).filter_by(name="admin").first()
    pid = uuid.uuid4()
    profile = Profile(id=pid, email="admin@example.com", full_name="Admin User", is_active=True)
    profile.roles.append(role)
    db_session.add(profile)
    db_session.commit()
    
    token = generate_mock_supabase_token(str(pid))
    return {"Authorization": f"Bearer {token}"}
