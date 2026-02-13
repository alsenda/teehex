# frontend-solid template

Solid + Vite frontend template for the teehex backend API.

## Purpose

Provides a minimal Solid UI for Todo list/add/toggle and a browser Worker heavy-task demo.

## Dev commands

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm preview`

## Backend integration

- Expects backend routes at `/api/todos`, `/api/todos/:id/toggle`, `/api/health`, `/api/heavy`.
- Configure local proxy in `vite.config.ts` if frontend and backend run on different ports.

## Tailwind readiness

Base styling is plain CSS. Tailwind can be layered in later without changing component logic.

## Style parity

`src/styles.css` is intentionally kept identical across all frontend templates and mirrors `packages/templates/frontend-style-canonical.css`.
