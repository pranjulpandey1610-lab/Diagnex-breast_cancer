# HACKATHON PRODUCT DOCUMENTATION
*A complete product, engineering & delivery record for Diagnex*

<div align="center">
  <img src="docs/images/Mammogram%20cover.png.png" width="32%" alt="Mammogram Cover" />
  <img src="docs/images/MRI%20cover.png.png" width="32%" alt="MRI Cover" />
  <img src="docs/images/Ultrasound%20cover.png.png" width="32%" alt="Ultrasound Cover" />
</div>

## 01 / PROJECT IDENTITY
- **Product / Project Name**: Diagnex (Breast Cancer Health Platform)
- **Team Name**: DIAGNEX
- **Team Leader**: Som Tiwari
- **Team Members**: Pranjul Pandey, Durgesh Mishra, Nivedita
- **Repository**: [Diagnex-breast_cancer](https://github.com/pranjulpandey1610-lab/Diagnex-breast_cancer.git)
- **Mentor**: [Needs your input]
- **Version**: 1.0

---

## 02 / EXECUTIVE SUMMARY
**Product Summary:** 
Diagnex is a secure, HIPAA-ready breast health screening and tracking platform. It allows users to document breast changes using guided symptom checkers, securely upload and organize medical imaging (mammograms, MRIs), and find specialized clinical care. It provides measurable value by empowering patients with organized health records and leveraging background machine learning pipelines for scan triage.

### Documentation
- **Problem**: Patients lack a secure, unified platform to track breast health changes, store complex imaging data, and confidently decide when to seek specialist care.
- **Target User**: Primary: Patients monitoring their breast health. Secondary: Clinical specialists reviewing patient-submitted data.
- **Core Solution**: A comprehensive portal featuring an interactive symptom assessment tool, secure medical document/image vault, and an AI-assisted analysis pipeline.
- **Primary Value**: Organization and peace of mind for patients, streamlined data collection for clinicians.
- **Differentiator**: Focus on patient privacy and structured triage rather than attempting to replace a doctor's diagnosis, backed by a robust, asynchronous ML microservice architecture.

---

## 03 / PROBLEM, USERS & OPPORTUNITY
**Problem Statement**: 
Women and individuals at risk for breast cancer often rely on fragmented methods (paper files, disparate patient portals) to track their breast health and medical scans. This friction delays specialist consultations and complicates longitudinal tracking, which is critical for early detection.

### Users & Stakeholders
| Persona | Goal | Pain Point | Success Looks Like |
|---|---|---|---|
| Primary User (Patient) | Safely store scans and track symptoms over time | Anxiety regarding symptoms, disorganized medical records | Peace of mind, easy access to records and local specialists |
| Secondary User (Specialist) | Review patient history before appointments | Missing previous scans or symptom context | Streamlined consultations with complete patient context |
| Admin / Operator | Maintain platform security and ML models | Handling PHI compliance (HIPAA) | Secure, zero-breach operation with accurate ML triage |

---

## 04 / PRODUCT REQUIREMENTS & USE CASES
### Core Use Cases
- **UC-01 (Patient)**: Complete a Breast Awareness Session -> Inputs symptoms -> System generates a triage recommendation.
- **UC-02 (Patient)**: Upload Medical Imaging -> Drags and drops DICOM/PDF -> System securely stores and encrypts file.
- **UC-03 (Patient)**: Find a Specialist -> Searches local directory -> System displays matching doctors and contact info.
- **UC-04 (System)**: Async ML Analysis -> Triggers on image upload -> Celery worker processes image and updates status to "Analyzed".

### Non-Functional Requirements
- **Performance**: Asynchronous ML processing must not block the main UI (handled via Redis/Celery).
- **Security**: Strict UUID primary keys, role-based JWT authentication, and encryption for sensitive health data (HIPAA readiness).

---

## 05 / UX, USER JOURNEY & PRODUCT FLOW
**End-to-End Workflow:**
1. **User Request**: Patient submits a new breast symptom report via the UI.
2. **Validation**: Next.js validates the form; FastAPI validates the JWT and payload.
3. **Processing**: Data is saved to PostgreSQL (`breast_symptom_entries`). 
4. **Data/AI**: If imaging is attached, a task is enqueued in Redis. A Celery worker processes the image against the Vision Model.
5. **Response**: FastAPI returns a triage result.
6. **Logging**: All actions are recorded in the `audit_logs` table for compliance.

---

## 06 / SYSTEM ARCHITECTURE & DATA FLOW
**Architecture Summary (Enterprise-Grade Microservices)**: 
Diagnex employs a cloud-native, event-driven microservices architecture to ensure high availability, zero-trust security (HIPAA compliance readiness), and horizontal scalability.
- **Edge / Ingress**: Cloudflare CDN & WAF routing to an API Gateway (Nginx/Kong).
- **Client**: Next.js 14+ Frontend (React Server Components, Edge Rendering).
- **Core Microservices**: FastAPI (Python) utilizing ASGI for high-concurrency async I/O.
- **Event-Driven Processing**: Event Broker (RabbitMQ/Kafka) orchestrating distributed ML Workers (Celery/GPU nodes).
- **Distributed Data Storage**: PostgreSQL 16 Cluster (PgBouncer + Read Replicas), Redis Caching Cluster, and AES-256 Encrypted Object Storage (S3).

### Component Register
- **Frontend (Next.js)**: Edge-rendered UI for minimal latency. Handles SSR, static generation, and client state via Zustand.
- **API Gateway & Core API (FastAPI)**: Serves as the central nervous system. Handles JWT auth, rate-limiting, and DDD-structured business logic.
- **Data Layer (PostgreSQL & Redis)**: Source of truth. Uses connection pooling (PgBouncer) to prevent starvation, with Redis caching sub-10ms queries.
- **Event Workers (Celery)**: Consumer nodes that run complex ML computer vision models asynchronously, decoupled from the main API threads.

---

## 07 / TECHNOLOGY STACK & ENGINEERING DESIGN
- **Frontend**: Next.js (App Router), React 19, Tailwind CSS v4, Framer Motion. *Chosen for Edge rendering capabilities, SEO, hardware-accelerated animations, and bundle optimization.*
- **Backend Core**: FastAPI, Python, SQLAlchemy 2.0. *Chosen for unparalleled async performance, OpenAPI auto-generation, and native ML ecosystem integration.*
- **Event-Driven Orchestration**: Redis, Celery (or Kafka/RabbitMQ in production). *Chosen to decouple monolithic workflows into resilient, retryable background tasks.*
- **Database & State**: PostgreSQL 16, PgBouncer. *Chosen for ACID compliance, JSONB support, and enterprise replication capabilities.*
- **DevOps & Observability**: Docker, GitHub Actions CI/CD, Prometheus/Grafana (APM). *Chosen for immutable infrastructure, automated testing pipelines, and real-time system telemetry.*

---

## 08 / DATA, APIS, SECURITY & PRIVACY
### Security & Privacy Controls
- **Authentication**: JWT-based authentication with strict roles (Patient, Admin, Researcher).
- **Database Obfuscation**: All entities use UUIDv4 primary keys to prevent enumeration attacks (e.g., guessing user IDs).
- **Audit Logging**: A dedicated `audit_logs` table tracks who accessed or modified specific records.
- **Data Isolation**: Patients can only query data tied to their specific `patient_profiles` ID.

---

## 09 / TESTING, DEPLOYMENT & OPERATIONS
### Deployment Strategy
The entire stack is containerized. Running `docker-compose up --build` spins up Postgres, Redis, the FastAPI Backend, the Celery Worker, and the Next.js Frontend simultaneously in an isolated network.

---

## 10 / IMPACT, ROADMAP & FINAL HANDOVER
### Roadmap
- **Now**: Core platform (UI, Backend, Auth, Uploads, Async Workers).
- **Next**: Integration with real hospital API endpoints (FHIR).
- **Future**: Advanced generative AI for translating complex radiology reports into plain language for patients.
