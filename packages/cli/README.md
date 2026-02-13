# @teehex/cli

CLI package for generating project scaffolds.

## Purpose

Provides the `create-hexagon-ts` installer and orchestrates template selection + file output.

## Public API

- Executable: `create-hexagon-ts` (alias: `teehex`)
- Programmatic: `run(argv)`

## Usage

```bash
npx create-hexagon-ts my-app
```

From the monorepo root (local development):

```bash
npm run create -- my-app
```

Without prebuilding CLI dist:

```bash
npm run create:dev -- my-app
```

## Prompt matrix

1. Frontend framework
	- Available: React, Vue, Svelte, Solid, Preact
	- Planned: Lit, Qwik, Astro, Angular, Ember
2. UI overlay
	- Available: None, Tailwind, DaisyUI, Bootstrap
	- Planned: Bulma, UnoCSS, shadcn/ui (React-only)
3. Backend
	- Available: Vercel Functions
	- Planned: Fastify, Express
4. DB
	- Available: InMemory, SQLite, Postgres, Supabase(Postgres), Neon(Postgres)
	- Planned: MySQL, Mongo, Redis, Turso
5. Workers
	- On/off toggle (default on)
6. Git init + initial commit
	- Default yes

## Generated structure

- `src/core` from base template
- `api` + `src/bootstrap` + `src/adapters` from backend template
- `web` frontend app from selected frontend template
- optional overlay files merged into `web`
- selected DB adapter wired into `src/adapters/persistence`
- root `package.json`, `tsconfig.json`, `.env.example`, `vercel.json`

## Notes

- CLI uses direct filesystem copy + light text transforms for speed.
- No heavy template engine is used.
- Optional git commit message:
  - `chore: initial scaffold via create-hexagon-ts`
