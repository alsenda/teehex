import type { ApiRequest, ApiResponse } from "../../_lib/http";
import { methodNotAllowed, sendJson } from "../../_lib/http";
import { getContainer } from "../../../src/bootstrap/container";

type RouteRequest = ApiRequest & {
  query?: {
    id?: string;
  };
};

export default async function handler(request: RouteRequest, response: ApiResponse): Promise<void> {
  if (request.method !== "POST") {
    methodNotAllowed(response, ["POST"]);
    return;
  }

  const id = request.query?.id;

  if (typeof id !== "string" || id.length === 0) {
    sendJson(response, 400, { error: "id_required" });
    return;
  }

  const container = getContainer();

  const todo = await container.usecases.toggleTodoUseCase(
    {
      todoRepo: container.adapters.todoRepo,
      logger: container.adapters.logger
    },
    { id }
  );

  if (todo === null) {
    sendJson(response, 404, { error: "todo_not_found" });
    return;
  }

  sendJson(response, 200, {
    id: todo.id,
    title: todo.title.value,
    done: todo.done,
    createdAt: todo.createdAt.toISOString()
  });
}
