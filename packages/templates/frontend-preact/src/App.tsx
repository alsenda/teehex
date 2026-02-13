import { useEffect, useState } from "preact/hooks";
import type { WorkerTaskRequest, WorkerTaskResult } from "../../src/core/ports/worker-task";

type Todo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
};

export function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [heavyDuration, setHeavyDuration] = useState<number | null>(null);

  const loadTodos = async () => {
    const response = await fetch("/api/todos");
    if (!response.ok) {
      throw new Error("Failed to fetch todos");
    }
    setTodos((await response.json()) as Todo[]);
  };

  useEffect(() => {
    void loadTodos();
  }, []);

  const addTodo = async () => {
    if (title.trim().length === 0 || busy) {
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title })
      });

      if (!response.ok) {
        throw new Error("Failed to create todo");
      }

      setTitle("");
      await loadTodos();
    } finally {
      setBusy(false);
    }
  };

  const toggleTodo = async (id: string) => {
    if (busy) {
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`/api/todos/${id}/toggle`, { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to toggle todo");
      }
      await loadTodos();
    } finally {
      setBusy(false);
    }
  };

  const runHeavyTask = async () => {
    if (busy) {
      return;
    }

    setBusy(true);
    try {
      const worker = new Worker(new URL("./heavy.worker.ts", import.meta.url), {
        type: "module"
      });

      const request: WorkerTaskRequest = {
        task: "cpuSpin",
        payload: { iterations: 8_000_000 }
      };

      const result = await new Promise<WorkerTaskResult>((resolve, reject) => {
        worker.onmessage = (event: MessageEvent<WorkerTaskResult>) => resolve(event.data);
        worker.onerror = () => reject(new Error("Worker failed"));
        worker.postMessage(request);
      });

      worker.terminate();
      if (!result.ok) {
        throw new Error(result.error);
      }

      setHeavyDuration(Math.round(result.durationMs));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main class="page">
      <h1>Todo UI</h1>

      <section class="panel">
        <label for="title">New todo</label>
        <div class="row">
          <input
            id="title"
            value={title}
            onInput={(event) => setTitle((event.target as HTMLInputElement).value)}
            placeholder="Write a task"
          />
          <button disabled={busy} onClick={() => void addTodo()}>
            Add
          </button>
        </div>
      </section>

      <section class="panel">
        <h2>Todos</h2>
        <ul class="list">
          {todos.map((todo) => (
            <li class="todo-item" key={todo.id}>
              <span>{todo.done ? "✅" : "⬜"}</span>
              <strong>{todo.title}</strong>
              <button disabled={busy} onClick={() => void toggleTodo(todo.id)}>
                Toggle
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section class="panel">
        <h2>Worker demo</h2>
        <button disabled={busy} onClick={() => void runHeavyTask()}>
          Run heavy task
        </button>
        <p>Duration: {heavyDuration === null ? "-" : `${heavyDuration}ms`}</p>
      </section>
    </main>
  );
}
