export type WorkerTaskName = "cpuSpin";

export type WorkerTaskRequest = Readonly<{
  task: WorkerTaskName;
  payload: Readonly<{
    iterations: number;
  }>;
}>;

export type WorkerTaskSuccess = Readonly<{
  ok: true;
  task: WorkerTaskName;
  checksum: number;
  durationMs: number;
}>;

export type WorkerTaskFailure = Readonly<{
  ok: false;
  task: WorkerTaskName;
  error: string;
  durationMs: number;
}>;

export type WorkerTaskResult = WorkerTaskSuccess | WorkerTaskFailure;
