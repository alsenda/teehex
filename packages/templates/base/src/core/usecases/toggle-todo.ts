import type { Todo } from "../domain/todo";
import type { LoggerPort } from "../ports/logger";
import type { TodoRepo } from "../ports/todo-repo";

export type ToggleTodoInput = {
  id: string;
};

export type ToggleTodoDeps = {
  todoRepo: TodoRepo;
  logger: LoggerPort;
};

export async function toggleTodoUseCase(
  deps: ToggleTodoDeps,
  input: ToggleTodoInput
): Promise<Todo | null> {
  const updatedTodo = await deps.todoRepo.toggleDone(input.id);

  if (updatedTodo !== null) {
    deps.logger.info(`todo.toggled id=${updatedTodo.id} done=${updatedTodo.done}`);
  } else {
    deps.logger.warn(`todo.not_found id=${input.id}`);
  }

  return updatedTodo;
}
