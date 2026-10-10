# State Pattern - Cpp Implementation

## Environment
- Runtime/Compiler: GCC 15.2

## How to Compile and Run
Run the following from this directory:
```bash
wsl -e bash -c "g++ -std=c++14 -o tests/test_state tests/test_state.cpp && ./tests/test_state"
```

## Pattern Details
Provides a true GoF State implementation for Appointment Lifecycle management. The original codebase and Part 2 handled appointment status using procedural raw string literals (`pending`, `scheduled`, `cancelled`). This implementation replaces conditional branching with polymorphic State classes.
