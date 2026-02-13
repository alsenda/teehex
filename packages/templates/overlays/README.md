# overlays

UI overlay injectors for frontend templates.

## Purpose

Apply optional UI kits through small patches instead of maintaining separate full app copies.

## How it works

Each overlay contains:

- `overlay.json`: injector metadata and copy map.
- `package.additions.json`: minimal dependency additions for `package.json`.
- `files/*`: config and style files copied into the generated frontend app.

CLI flow (planned):

1. Select a base frontend template.
2. Select an overlay (`tailwind`, `bootstrap`, `daisyui`) for `vite` targets.
3. Merge `package.additions.json` into the target `package.json`.
4. Copy `files/*` into the project.
5. Install deps and run build.

## Tradeoffs

- Default templates stay dependency-light.
- Overlays add only incremental tooling needed for the selected UI approach.
- Heavier UI libs are available-but-heavy and intentionally not scaffolded by default:
  - MUI (heavy)
  - Chakra UI (heavy)

## Style parity

All overlays preserve the same neobrutalist look and should render with the same visual style baseline.
