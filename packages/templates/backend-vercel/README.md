# backend-vercel template

Vercel-first backend template that wires hexagonal core use cases through adapters.

## Responsibility

- Exposes Vercel Functions in `api`.
- Exposes a credential-free local dev API runner in `scripts/dev-api.ts`.
- Wires core use cases to ports using runtime adapters.
- Ships with zero external runtime dependencies.

## Endpoints

- `GET /api/todos`
- `POST /api/todos`
- `POST /api/todos/:id/toggle`
- `GET /api/health`
- `GET /api/heavy`

## Adapter wiring

- Composition lives in `src/bootstrap/container.ts`.
- `TodoRepo` is selected by provider in `src/adapters/persistence/create-todo-repo.ts`.
- Default provider is in-memory; DB provider is a placeholder for CLI-selected adapters.

## Swapping backend frameworks

Keep all business rules in `src/core` and `src/core/usecases`. Replace only the transport layer (`api`) and keep container wiring + adapter contracts unchanged.
