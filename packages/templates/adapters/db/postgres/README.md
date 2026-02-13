# postgres TodoRepo adapter

Postgres adapter template for `TodoRepo` using `postgres` (postgres.js), with embedded PGlite fallback when no URL is provided.

## Dependency additions

- dependencies:
  - `@electric-sql/pglite`
  - `postgres`

## Public API

- `createPostgresTodoRepo({ databaseUrl?, localDbPath?, ssl, maxConnections })`
- `initializePostgresSchema({ databaseUrl, ssl, maxConnections })`

## Tradeoff

`postgres` keeps overhead low and works well with prepared statements. When no `databaseUrl` is provided, the adapter uses local PGlite storage for zero-config local development.

## Vercel note

Use pooled Postgres endpoints (Neon, Supabase pooler, or PgBouncer-backed URL). Keep `DATABASE_MAX_CONNECTIONS=1` per function unless load testing proves higher values are safe.
