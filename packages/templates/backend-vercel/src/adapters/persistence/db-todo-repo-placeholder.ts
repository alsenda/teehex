import type { Todo, TodoId } from "../../../core/domain/todo";
import type { TodoRepo } from "../../../core/ports/todo-repo";

export function createDbTodoRepoPlaceholder(): TodoRepo {
  return {
    async list(): Promise<readonly Todo[]> {
      throw new Error("DB TodoRepo adapter not configured yet");
    },
    async get(_id: TodoId): Promise<Todo | null> {
      throw new Error("DB TodoRepo adapter not configured yet");
    },
    async create(_todo: Todo): Promise<void> {
      throw new Error("DB TodoRepo adapter not configured yet");
    },
    async toggleDone(_id: TodoId): Promise<Todo | null> {
      throw new Error("DB TodoRepo adapter not configured yet");
    }
  };
}
