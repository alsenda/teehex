# Architecture notes

## Monorepo boundaries

- `@teehex/shared` holds tiny stable primitives.
- `@teehex/templates` contains template metadata/sources.
- `@teehex/cli` orchestrates generation via shared + templates.

## Performance-first defaults

- TypeScript project references for incremental builds.
- Minimal runtime dependencies (workspace-only internal deps).
- Biome for fast linting and formatting.

## Next implementation milestones

1. Add concrete template file trees.
2. Implement CLI command parsing for `init` flow.
3. Add smoke tests for generated outputs.
