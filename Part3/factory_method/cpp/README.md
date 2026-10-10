# Factory Method Pattern - Cpp Implementation

## Environment
- Runtime/Compiler: GCC 15.2

## How to Compile and Run
Run the following from this directory:
```bash
wsl -e bash -c "g++ -std=c++14 -o tests/test_factory tests/test_factory.cpp && ./tests/test_factory"
```

## Pattern Details
Provides a true GoF Factory Method implementation for Appointment Validators. The original application used a simple parameterized factory (switch statement) to map types to schemas. This implementation formalizes it with an abstract `ValidatorFactory` creator exposing a polymorphic `createValidator()` method, which is implemented by `StandardValidatorFactory` and `EmergencyValidatorFactory`.
