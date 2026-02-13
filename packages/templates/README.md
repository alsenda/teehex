# @teehex/templates

Template sources consumed by the CLI.

## Purpose

Defines template metadata and source registry used by installer commands.

## Public API

- `TEMPLATES`: readonly list of available template sources.

## Included templates

- `base`: canonical hexagonal core skeleton with Todo example under `base/src/core`.
- `backend-vercel`: Vercel Functions backend wiring in `backend-vercel/api` + `backend-vercel/src/adapters`.
- `frontend-react`: React + Vite frontend template.
- `frontend-vue`: Vue + Vite frontend template.
- `frontend-svelte`: Svelte + Vite frontend template.
- `frontend-solid`: Solid + Vite frontend template.
- `frontend-preact`: Preact + Vite frontend template.
- `frontend-angular`: planned only.
- `frontend-ember`: planned only.
