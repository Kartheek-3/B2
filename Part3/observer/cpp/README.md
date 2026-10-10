# Observer Pattern - Cpp Implementation

## Environment
- Runtime/Compiler: GCC 15.2

## How to Compile and Run
Run the following from this directory:
```bash
wsl -e bash -c "g++ -std=c++14 -o tests/test_observer tests/test_observer.cpp && ./tests/test_observer"
```

## Pattern Details
Provides an equivalent implementation of the Observer pattern for Domain Events. It demonstrates decoupling by broadcasting an APPOINTMENT_SCHEDULED event to observers, which process it dynamically.
