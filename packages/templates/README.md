# @teehex/templates

Template sources consumed by the CLI.

## Purpose

Defines template metadata and source registry used by installer commands.

## Public API

- `TEMPLATES`: readonly list of available template sources.

## Included templates

- `base`: canonical hexagonal core skeleton with Todo example under `base/src/core`.
- `backend-vercel`: Vercel Functions backend wiring in `backend-vercel/api` + `backend-vercel/src/adapters`.
