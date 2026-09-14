-- Diagnex: Supabase-first breast self-awareness schema.
-- Run with `supabase db push` or paste into the Supabase SQL editor.
-- This application never stores passwords: Supabase Auth owns auth.users.

create type public.app_role as enum ('patient', 'admin', 'researcher');
create type public.breast_session_status as enum ('in_progress', 'completed', 'abandoned');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.app_role not null default 'patient',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.patient_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  date_of_birth date,
  city text,
  country text,
  optional_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patient_profiles(id) on delete cascade,
  consent_type text not null check (consent_type in ('data_storage', 'research_participation')),
  granted boolean not null,
  recorded_at timestamptz not null default now(),
  unique (patient_id, consent_type, recorded_at)
);

create table public.breast_awareness_sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patient_profiles(id) on delete cascade,
  status public.breast_session_status not null default 'in_progress',
  initial_description text,
  cumulative_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.breast_symptom_entries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.breast_awareness_sessions(id) on delete cascade,
  symptom_type text not null,
  value text,
  confidence numeric(4,3),
  source text not null check (source in ('natural_language', 'quick_reply', 'manual', 'system')),
  created_at timestamptz not null default now()
);

create table public.breast_location_entries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.breast_awareness_sessions(id) on delete cascade,
  side text check (side in ('left', 'right', 'both', 'not_sure')),
  region text,
  free_text_location text,
  created_at timestamptz not null default now()
);

create table public.breast_triage_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.breast_awareness_sessions(id) on delete cascade,
  triage_level text not null,
  rule_explanation text,
  recommended_action text,
  disclaimer text not null,
  created_at timestamptz not null default now()
);

create table public.breast_summary_reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.breast_awareness_sessions(id) on delete cascade,
  structured_summary jsonb not null,
  storage_bucket text not null default 'patient-reports',
  storage_path text unique,
  content_type text check (content_type in ('application/pdf', 'image/jpeg', 'image/png')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  resource text not null,
  resource_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index breast_sessions_patient_created_idx on public.breast_awareness_sessions(patient_id, created_at desc);
create index breast_symptoms_session_idx on public.breast_symptom_entries(session_id, created_at);
create index breast_locations_session_idx on public.breast_location_entries(session_id);
create index consent_records_patient_idx on public.consent_records(patient_id, recorded_at desc);
create index audit_logs_user_created_idx on public.audit_logs(user_id, created_at desc);

-- A trigger keeps application profiles in step with Supabase Auth. Only admins may
-- promote a role; all self-registered users are patients.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  insert into public.patient_profiles (profile_id) values (new.id);
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.owns_patient(patient uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.patient_profiles where id = patient and profile_id = auth.uid());
$$;

alter table public.profiles enable row level security;
alter table public.patient_profiles enable row level security;
alter table public.consent_records enable row level security;
alter table public.breast_awareness_sessions enable row level security;
alter table public.breast_symptom_entries enable row level security;
alter table public.breast_location_entries enable row level security;
alter table public.breast_triage_results enable row level security;
alter table public.breast_summary_reports enable row level security;
alter table public.audit_logs enable row level security;

create policy "own profile or admin" on public.profiles for all using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy "own patient profile or admin" on public.patient_profiles for all using (profile_id = auth.uid() or public.is_admin()) with check (profile_id = auth.uid() or public.is_admin());
create policy "own consent or admin" on public.consent_records for all using (public.owns_patient(patient_id) or public.is_admin()) with check (public.owns_patient(patient_id) or public.is_admin());
create policy "own sessions or admin" on public.breast_awareness_sessions for all using (public.owns_patient(patient_id) or public.is_admin()) with check (public.owns_patient(patient_id) or public.is_admin());
create policy "own session symptoms or admin" on public.breast_symptom_entries for all using (exists (select 1 from public.breast_awareness_sessions s where s.id = session_id and (public.owns_patient(s.patient_id) or public.is_admin()))) with check (exists (select 1 from public.breast_awareness_sessions s where s.id = session_id and (public.owns_patient(s.patient_id) or public.is_admin())));
create policy "own session locations or admin" on public.breast_location_entries for all using (exists (select 1 from public.breast_awareness_sessions s where s.id = session_id and (public.owns_patient(s.patient_id) or public.is_admin()))) with check (exists (select 1 from public.breast_awareness_sessions s where s.id = session_id and (public.owns_patient(s.patient_id) or public.is_admin())));
create policy "own session triage or admin" on public.breast_triage_results for select using (exists (select 1 from public.breast_awareness_sessions s where s.id = session_id and (public.owns_patient(s.patient_id) or public.is_admin())));
create policy "own session reports or admin" on public.breast_summary_reports for select using (exists (select 1 from public.breast_awareness_sessions s where s.id = session_id and (public.owns_patient(s.patient_id) or public.is_admin())));
create policy "own audit logs or admin" on public.audit_logs for select using (user_id = auth.uid() or public.is_admin());

-- Private Supabase Storage bucket. FastAPI uses the service role to upload and
-- issue time-limited URLs; browser clients receive no direct broad access.
insert into storage.buckets (id, name, public, allowed_mime_types)
values ('patient-reports', 'patient-reports', false, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do update set public = false, allowed_mime_types = excluded.allowed_mime_types;

