import Database from "better-sqlite3";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function initializeSqliteSchema(input: { dbFilePath: string }): void {
  mkdirSync(dirname(input.dbFilePath), { recursive: true });
  const db = new Database(input.dbFilePath);
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDirPath = dirname(currentFilePath);
  const sqlPath = join(currentDirPath, "init.sql");
  const sql = readFileSync(sqlPath, "utf8");

  db.exec(sql);
  db.close();
}
