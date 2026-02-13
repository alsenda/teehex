# domain

Pure business model for the Todo bounded context.

## Responsibility

Holds entities and value objects, validation rules, and state transitions.

## Adapter swapping

No adapter imports are allowed here. Domain stays unchanged when persistence, transport, or UI changes.
