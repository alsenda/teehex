# teehex

Performance-first TypeScript monorepo for a hexagonal architecture project generator.

## Repository layout

- `packages/cli`: the CLI installer and command entrypoint.
- `packages/templates`: template source registry consumed by the CLI.
- `packages/shared`: tiny shared utilities (filesystem helpers, logger, shared types).
- `docs`: architecture and design notes.

## Development

### Prerequisites

- Node.js 20+
- pnpm 9+

### Install

```bash
pnpm -w install
```

### Build all packages

```bash
pnpm -w -r build
```

### Lint

```bash
pnpm -w lint
```

## Release process (manual for now)

1. Ensure working tree is clean.
2. Run install, lint, and build:
   - `pnpm -w install`
   - `pnpm -w lint`
   - `pnpm -w -r build`
3. Bump versions in package manifests as needed.
4. Create a descriptive git commit and tag:
   - `git tag vX.Y.Z`
5. Publish the CLI package:
   - `pnpm --filter @teehex/cli publish --access public`

## Public APIs

- `@teehex/shared`: logger, fs helpers, and foundational types.
- `@teehex/templates`: template metadata and source registry.
- `@teehex/cli`: executable command to scaffold future projects.
