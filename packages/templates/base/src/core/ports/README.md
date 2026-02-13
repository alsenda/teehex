# ports

Contracts for all side effects required by use cases.

## Responsibility

Defines interfaces for persistence and environment concerns: repository, clock, id generation, logging.

Also defines the shared worker message protocol (`worker-task.ts`) used by both browser Web Workers and Node.js worker_threads adapters.

## Adapter swapping

Create adapters that implement these interfaces (e.g., Postgres, in-memory, UUID, system clock, console logger) and inject them into use cases.

## Worker performance note

- Workers help when CPU-heavy work blocks request/UI responsiveness.
- Overhead exists for worker startup and message serialization; tiny tasks can be slower in a worker than inline execution.
- Use workers for sufficiently large CPU batches (for example, `cpuSpin` with millions of iterations).
