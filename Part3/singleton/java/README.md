# Singleton Pattern - Java Implementation

## Environment
- Runtime/Compiler: Java 17/21

## How to Compile and Run
Run the following from this directory:
```bash
javac -d bin snippet/*.java tests/*.java && java -cp bin tests.SingletonTest
```

## Pattern Details
Provides an equivalent implementation of the Singleton pattern for AppwriteClientManager. Original source in `Part1` identified this as a pattern-like singleton instantiated once at the module level. This implementation formalizes it into a GoF Singleton with thread safety controls (where applicable).
