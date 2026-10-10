# Factory Method Pattern - Javascript Implementation

## Environment
- Runtime/Compiler: Node.js 20/22

## How to Compile and Run
Run the following from this directory:
```bash
node tests/test_factory.js
```

## Pattern Details
Provides a true GoF Factory Method implementation for Appointment Validators. The original application used a simple parameterized factory (switch statement) to map types to schemas. This implementation formalizes it with an abstract `ValidatorFactory` creator exposing a polymorphic `createValidator()` method, which is implemented by `StandardValidatorFactory` and `EmergencyValidatorFactory`.
