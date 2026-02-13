import { parentPort, workerData } from "node:worker_threads";

type InputData = {
  iterations: number;
};

const input = workerData as InputData;

const startedAt = Date.now();
let checksum = 0;

for (let index = 0; index < input.iterations; index += 1) {
  checksum = (checksum + ((index * 31) ^ (index >>> 3))) >>> 0;
}

const durationMs = Date.now() - startedAt;

parentPort?.postMessage({
  checksum,
  durationMs
});
