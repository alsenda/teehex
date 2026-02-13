# base template

Canonical hexagonal architecture starter focused on a framework-agnostic core.

## Responsibility

Provides a copy-ready source tree with domain, ports, and use cases.

## Adapter swapping

Core imports only from `src/core`. Infrastructure adapters should implement ports in `src/core/ports` and be wired outside the core.
