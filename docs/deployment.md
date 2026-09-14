# Deployment and security baseline

Diagnex is a prototype and research platform, not a clinically validated device.
External clinical validation, privacy/security review, legal review, and qualified
clinical governance are required before any real patient deployment.

## Production architecture

Use Supabase-managed PostgreSQL and Supabase Auth. Do **not** run a production
PostgreSQL container. Deploy FastAPI, Next.js, Redis, optional Celery, and Nginx
with `docker compose -f docker-compose.production.yml --env-file .env.production up -d`.
Terminate HTTPS at Nginx or a trusted upstream TLS proxy, then enable HSTS.

## Secrets

Create `.env.production` from the example and inject its values from a VPS secret
manager. Never expose database credentials, Supabase service-role keys, JWT keys,
or encryption keys to browser code or commit them.

## Supabase

Apply migrations in `supabase/migrations/`, enable RLS for every sensitive table,
and create private buckets only. The backend issues short-lived signed URLs after
ownership checks; browser clients never receive service-role credentials.

## Retention, export, deletion, and recovery

Retain identifiable patient records only for the documented account retention term
approved by governance. Support account export and deletion/consent withdrawal via
authenticated, audited requests; deletion must be reviewed for legal retention
requirements. Configure Supabase point-in-time recovery/backups, periodically test
restoration into an isolated environment, and document each recovery exercise.

## Logging and monitoring

Send structured application logs to a protected sink, redact identifiers and tokens,
and configure an error-tracking provider through environment variables. Review audit
events for login, consent, upload, view, download, delete, and administrative work.
