import type { TemplateSource } from "@teehex/shared";

export const TEMPLATES: readonly TemplateSource[] = [
  {
    id: "base",
    description: "Canonical hexagonal core skeleton with Todo bounded context"
  },
  {
    id: "backend-vercel",
    description: "Vercel Functions backend adapters and routes for the hexagonal core"
  },
  {
    id: "frontend-react",
    description: "React + Vite frontend with Todo API integration and worker demo"
  },
  {
    id: "frontend-vue",
    description: "Vue + Vite frontend with Todo API integration and worker demo"
  },
  {
    id: "frontend-svelte",
    description: "Svelte + Vite frontend with Todo API integration and worker demo"
  },
  {
    id: "frontend-solid",
    description: "Solid + Vite frontend with Todo API integration and worker demo"
  },
  {
    id: "frontend-preact",
    description: "Preact + Vite frontend with Todo API integration and worker demo"
  },
  {
    id: "frontend-angular",
    description: "Planned: Angular frontend template"
  },
  {
    id: "frontend-ember",
    description: "Planned: Ember frontend template"
  }
] as const;
