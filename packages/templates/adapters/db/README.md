# db adapter templates

Database adapter templates implementing the `TodoRepo` port.

## Included adapters

- `in-memory`: zero-dependency baseline adapter.
- `sqlite`: `better-sqlite3` adapter with prepared statements.
- `postgres`: `postgres` (postgres.js) adapter.

## Stability + overhead choices

- SQLite choice: `better-sqlite3`
  - Pros: stable API, synchronous prepared statements, low runtime complexity.
  - Tradeoff: native module build step.
- Postgres choice: `postgres` (postgres.js)
  - Pros: small surface area, low overhead, prepared statements support.
  - Tradeoff: connection handling requires care in serverless.

## Vercel serverless note

Long-lived DB connections are tricky in serverless runtimes. Prefer managed pooling providers (Neon, Supabase, or PgBouncer-backed providers).

Recommended env conventions:

- `TODO_DB_PROVIDER`: `memory` | `sqlite` | `postgres`
- `TODO_SQLITE_PATH`: SQLite file path (default: `./data/app.sqlite`)
- `DATABASE_URL`: Postgres connection string
- `DATABASE_SSL`: `require` | `disable` (default: `require` in hosted envs)
- `DATABASE_MAX_CONNECTIONS`: integer, default `1` for serverless functions

## Minimal init/migration

Each DB adapter includes:

- `init.sql`: schema bootstrap script
- `init.ts`: tiny initializer runner
