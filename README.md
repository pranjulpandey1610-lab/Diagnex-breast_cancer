# Diagnex Project

Diagnex is a production-ready breast health screening platform featuring:
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, PostgreSQL, SQLAlchemy, JWT Authentication
- **Background Processing**: Redis, Celery
- **Deployment**: Docker Compose

## Setup Instructions

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Start the infrastructure using Docker Compose:
   ```bash
   docker compose up --build
   ```

## Development

### Backend
1. Navigate to the `backend` directory.
2. Create a virtual environment and install dependencies:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -e ".[dev]"
   ```
3. Run Alembic migrations:
   ```bash
   alembic upgrade head
   ```
4. Start the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
