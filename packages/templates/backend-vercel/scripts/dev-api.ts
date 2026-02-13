import { createServer } from "node:http";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createConnection } from "node:net";
import { dirname, resolve } from "node:path";
import { URL, fileURLToPath } from "node:url";
import type { ApiRequest } from "../api/_lib/http";
import healthHandler from "../api/health";
import heavyHandler from "../api/heavy";
import todosHandler from "../api/todos";
import toggleTodoHandler from "../api/todos/[id]/toggle";

type QueryValue = string | string[] | undefined;

function stripWrappingQuotes(value: string): string {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = stripWrappingQuotes(line.slice(separatorIndex + 1).trim());

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function loadLocalEnvFiles(): void {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const projectRoot = resolve(scriptDir, "..");

  loadEnvFile(resolve(projectRoot, ".env.local"));
  loadEnvFile(resolve(projectRoot, ".env"));
  loadEnvFile(resolve(projectRoot, ".env.example"));
}

loadLocalEnvFiles();

const LOCAL_POSTGRES_URL = "postgres://postgres:postgres@127.0.0.1:54329/teehex";

function usesPostgresProvider(value: string | undefined): boolean {
  return value === "postgres" || value === "postgres-neon" || value === "postgres-supabase";
}

function resolveDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.NEON_DATABASE_URL ??
    process.env.SUPABASE_DB_URL
  );
}

function shouldEnsureLocalPostgres(databaseUrl: string | undefined): boolean {
  if (databaseUrl === undefined) {
    return true;
  }

  const trimmed = databaseUrl.trim();
  if (trimmed.length === 0) {
    return true;
  }

  return trimmed === LOCAL_POSTGRES_URL;
}

function waitForTcpPort(host: string, port: number, timeoutMs: number): Promise<void> {
  return new Promise((resolveWait, rejectWait) => {
    const startedAt = Date.now();

    const attempt = (): void => {
      const socket = createConnection({ host, port });

      socket.once("connect", () => {
        socket.destroy();
        resolveWait();
      });

      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - startedAt >= timeoutMs) {
          rejectWait(new Error(`Timed out waiting for ${host}:${port}`));
          return;
        }

        setTimeout(attempt, 500);
      });
    };

    attempt();
  });
}

async function ensureLocalPostgresIfNeeded(): Promise<void> {
  if (!usesPostgresProvider(process.env.TODO_DB_PROVIDER)) {
    return;
  }

  const existingUrl = resolveDatabaseUrl();
  if (!shouldEnsureLocalPostgres(existingUrl)) {
    return;
  }

  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const projectRoot = resolve(scriptDir, "..");

  const dockerCheck = spawnSync("docker", ["--version"], {
    cwd: projectRoot,
    stdio: "ignore"
  });

  if (dockerCheck.status !== 0) {
    if (existingUrl?.trim() === LOCAL_POSTGRES_URL) {
      delete process.env.DATABASE_URL;
    }

    return;
  }

  const composeUp = spawnSync("docker", ["compose", "up", "-d", "postgres"], {
    cwd: projectRoot,
    stdio: "ignore"
  });

  if (composeUp.status !== 0) {
    if (existingUrl?.trim() === LOCAL_POSTGRES_URL) {
      delete process.env.DATABASE_URL;
    }

    return;
  }

  process.env.DATABASE_URL = LOCAL_POSTGRES_URL;

  try {
    await waitForTcpPort("127.0.0.1", 54329, 30_000);
  } catch {
    if (existingUrl?.trim() === LOCAL_POSTGRES_URL) {
      delete process.env.DATABASE_URL;
    }
  }
}

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

async function startServer(): Promise<void> {
  await ensureLocalPostgresIfNeeded();

  server.listen(3000, () => {
    console.log("[api] local dev server listening on http://localhost:3000");
  });
}

void startServer().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown startup error";
  console.error(`[api] ${message}`);
  process.exit(1);
});
