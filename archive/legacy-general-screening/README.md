# 🔬 Diagnex — Secure Medical Screening Platform

> ⚠️ **Medical Disclaimer:** Diagnex provides screening estimates for research and informational purposes only. It is NOT a medical diagnostic device. All AI results require clinician review before any clinical decisions. Consult a qualified healthcare provider for medical advice.

## Overview

Diagnex is a secure, full-stack medical screening web application featuring:

- **AI Risk Screening** — Self-hosted scikit-learn models for diabetes and breast cancer risk assessment
- **Role-Based Access Control** — Patient, Doctor, Admin, and Researcher roles with strictly scoped permissions
- **Encrypted Data Storage** — Patient data encrypted at rest using Fernet/AES-256
- **Clinician Review Workflow** — Every AI result requires clinician review before clinical use
- **Immutable Audit Trail** — All actions logged (logins, screenings, file access, reviews)
- **Model Versioning** — Every prediction linked to specific model and dataset versions
- **No Paid APIs** — All ML inference is self-hosted using open-source tools

## Project Organization

The active application lives at this repository root. Its runnable services are
`backend/` and `frontend/`, coordinated by the root `docker-compose.yml`.

An incompatible, work-in-progress implementation was found nested inside the
project. It has been preserved separately at
[`archive/diagnex-prototype/`](archive/diagnex-prototype/) so its distinct
database schema, API routes, Docker configuration, and ML workflow cannot be
mistaken for part of the active application. See
[`archive/README.md`](archive/README.md) before using it.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, TypeScript, Zustand, Recharts, Lucide Icons |
| **Backend** | FastAPI, Python 3.11+, SQLAlchemy, Pydantic |
| **Database** | PostgreSQL 16 (production) / SQLite (development) |
| **ML** | scikit-learn, joblib, NumPy |
| **Security** | JWT (python-jose), bcrypt, Fernet encryption |
| **Deployment** | Docker Compose |

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- (Optional) Docker & Docker Compose

### Development Setup

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env with your settings

# 2. Backend
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000

# 3. Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs

### Docker Compose

```bash
cp .env.example .env
# Edit .env with production values
docker compose up --build
```

## Running Tests

```bash
cd backend
source .venv/bin/activate
pytest tests/ -v --cov=app
```

## Project Structure

```
Dia-Breast/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI routers (auth, screening, review, uploads, admin, users)
│   │   ├── core/         # Config, security, audit logging
│   │   ├── db/           # SQLAlchemy models, base, initialization
│   │   └── ml/           # ML models (diabetes, breast cancer), training scripts
│   ├── tests/            # Pytest test suite (53 tests)
│   └── pyproject.toml
├── frontend/
│   └── src/
│       ├── app/          # Next.js App Router pages
│       │   ├── auth/     # Login, Register
│       │   └── dashboard/# Patient, Doctor, Admin, Researcher dashboards
│       └── lib/          # API client, auth store
├── docker-compose.yml
├── .env.example
└── README.md
```

## Security Features

- 🔐 **JWT Authentication** — Short-lived access tokens (15 min), refresh tokens (7 days)
- 🔑 **bcrypt Password Hashing** — Industry-standard password security
- 🔒 **File Encryption** — All uploads encrypted at rest using Fernet (AES-128-CBC + HMAC)
- 🛡️ **RBAC** — Four roles with precisely scoped API permissions
- 📋 **Audit Logging** — Immutable, append-only audit trail with hashed details (no raw PHI in logs)
- 🚫 **No Auto-Training** — Patient uploads are never used to automatically train models
- 🌐 **CORS Lockdown** — Restricted to configured frontend origin
- 🔄 **Global Error Handler** — Never exposes internal details or PHI in error responses

## Roles

| Role | Permissions |
|------|------------|
| **Patient** | Submit screenings, view own results, upload/download own files |
| **Doctor** | All patient permissions + review AI results, add clinical notes |
| **Admin** | User management, audit logs, system stats, model registry |
| **Researcher** | View model registry and aggregated stats (no patient data) |

## License

This project is for educational and research purposes only.
