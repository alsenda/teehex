import type { IncomingMessage, ServerResponse } from "node:http";

export type ApiRequest = IncomingMessage & {
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
};

export type ApiResponse = ServerResponse;

export function sendJson(response: ApiResponse, statusCode: number, payload: unknown): void {
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

export async function readJsonBody<T>(request: ApiRequest): Promise<T> {
  if (request.body !== undefined) {
    return request.body as T;
  }

  const chunks: Uint8Array[] = [];
  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (raw.length === 0) {
    return {} as T;
  }

  return JSON.parse(raw) as T;
}

export function methodNotAllowed(response: ApiResponse, allowed: readonly string[]): void {
  response.setHeader("allow", allowed.join(", "));
  sendJson(response, 405, { error: "method_not_allowed" });
}
