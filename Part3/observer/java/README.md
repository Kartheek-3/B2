# Observer Pattern - Java Implementation

## Environment
- Runtime/Compiler: Java 17/21

## How to Compile and Run
Run the following from this directory:
```bash
javac -d bin snippet/*.java tests/*.java && java -cp bin tests.ObserverTest
```

## Pattern Details
Provides an equivalent implementation of the Observer pattern for Domain Events. It demonstrates decoupling by broadcasting an APPOINTMENT_SCHEDULED event to observers, which process it dynamically.
