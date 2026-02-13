import type { TodoRepo } from "../../../core/ports/todo-repo";
import { createDbTodoRepoPlaceholder } from "./db-todo-repo-placeholder";
import { createInMemoryTodoRepo } from "./in-memory-todo-repo";

export type TodoRepoProvider = "memory" | "db";

export type TodoRepoSelection = {
  provider: TodoRepoProvider;
  todoRepo: TodoRepo;
};

export function createTodoRepo(provider: TodoRepoProvider): TodoRepoSelection {
  if (provider === "db") {
    return {
      provider,
      todoRepo: createDbTodoRepoPlaceholder()
    };
  }

  return {
    provider: "memory",
    todoRepo: createInMemoryTodoRepo()
  };
}
