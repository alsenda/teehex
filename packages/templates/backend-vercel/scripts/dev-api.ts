import { createServer } from "node:http";
import { URL } from "node:url";
import type { ApiRequest } from "../api/_lib/http";
import healthHandler from "../api/health";
import heavyHandler from "../api/heavy";
import todosHandler from "../api/todos";
import toggleTodoHandler from "../api/todos/[id]/toggle";

type QueryValue = string | string[] | undefined;

function toQueryRecord(searchParams: URLSearchParams): Record<string, QueryValue> {
  const query: Record<string, QueryValue> = {};

  for (const [key, value] of searchParams.entries()) {
    const current = query[key];
    if (current === undefined) {
      query[key] = value;
      continue;
    }

    if (Array.isArray(current)) {
      current.push(value);
      continue;
    }

    query[key] = [current, value];
  }

  return query;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost:3000");
  const requestWithQuery = request as ApiRequest;
  requestWithQuery.query = toQueryRecord(url.searchParams);

  try {
    if (url.pathname === "/api/health") {
      await healthHandler(requestWithQuery, response);
      return;
    }

    if (url.pathname === "/api/heavy") {
      await heavyHandler(requestWithQuery, response);
      return;
    }

    if (url.pathname === "/api/todos") {
      await todosHandler(requestWithQuery, response);
      return;
    }

    const toggleMatch = /^\/api\/todos\/([^/]+)\/toggle$/.exec(url.pathname);
    if (toggleMatch !== null) {
      requestWithQuery.query = {
        ...requestWithQuery.query,
        id: decodeURIComponent(toggleMatch[1] ?? "")
      };
      await toggleTodoHandler(requestWithQuery, response);
      return;
    }

    response.statusCode = 404;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: "not_found" }));
  } catch (error) {
    response.statusCode = 500;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(
      JSON.stringify({
        error: "internal_error",
        message: error instanceof Error ? error.message : "Unknown error"
      })
    );
  }
});

server.listen(3000, () => {
  console.log("[api] local dev server listening on http://localhost:3000");
});
