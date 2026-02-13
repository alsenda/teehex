import { performance } from "node:perf_hooks";
import { parentPort, workerData } from "node:worker_threads";
import type { WorkerTaskRequest, WorkerTaskResult } from "../../core/ports/worker-task";

const request = workerData as WorkerTaskRequest;
const startedAt = performance.now();

if (request.task !== "cpuSpin") {
  const failure: WorkerTaskResult = {
    ok: false,
    task: "cpuSpin",
    error: "Unsupported worker task",
    durationMs: performance.now() - startedAt
  };

  parentPort?.postMessage(failure);
} else {
  const iterations = request.payload.iterations;
  let checksum = 0;

  for (let index = 0; index < iterations; index += 1) {
    checksum = (checksum + ((index * 31) ^ (index >>> 3))) >>> 0;
  }

  const success: WorkerTaskResult = {
    ok: true,
    task: "cpuSpin",
    checksum,
    durationMs: performance.now() - startedAt
  };

  parentPort?.postMessage(success);
}
