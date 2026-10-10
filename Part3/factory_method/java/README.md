# Factory Method Pattern - Java Implementation

## Environment
- Runtime/Compiler: Java 17/21

## How to Compile and Run
Run the following from this directory:
```bash
javac -d bin snippet/*.java tests/*.java && java -cp bin snippet.FactoryMethodTest
```

## Pattern Details
Provides a true GoF Factory Method implementation for Appointment Validators. The original application used a simple parameterized factory (switch statement) to map types to schemas. This implementation formalizes it with an abstract `ValidatorFactory` creator exposing a polymorphic `createValidator()` method, which is implemented by `StandardValidatorFactory` and `EmergencyValidatorFactory`.
