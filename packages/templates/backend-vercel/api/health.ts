import type { ApiRequest, ApiResponse } from "./_lib/http";
import { methodNotAllowed, sendJson } from "./_lib/http";
import { getContainer } from "../src/bootstrap/container";

export default function handler(request: ApiRequest, response: ApiResponse): void {
  if (request.method !== "GET") {
    methodNotAllowed(response, ["GET"]);
    return;
  }

  const container = getContainer();

  sendJson(response, 200, {
    ok: true,
    provider: "vercel-functions",
    db: container.meta.db
  });
}
