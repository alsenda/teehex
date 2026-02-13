import type { Todo, TodoId } from "../domain/todo";

export type TodoRepo = {
  list: () => Promise<readonly Todo[]>;
  get: (id: TodoId) => Promise<Todo | null>;
  create: (todo: Todo) => Promise<void>;
  toggleDone: (id: TodoId) => Promise<Todo | null>;
};
