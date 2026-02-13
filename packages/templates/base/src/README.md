# src

Template source root for generated applications.

## Responsibility

Contains runtime code for the project skeleton.

## Adapter swapping

Keep adapters (HTTP, DB, CLI, etc.) in sibling folders outside `core` and inject them into use cases at composition time.
