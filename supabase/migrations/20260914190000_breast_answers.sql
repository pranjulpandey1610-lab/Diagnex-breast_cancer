-- Local assistant answer history. These records are never used for model training.
create table if not exists public.breast_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.breast_awareness_sessions(id) on delete cascade,
  question_key text not null,
  value text not null,
  source text not null default 'manual',
  created_at timestamptz not null default now()
);
alter table public.breast_answers enable row level security;
create policy "own session answers or admin" on public.breast_answers for all using (
  exists (select 1 from public.breast_awareness_sessions s where s.id = session_id and (public.owns_patient(s.patient_id) or public.is_admin()))
) with check (
  exists (select 1 from public.breast_awareness_sessions s where s.id = session_id and (public.owns_patient(s.patient_id) or public.is_admin()))
);
