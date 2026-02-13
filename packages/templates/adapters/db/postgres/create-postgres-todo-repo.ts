import postgres from "postgres";
import type { Todo, TodoId } from "../../../base/src/core/domain/todo";
import { createTodoTitle } from "../../../base/src/core/domain/todo-title";
import type { TodoRepo } from "../../../base/src/core/ports/todo-repo";

type TodoRow = {
  id: string;
  title: string;
  done: boolean;
  created_at: Date;
};

function resolveSslMode(value: "require" | "disable" | undefined): "require" | undefined {
  if (value === "disable") {
    return undefined;
  }

  return "require";
}

function mapRow(row: TodoRow): Todo {
  return {
    id: row.id,
    title: createTodoTitle(row.title),
    done: row.done,
    createdAt: new Date(row.created_at)
  };
}

export function createPostgresTodoRepo(input: {
  databaseUrl: string;
  ssl?: "require" | "disable";
  maxConnections?: number;
}): TodoRepo {
  const sql = postgres(input.databaseUrl, {
    prepare: true,
    ssl: resolveSslMode(input.ssl),
    max: input.maxConnections ?? 1
  });

  return {
    async list() {
      const rows = await sql<TodoRow[]>`
        SELECT id, title, done, created_at
        FROM todos
        ORDER BY created_at DESC
      `;

      return rows.map(mapRow);
    },
    async get(id: TodoId) {
      const rows = await sql<TodoRow[]>`
        SELECT id, title, done, created_at
        FROM todos
        WHERE id = ${id}
        LIMIT 1
      `;

      if (rows.length === 0) {
        return null;
      }

      return mapRow(rows[0]);
    },
    async create(todo: Todo) {
      await sql`
        INSERT INTO todos (id, title, done, created_at)
        VALUES (${todo.id}, ${todo.title.value}, ${todo.done}, ${todo.createdAt.toISOString()})
      `;
    },
    async toggleDone(id: TodoId) {
      const rows = await sql<TodoRow[]>`
        UPDATE todos
        SET done = NOT done
        WHERE id = ${id}
        RETURNING id, title, done, created_at
      `;

      if (rows.length === 0) {
        return null;
      }

      return mapRow(rows[0]);
    }
  };
}
