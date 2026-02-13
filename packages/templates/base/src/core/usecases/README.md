# usecases

Application services orchestrating domain + ports.

## Responsibility

Each use case handles one application action and depends only on port interfaces.

## Adapter swapping

Use dependency injection at startup/composition boundaries. To swap adapters, pass a different port implementation with the same contract.
