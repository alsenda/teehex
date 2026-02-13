# frontend-react template

React + Vite frontend template for the teehex backend API.

## Purpose

Provides a minimal React UI for Todo list/add/toggle and a browser Worker heavy-task demo.

## Dev commands

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm preview`

## Backend integration

- Expects backend routes at `/api/todos`, `/api/todos/:id/toggle`, `/api/health`, `/api/heavy`.
- Configure local proxy by updating `vite.config.ts` if frontend and backend run on different ports.

## Tailwind readiness

Base styling is plain CSS. Tailwind can be added later by installing Tailwind and replacing classes incrementally without changing app logic.
