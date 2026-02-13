import {
  createTodoUseCase,
  listTodos,
  toggleTodoUseCase,
  type ClockPort,
  type IdPort,
  type LoggerPort,
  type TodoRepo
} from "../core";
import { createTodoRepo, type TodoRepoProvider } from "../adapters/persistence/create-todo-repo";
import { systemClock } from "../adapters/system/clock";
import { cryptoId } from "../adapters/system/id";
import { consoleLogger } from "../adapters/system/logger";
import {
  createWorkerAdapter,
  type WorkerAdapter
} from "../adapters/worker_threads/run-heavy-task";

type Container = {
  adapters: {
    todoRepo: TodoRepo;
    id: IdPort;
    clock: ClockPort;
    logger: LoggerPort;
    worker: WorkerAdapter;
  };
  usecases: {
    listTodos: typeof listTodos;
    createTodoUseCase: typeof createTodoUseCase;
    toggleTodoUseCase: typeof toggleTodoUseCase;
  };
  meta: {
    db: TodoRepoProvider;
  };
};

declare global {
  var __teehexContainer: Container | undefined;
}

function resolveProvider(): TodoRepoProvider {
  const raw = process.env.TODO_DB_PROVIDER;
  if (raw === "db") {
    return "db";
  }

  return "memory";
}

function buildContainer(): Container {
  const selection = createTodoRepo(resolveProvider());

  return {
    adapters: {
      todoRepo: selection.todoRepo,
      id: cryptoId,
      clock: systemClock,
      logger: consoleLogger,
      worker: createWorkerAdapter()
    },
    usecases: {
      listTodos,
      createTodoUseCase,
      toggleTodoUseCase
    },
    meta: {
      db: selection.provider
    }
  };
}

export function getContainer(): Container {
  if (globalThis.__teehexContainer === undefined) {
    globalThis.__teehexContainer = buildContainer();
  }

  return globalThis.__teehexContainer;
}
