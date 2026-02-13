import { performance } from "node:perf_hooks";
import { parentPort, workerData } from "node:worker_threads";
import type { WorkerTaskRequest, WorkerTaskResult } from "../../../core/ports/worker-task";

const request = workerData as WorkerTaskRequest;
const startedAt = performance.now();

function finalize(result: Omit<WorkerTaskResult, "durationMs">): WorkerTaskResult {
  return {
    ...result,
    durationMs: performance.now() - startedAt
  };
}

if (request.task !== "cpuSpin") {
  parentPort?.postMessage(
    finalize({
      ok: false,
      task: "cpuSpin",
      error: "Unsupported worker task"
    })
  );
} else {
  const iterations = request.payload.iterations;
  let checksum = 0;

  for (let index = 0; index < iterations; index += 1) {
    checksum = (checksum + ((index * 31) ^ (index >>> 3))) >>> 0;
  }

  parentPort?.postMessage(
    finalize({
      ok: true,
      task: "cpuSpin",
      checksum
    })
  );
}
