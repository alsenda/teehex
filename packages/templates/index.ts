import type { TemplateSource } from "@teehex/shared";

export const TEMPLATES: readonly TemplateSource[] = [
  {
    id: "base",
    description: "Canonical hexagonal core skeleton with Todo bounded context"
  },
  {
    id: "backend-vercel",
    description: "Vercel Functions backend adapters and routes for the hexagonal core"
  }
] as const;
