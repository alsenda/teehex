import type { WorkerTaskRequest, WorkerTaskResult } from "../../src/core/ports/worker-task";

self.onmessage = (event: MessageEvent<WorkerTaskRequest>) => {
  const startedAt = performance.now();
  const request = event.data;

  if (request.task !== "cpuSpin") {
    const failure: WorkerTaskResult = {
      ok: false,
      task: "cpuSpin",
      error: "Unsupported worker task",
      durationMs: performance.now() - startedAt
    };
    self.postMessage(failure);
    return;
  }

  const iterations = request.payload.iterations;

  let checksum = 0;
  for (let index = 0; index < iterations; index += 1) {
    checksum = (checksum + ((index * 31) ^ (index >>> 3))) >>> 0;
  }

  const output: WorkerTaskResult = {
    ok: true,
    task: "cpuSpin",
    checksum,
    durationMs: performance.now() - startedAt
  };

  self.postMessage(output);
};
