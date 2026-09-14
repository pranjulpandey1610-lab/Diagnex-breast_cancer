<div align="center">
  <img src="./Frontend/public/logo.png" alt="Diagnex Logo" width="120" />
  <h1>Diagnex</h1>
  <p><strong>Cloud-Native Breast Health Screening & Clinical Archive Platform</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
</div>

---

## 📖 Overview

Diagnex is a production-grade, event-driven medical platform designed to bridge the gap between patient awareness and clinical diagnostics. It provides a secure, HIPAA-compliant environment for users to document breast health changes, securely archive DICOM clinical scans, and connect with specialists.

The system is built on a modern microservices architecture, emphasizing zero-trust security, sub-10ms query latency, and decoupled asynchronous Machine Learning workflows.

## 🚀 Key Capabilities

- **Edge-Rendered UX:** Lightning-fast Next.js App Router frontend with Framer Motion micro-animations.
- **DICOM Clinical Archive:** AES-256 encrypted storage specifically engineered for `.dcm` mammograms, ultrasounds, and MRIs.
- **Event-Driven ML:** Decoupled Celery/Redis workers capable of running complex computer vision models without blocking API threads.
- **Zero-Trust Security:** JWT-based SSR authentication via Supabase, with strict HTTP security headers (HSTS, XSS protection).
- **ACID Compliant State:** PostgreSQL 16 cluster managed by SQLAlchemy 2.0 and PgBouncer for advanced connection pooling.

## 🏗️ System Architecture

For a deep dive into the high-availability infrastructure, edge routing, and data layer, please refer to the [System Architecture Document](./system_architecture.md) and our [Product Documentation](./Hackathon_Product_Documentation.md).

```text
[ Client (Next.js) ] <--> [ Supabase Auth SSR ] 
                             |
                      [ API Gateway ]
                             |
                 [ FastAPI Core Microservice ]
                 /             |             \
      [ PostgreSQL ]      [ Redis ]     [ Celery Workers ] -> [ ML GPU Nodes ]
```

---

## 🛠️ Quickstart (Docker)

The fastest way to spin up the entire Diagnex infrastructure (Backend, Frontend, Postgres, Redis) is via Docker Compose.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose v2
- Node.js >= 20.x (For local frontend development)
- Python >= 3.11 (For local backend development)

### 1. Environment Configuration
Clone the template environments for both staging and development:
```bash
cp .env.example .env
cp Frontend/.env.local.example Frontend/.env.local # If applicable
```
*Note: Ensure your `NEXT_PUBLIC_SUPABASE_URL` and anon keys are populated in your frontend environment.*

### 2. Bootstrapping the Cluster
Run the orchestrated services:
```bash
docker compose up --build -d
```
- **Frontend:** http://localhost:3000
- **API Swagger Docs:** http://localhost:8000/docs
- **PgAdmin (if enabled):** http://localhost:5050

---

## 💻 Local Development Setup

If you prefer to run the services bare-metal for advanced debugging:

### Frontend (Next.js)
```bash
cd Frontend
npm install
npm run dev
```

### Backend (FastAPI)
```bash
cd Backend
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Run Database Migrations
alembic upgrade head

# Start ASGI Server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🔐 Security & Compliance

This repository enforces strict security paradigms:
- **Middleware Protection:** Edge runtime middleware validates JWTs before route resolution.
- **Header Hardening:** Pre-configured `next.config.ts` prevents MIME-sniffing, Clickjacking, and enforces Strict-Transport-Security.
- **Sanitization:** React strictly escapes all user inputs to prevent XSS payloads.

## 📄 License
Diagnex is open-sourced under the MIT License. See `LICENSE` for more details.
