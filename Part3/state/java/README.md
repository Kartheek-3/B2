# State Pattern - Java Implementation

## Environment
- Runtime/Compiler: Java 17/21

## How to Compile and Run
Run the following from this directory:
```bash
javac -d bin snippet/*.java tests/*.java && java -cp bin snippet.StateTest
```

## Pattern Details
Provides a true GoF State implementation for Appointment Lifecycle management. The original codebase and Part 2 handled appointment status using procedural raw string literals (`pending`, `scheduled`, `cancelled`). This implementation replaces conditional branching with polymorphic State classes.
