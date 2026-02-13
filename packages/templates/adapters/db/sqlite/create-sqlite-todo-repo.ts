import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { Todo, TodoId } from "../../../base/src/core/domain/todo";
import { createTodoTitle } from "../../../base/src/core/domain/todo-title";
import type { TodoRepo } from "../../../base/src/core/ports/todo-repo";

const SQLITE_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);
`;

type TodoRow = {
  id: string;
  title: string;
  done: number;
  created_at: string;
};

function mapRow(row: TodoRow): Todo {
  return {
    id: row.id,
    title: createTodoTitle(row.title),
    done: row.done === 1,
    createdAt: new Date(row.created_at)
  };
}

export function createSqliteTodoRepo(input: { dbFilePath: string }): TodoRepo {
  mkdirSync(dirname(input.dbFilePath), { recursive: true });
  const db = new Database(input.dbFilePath);
  db.exec(SQLITE_SCHEMA_SQL);

  const listStmt = db.prepare(
    "SELECT id, title, done, created_at FROM todos ORDER BY created_at DESC"
  );
  const getStmt = db.prepare(
    "SELECT id, title, done, created_at FROM todos WHERE id = ? LIMIT 1"
  );
  const createStmt = db.prepare(
    "INSERT INTO todos (id, title, done, created_at) VALUES (?, ?, ?, ?)"
  );
  const toggleStmt = db.prepare(
    "UPDATE todos SET done = CASE done WHEN 1 THEN 0 ELSE 1 END WHERE id = ?"
  );

  return {
    async list() {
      const rows = listStmt.all() as TodoRow[];
      return rows.map(mapRow);
    },
    async get(id: TodoId) {
      const row = getStmt.get(id) as TodoRow | undefined;
      return row === undefined ? null : mapRow(row);
    },
    async create(todo: Todo) {
      createStmt.run(todo.id, todo.title.value, todo.done ? 1 : 0, todo.createdAt.toISOString());
    },
    async toggleDone(id: TodoId) {
      const existing = getStmt.get(id) as TodoRow | undefined;
      if (existing === undefined) {
        return null;
      }

      toggleStmt.run(id);
      const updated = getStmt.get(id) as TodoRow;
      return mapRow(updated);
    }
  };
}
