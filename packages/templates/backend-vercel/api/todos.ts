import type { ApiRequest, ApiResponse } from "./_lib/http";
import { methodNotAllowed, readJsonBody, sendJson } from "./_lib/http";
import { getContainer } from "../src/bootstrap/container";

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  const container = getContainer();

  if (request.method === "GET") {
    const todos = await container.usecases.listTodos({
      todoRepo: container.adapters.todoRepo
    });

    sendJson(
      response,
      200,
      todos.map((todo) => ({
        id: todo.id,
        title: todo.title.value,
        done: todo.done,
        createdAt: todo.createdAt.toISOString()
      }))
    );
    return;
  }

  if (request.method === "POST") {
    const body = await readJsonBody<{ title?: string }>(request);

    if (typeof body.title !== "string") {
      sendJson(response, 400, { error: "title_required" });
      return;
    }

    const created = await container.usecases.createTodoUseCase(
      {
        todoRepo: container.adapters.todoRepo,
        id: container.adapters.id,
        clock: container.adapters.clock,
        logger: container.adapters.logger
      },
      {
        title: body.title
      }
    );

    sendJson(response, 201, created);
    return;
  }

  methodNotAllowed(response, ["GET", "POST"]);
}
