# Diagnex Database Instructions

## Overview
The Diagnex database uses PostgreSQL with a strictly UUID-based schema.

## Key Changes
1. **UUID Primary Keys:** All tables use UUIDv4 for primary keys and foreign keys.
2. **Schema Separation:** Models are logically separated into `user.py`, `profile.py`, `breast_awareness.py`, `uploads.py`, `imaging.py`, `reports.py`, `directory.py`, and `research.py`.
3. **No Diabetes Logic:** All legacy diabetes references (models, migrations, seed scripts) have been eradicated.
4. **Roles:** Strict implementation of Patient, Admin, and Researcher roles (Doctor roles have been removed).

## Running Migrations
To generate new migrations:
```bash
alembic revision --autogenerate -m "migration message"
```

To apply migrations:
```bash
alembic upgrade head
```

## Seeding Demo Data
To seed initial admin, patient, and mock breast awareness session data:
```bash
PYTHONPATH=. python scripts/seed_demo_data.py
```
