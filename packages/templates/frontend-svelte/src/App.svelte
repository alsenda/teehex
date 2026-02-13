<script lang="ts">
  import type { WorkerTaskRequest, WorkerTaskResult } from "../../src/core/ports/worker-task";

  type Todo = {
    id: string;
    title: string;
    done: boolean;
    createdAt: string;
  };

  let todos: Todo[] = [];
  let title = "";
  let busy = false;
  let heavyDuration: number | null = null;

  async function loadTodos(): Promise<void> {
    const response = await fetch("/api/todos");
    if (!response.ok) {
      throw new Error("Failed to fetch todos");
    }

    todos = (await response.json()) as Todo[];
  }

  async function addTodo(): Promise<void> {
    if (title.trim().length === 0 || busy) {
      return;
    }

    busy = true;
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title })
      });

      if (!response.ok) {
        throw new Error("Failed to create todo");
      }

      title = "";
      await loadTodos();
    } finally {
      busy = false;
    }
  }

  async function toggleTodo(id: string): Promise<void> {
    if (busy) {
      return;
    }

    busy = true;
    try {
      const response = await fetch(`/api/todos/${id}/toggle`, { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to toggle todo");
      }
      await loadTodos();
    } finally {
      busy = false;
    }
  }

  async function runHeavyTask(): Promise<void> {
    if (busy) {
      return;
    }

    busy = true;
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

      heavyDuration = Math.round(result.durationMs);
    } finally {
      busy = false;
    }
  }

  void loadTodos();
</script>

<main class="page">
  <h1>Todo UI</h1>

  <section class="panel">
    <label for="title">New todo</label>
    <div class="row">
      <input id="title" bind:value={title} placeholder="Write a task" />
      <button disabled={busy} on:click={addTodo}>Add</button>
    </div>
  </section>

  <section class="panel">
    <h2>Todos</h2>
    <ul class="list">
      {#each todos as todo (todo.id)}
        <li class="todo-item">
          <span>{todo.done ? "✅" : "⬜"}</span>
          <strong>{todo.title}</strong>
          <button disabled={busy} on:click={() => void toggleTodo(todo.id)}>Toggle</button>
        </li>
      {/each}
    </ul>
  </section>

  <section class="panel">
    <h2>Worker demo</h2>
    <button disabled={busy} on:click={runHeavyTask}>Run heavy task</button>
    <p>Duration: {heavyDuration === null ? "-" : `${heavyDuration}ms`}</p>
  </section>
</main>
