import { Worker } from "node:worker_threads";

export type HeavyTaskResult = {
  checksum: number;
  durationMs: number;
};

export type WorkerAdapter = {
  runChecksumTask: (iterations: number) => Promise<HeavyTaskResult>;
};

export function createWorkerAdapter(): WorkerAdapter {
  return {
    runChecksumTask: (iterations) =>
      new Promise<HeavyTaskResult>((resolve, reject) => {
        const worker = new Worker(new URL("./heavy.worker.js", import.meta.url), {
          workerData: { iterations }
        });

        worker.once("message", (result: HeavyTaskResult) => {
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
