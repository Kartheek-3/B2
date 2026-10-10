# State Pattern - Javascript Implementation

## Environment
- Runtime/Compiler: Node.js 20/22

## How to Compile and Run
Run the following from this directory:
```bash
node tests/test_state.js
```

## Pattern Details
Provides a true GoF State implementation for Appointment Lifecycle management. The original codebase and Part 2 handled appointment status using procedural raw string literals (`pending`, `scheduled`, `cancelled`). This implementation replaces conditional branching with polymorphic State classes.
