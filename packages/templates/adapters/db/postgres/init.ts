import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

function resolveSslMode(value: string | undefined): "require" | undefined {
  if (value === "disable") {
    return undefined;
  }

  return "require";
}

export async function initializePostgresSchema(input: {
  databaseUrl: string;
  ssl?: "require" | "disable";
  maxConnections?: number;
}): Promise<void> {
  const sql = postgres(input.databaseUrl, {
    prepare: true,
    ssl: resolveSslMode(input.ssl),
    max: input.maxConnections ?? 1
  });

  try {
    const currentFilePath = fileURLToPath(import.meta.url);
    const currentDirPath = dirname(currentFilePath);
    const sqlPath = join(currentDirPath, "init.sql");
    const migrationSql = readFileSync(sqlPath, "utf8");

    await sql.unsafe(migrationSql);
  } finally {
    await sql.end();
  }
}
