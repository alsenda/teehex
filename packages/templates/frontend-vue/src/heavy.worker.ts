type Input = {
  iterations: number;
};

type Output = {
  checksum: number;
  durationMs: number;
};

self.onmessage = (event: MessageEvent<Input>) => {
  const startedAt = performance.now();
  const iterations = event.data.iterations;

  let checksum = 0;
  for (let index = 0; index < iterations; index += 1) {
    checksum = (checksum + ((index * 13) ^ (index >>> 2))) >>> 0;
  }

  const output: Output = {
    checksum,
    durationMs: Math.round(performance.now() - startedAt)
  };

  self.postMessage(output);
};
