# @teehex/shared

Tiny shared utilities for cross-package use.

## Purpose

Provides minimal primitives used by other packages (types, logger, filesystem helpers).

## Public API

- `Logger`: lightweight logging interface.
- `createLogger(scope)`: scoped logger factory.
- `ensureDir(path)`: create directory recursively.
- `writeTextFile(path, content)`: write UTF-8 text file ensuring parent folder exists.
