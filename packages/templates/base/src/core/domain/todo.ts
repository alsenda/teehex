import type { TodoTitle } from "./todo-title";

export type TodoId = string;

export type Todo = Readonly<{
  id: TodoId;
  title: TodoTitle;
  done: boolean;
  createdAt: Date;
}>;

export function createTodo(input: {
  id: TodoId;
  title: TodoTitle;
  createdAt: Date;
}): Todo {
  return {
    id: input.id,
    title: input.title,
    done: false,
    createdAt: input.createdAt
  };
}

export function toggleTodoState(todo: Todo): Todo {
  return {
    id: todo.id,
    title: todo.title,
    done: !todo.done,
    createdAt: todo.createdAt
  };
}
