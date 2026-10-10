# State Pattern - Python Implementation

## Environment
- Runtime/Compiler: Python 3.14

## How to Compile and Run
Run the following from this directory:
```bash
python tests/test_state.py
```

## Pattern Details
Provides a true GoF State implementation for Appointment Lifecycle management. The original codebase and Part 2 handled appointment status using procedural raw string literals (`pending`, `scheduled`, `cancelled`). This implementation replaces conditional branching with polymorphic State classes.
