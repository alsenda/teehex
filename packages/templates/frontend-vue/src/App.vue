<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { WorkerTaskRequest, WorkerTaskResult } from "../../src/core/ports/worker-task";

type Todo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
};

const todos = ref<Todo[]>([]);
const title = ref("");
const busy = ref(false);
const heavyDuration = ref<number | null>(null);

async function loadTodos(): Promise<void> {
  const response = await fetch("/api/todos");
  if (!response.ok) {
    throw new Error("Failed to fetch todos");
  }

  todos.value = (await response.json()) as Todo[];
}

onMounted(() => {
  void loadTodos();
});

async function addTodo(): Promise<void> {
  if (title.value.trim().length === 0 || busy.value) {
    return;
  }

  busy.value = true;
  try {
    const response = await fetch("/api/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: title.value })
    });

    if (!response.ok) {
      throw new Error("Failed to create todo");
    }

    title.value = "";
    await loadTodos();
  } finally {
    busy.value = false;
  }
}

async function toggleTodo(id: string): Promise<void> {
  if (busy.value) {
    return;
  }

  busy.value = true;
  try {
    const response = await fetch(`/api/todos/${id}/toggle`, { method: "POST" });
    if (!response.ok) {
      throw new Error("Failed to toggle todo");
    }

    await loadTodos();
  } finally {
    busy.value = false;
  }
}

async function runHeavyTask(): Promise<void> {
  if (busy.value) {
    return;
  }

  busy.value = true;
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

    heavyDuration.value = Math.round(result.durationMs);
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <main class="page">
    <h1>Todo UI</h1>

    <section class="panel">
      <label for="title">New todo</label>
      <div class="row">
        <input id="title" v-model="title" placeholder="Write a task" />
        <button :disabled="busy" @click="addTodo">Add</button>
      </div>
    </section>

    <section class="panel">
      <h2>Todos</h2>
      <ul class="list">
        <li v-for="todo in todos" :key="todo.id" class="todo-item">
          <span>{{ todo.done ? "✅" : "⬜" }}</span>
          <strong>{{ todo.title }}</strong>
          <button :disabled="busy" @click="toggleTodo(todo.id)">Toggle</button>
        </li>
      </ul>
    </section>

    <section class="panel">
      <h2>Worker demo</h2>
      <button :disabled="busy" @click="runHeavyTask">Run heavy task</button>
      <p>Duration: {{ heavyDuration === null ? "-" : `${heavyDuration}ms` }}</p>
    </section>
  </main>
</template>
