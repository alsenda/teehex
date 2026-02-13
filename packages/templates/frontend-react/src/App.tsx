import type { FormEvent, JSX } from "react";
import { useEffect, useState } from "react";
import type { WorkerTaskRequest, WorkerTaskResult } from "../../src/core/ports/worker-task";

type Todo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
};

async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch("/api/todos");
  if (!response.ok) {
    throw new Error("Failed to fetch todos");
  }

  return (await response.json()) as Todo[];
}

export function App(): JSX.Element {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [heavyDuration, setHeavyDuration] = useState<number | null>(null);

  async function loadTodos(): Promise<void> {
    setTodos(await fetchTodos());
  }

  useEffect(() => {
    void loadTodos();
  }, []);

  async function addTodo(event: FormEvent): Promise<void> {
    event.preventDefault();
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
  }

  async function toggleTodo(id: string): Promise<void> {
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
  }

  async function runHeavyTask(): Promise<void> {
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
        worker.onerror = () => reject(new Error("Worker execution failed"));
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
  }

  return (
    <main className="page">
      <h1>Todo UI</h1>

      <form className="panel" onSubmit={(event) => void addTodo(event)}>
        <label htmlFor="title">New todo</label>
        <div className="row">
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Write a task"
          />
          <button type="submit" disabled={busy}>
            Add
          </button>
        </div>
      </form>

      <section className="panel">
        <h2>Todos</h2>
        <ul className="list">
          {todos.map((todo) => (
            <li key={todo.id} className="todo-item">
              <span>{todo.done ? "✅" : "⬜"}</span>
              <strong>{todo.title}</strong>
              <button onClick={() => void toggleTodo(todo.id)} disabled={busy}>
                Toggle
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Worker demo</h2>
        <button onClick={() => void runHeavyTask()} disabled={busy}>
          Run heavy task
        </button>
        <p>Duration: {heavyDuration === null ? "-" : `${heavyDuration}ms`}</p>
      </section>
    </main>
  );
}
