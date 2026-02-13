# sqlite TodoRepo adapter

SQLite adapter template for `TodoRepo` using `better-sqlite3` with prepared statements.

## Dependency additions

- dependencies:
  - `better-sqlite3`
- devDependencies:
  - `@types/better-sqlite3`

## Public API

- `createSqliteTodoRepo({ dbFilePath })`
- `initializeSqliteSchema({ dbFilePath })`

## Tradeoff

`better-sqlite3` is stable and fast with low abstraction overhead, but it is a native addon and requires platform-compatible builds.

## Vercel note

SQLite is best for local/dev or single-instance deploys. For distributed serverless deployments, prefer Postgres with a pooling provider.
