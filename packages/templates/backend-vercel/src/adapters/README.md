# adapters

Concrete implementations of core ports and extra runtime services.

## Responsibility

Bridges the pure core to platform details (storage, clock, IDs, logging, worker threads).

## Adapter swapping

Replace any sub-adapter with another implementation that matches the same port contract.
