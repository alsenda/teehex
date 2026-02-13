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

## Frontend style baseline

- `frontend-style-canonical.css`: canonical neobrutalist stylesheet that all implemented frontend templates mirror exactly.

## Overlay injectors

- `overlays/tailwind/vite`: optional Tailwind injector.
- `overlays/bootstrap/vite`: optional Bootstrap injector.
- `overlays/daisyui/vite`: optional DaisyUI injector.
- Heavy-but-available (planned docs only): MUI, Chakra UI.

## Adapter templates

- `adapters/db/in-memory`: baseline zero-dependency `TodoRepo`.
- `adapters/db/sqlite`: `better-sqlite3` prepared-statement `TodoRepo`.
- `adapters/db/postgres`: `postgres` (postgres.js) `TodoRepo`.
