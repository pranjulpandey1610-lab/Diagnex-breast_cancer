# Diagnex Supabase Setup Guide

This project uses Supabase as the primary PostgreSQL database, authentication provider,
and private report-storage provider. The only application roles are `patient`, `admin`,
and `researcher`; self-registration always creates a patient.

## 1. Supabase Dashboard Setup

### Authentication
1. Go to **Authentication > Settings**.
2. Disable "Confirm Email" if you want auto-login upon registration for testing.
3. Keep default settings for JWT expiration.

### Storage
1. The migration creates the private `patient-reports` bucket automatically.
2. FastAPI uploads PDF, JPG, and PNG reports with the service-role key and returns
   short-lived signed URLs after it has authorized the patient.
3. Never expose the service-role key to the frontend.

### Database
Apply [`supabase/migrations/20260914180000_breast_awareness.sql`](../supabase/migrations/20260914180000_breast_awareness.sql)
with the Supabase CLI (`supabase db push`) or in the SQL editor. It creates the
breast-awareness tables, the Auth profile trigger, and row-level security policies.

## 2. Environment Variables

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (`backend/.env`)
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=postgresql://postgres.your-project-id:your-db-password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

## 3. Database Migrations

To apply the Supabase schema and RLS policies:
```bash
cd backend
source .venv/bin/activate
alembic upgrade head
```

This will run:
1. `0001_initial_schema`: Creates all tables (`profiles`, `patient_profiles`, etc.).
2. `0002_rls_policies`: Creates the `handle_new_user` trigger to sync `auth.users` with `public.profiles` and applies RLS policies.
