# worker_threads adapter

CPU-bound task execution using built-in Node.js worker threads.

## Responsibility

Runs heavy computations off the request thread.

## Adapter swapping

Replace with any worker implementation that preserves the `runChecksumTask(iterations)` contract.
