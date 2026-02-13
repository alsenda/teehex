import { createTodo } from "../domain/todo";
import { createTodoTitle } from "../domain/todo-title";
import type { ClockPort } from "../ports/clock";
import type { IdPort } from "../ports/id";
import type { LoggerPort } from "../ports/logger";
import type { TodoRepo } from "../ports/todo-repo";

export type CreateTodoInput = {
  title: string;
};

export type CreateTodoDeps = {
  todoRepo: TodoRepo;
  id: IdPort;
  clock: ClockPort;
  logger: LoggerPort;
};

export async function createTodoUseCase(
  deps: CreateTodoDeps,
  input: CreateTodoInput
): Promise<{ id: string }> {
  const todo = createTodo({
    id: deps.id.next(),
    title: createTodoTitle(input.title),
    createdAt: deps.clock.now()
  });

  await deps.todoRepo.create(todo);
  deps.logger.info(`todo.created id=${todo.id}`);

  return { id: todo.id };
}
