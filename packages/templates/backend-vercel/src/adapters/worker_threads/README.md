# worker_threads adapter

CPU-bound task execution using built-in Node.js worker threads.

## Responsibility

Runs heavy computations off the request thread.

## Adapter swapping

Replace with any worker implementation that preserves the `runCpuSpin(iterations)` contract and shared `WorkerTaskRequest`/`WorkerTaskResult` protocol.

## Performance note

- Workers are useful for CPU-bound loops where event-loop latency matters.
- Overhead comes from spawning workers and message passing.
- Keep tiny tasks on the main thread; route only heavier deterministic jobs (like `cpuSpin`) to workers.
