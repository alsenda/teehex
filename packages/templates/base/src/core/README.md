# core

Framework-agnostic application core.

## Responsibility

- `domain`: entities and value objects.
- `ports`: abstract interfaces for external dependencies.
- `usecases`: orchestration logic that depends only on ports.

## Adapter swapping

Swap any adapter by providing another implementation of the same port interface, without changing domain or use cases.
