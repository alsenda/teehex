import type { Todo } from "../domain/todo";
import type { TodoRepo } from "../ports/todo-repo";

export type ListTodosDeps = {
  todoRepo: TodoRepo;
};

export async function listTodos(deps: ListTodosDeps): Promise<readonly Todo[]> {
  return deps.todoRepo.list();
}
