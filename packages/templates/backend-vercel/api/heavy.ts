import type { ApiRequest, ApiResponse } from "./_lib/http";
import { methodNotAllowed, sendJson } from "./_lib/http";
import { getContainer } from "../src/bootstrap/container";

function parseIterations(value: string | string[] | undefined): number {
  if (typeof value !== "string") {
    return 5_000_000;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 5_000_000;
  }

  return Math.min(parsed, 50_000_000);
}

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  if (request.method !== "GET") {
    methodNotAllowed(response, ["GET"]);
    return;
  }

  const iterations = parseIterations(request.query?.iterations);
  const container = getContainer();
  const result = await container.adapters.worker.runChecksumTask(iterations);

  sendJson(response, 200, {
    ok: true,
    iterations,
    checksum: result.checksum,
    durationMs: result.durationMs
  });
}
