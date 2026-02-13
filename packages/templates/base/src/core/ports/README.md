# ports

Contracts for all side effects required by use cases.

## Responsibility

Defines interfaces for persistence and environment concerns: repository, clock, id generation, logging.

## Adapter swapping

Create adapters that implement these interfaces (e.g., Postgres, in-memory, UUID, system clock, console logger) and inject them into use cases.
