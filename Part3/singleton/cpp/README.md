# Singleton Pattern - Cpp Implementation

## Environment
- Runtime/Compiler: GCC 15.2

## How to Compile and Run
Run the following from this directory:
```bash
wsl -e bash -c "g++ -std=c++14 -o tests/test_singleton tests/test_singleton.cpp && ./tests/test_singleton"
```

## Pattern Details
Provides an equivalent implementation of the Singleton pattern for AppwriteClientManager. Original source in `Part1` identified this as a pattern-like singleton instantiated once at the module level. This implementation formalizes it into a GoF Singleton with thread safety controls (where applicable).
