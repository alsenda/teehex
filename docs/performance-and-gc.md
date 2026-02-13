# Performance and GC (practical)

This project is performance-first. Focus on reducing work, not forcing the garbage collector.

## GC reality

Trying to "control GC" by keeping references alive is usually counterproductive.

- Retained references keep objects in memory longer.
- Longer object lifetimes increase old-generation pressure.
- Bigger heaps can mean longer stop-the-world pauses when GC runs.

Preferred strategy: let short-lived objects die quickly, and reduce unnecessary allocation churn.

## Practical tactics

- Reduce allocations in hot paths.
  - Avoid repeated temporary arrays/objects inside tight loops.
- Keep object shapes stable.
  - Initialize fields consistently and avoid polymorphic object layouts.
- Reuse buffers.
  - Recycle `Uint8Array`/`Buffer` instances for repeated work where safe.
- Stream large payloads.
  - Process incrementally instead of loading full datasets into memory.
- Offload CPU-heavy work to workers.
  - Use workers for long CPU loops to protect request latency and UI responsiveness.

## `--expose-gc` usage (batch boundaries only)

Manual GC is an advanced operation and can introduce pause spikes.

- Use only in controlled batch jobs (not per request).
- Call `global.gc()` at explicit boundaries between large phases.
- Measure p95/p99 latency and throughput before/after changes.

Avoid manual GC in latency-sensitive servers unless profiling clearly proves a benefit.

## Node memory flags

- `--max-old-space-size=<MB>` raises V8 old-space heap limit.

Use it when:

- processing legitimately large in-memory workloads,
- you have profiling evidence of OOM near current limits,
- you can afford higher memory usage.

Do not use it to hide leaks or unbounded retention. Fix retention and allocation patterns first.
