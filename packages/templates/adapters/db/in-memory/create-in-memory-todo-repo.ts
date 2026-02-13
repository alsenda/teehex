import type { Todo, TodoId } from "../../../base/src/core/domain/todo";
import type { TodoRepo } from "../../../base/src/core/ports/todo-repo";
import { toggleTodoState } from "../../../base/src/core/domain/todo";

export function createInMemoryTodoRepo(seed: readonly Todo[] = []): TodoRepo {
  const todosById = new Map<TodoId, Todo>();

  for (const todo of seed) {
    todosById.set(todo.id, todo);
  }

  return {
    async list() {
      return Array.from(todosById.values());
    },
    async get(id) {
      return todosById.get(id) ?? null;
    },
    async create(todo) {
      todosById.set(todo.id, todo);
    },
    async toggleDone(id) {
      const current = todosById.get(id);
      if (current === undefined) {
        return null;
      }

      const updated = toggleTodoState(current);
      todosById.set(id, updated);
      return updated;
    }
  };
}
