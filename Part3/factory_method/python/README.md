# Factory Method Pattern - Python Implementation

## Environment
- Runtime/Compiler: Python 3.14

## How to Compile and Run
Run the following from this directory:
```bash
python tests/test_factory.py
```

## Pattern Details
Provides a true GoF Factory Method implementation for Appointment Validators. The original application used a simple parameterized factory (switch statement) to map types to schemas. This implementation formalizes it with an abstract `ValidatorFactory` creator exposing a polymorphic `createValidator()` method, which is implemented by `StandardValidatorFactory` and `EmergencyValidatorFactory`.
