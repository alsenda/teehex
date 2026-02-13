import { Worker } from "node:worker_threads";
import type { WorkerTaskRequest, WorkerTaskResult } from "../../../core/ports/worker-task";

export type WorkerAdapter = {
  runCpuSpin: (iterations: number) => Promise<WorkerTaskResult>;
};

export function createWorkerAdapter(): WorkerAdapter {
  return {
    runCpuSpin: (iterations) =>
      new Promise<WorkerTaskResult>((resolve, reject) => {
        const request: WorkerTaskRequest = {
          task: "cpuSpin",
          payload: { iterations }
        };

        const worker = new Worker(new URL("./heavy.worker.js", import.meta.url), {
          workerData: request
        });

        worker.once("message", (result: WorkerTaskResult) => {
          resolve(result);
        });

        worker.once("error", (error) => {
          reject(error);
        });

        worker.once("exit", (code) => {
          if (code !== 0) {
            reject(new Error(`Worker exited with code ${code}`));
          }
        });
      })
  };
}
