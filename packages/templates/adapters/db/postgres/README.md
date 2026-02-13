# postgres TodoRepo adapter

Postgres adapter template for `TodoRepo` using `postgres` (postgres.js).

## Dependency additions

- dependencies:
  - `postgres`

## Public API

- `createPostgresTodoRepo({ databaseUrl, ssl, maxConnections })`
- `initializePostgresSchema({ databaseUrl, ssl, maxConnections })`

## Tradeoff

`postgres` keeps overhead low and works well with prepared statements. In serverless, connection management still requires pooled providers and low per-function connection limits.

## Vercel note

Use pooled Postgres endpoints (Neon, Supabase pooler, or PgBouncer-backed URL). Keep `DATABASE_MAX_CONNECTIONS=1` per function unless load testing proves higher values are safe.
