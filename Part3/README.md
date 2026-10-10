# Part 3: Cross-Language Design Patterns

This directory contains the implementations of three design patterns identified in the Healthcare Doctor Appointment Management System, executed across Java, Python, JavaScript, and C++.

## Traceability to Original Application
- **Strategy Pattern (Doctor Availability Evaluation Strategy)**:
  - **Original Application**: Identified in the booking validation logic where multiple procedural checks handled different doctor schedules (standard, shift, emergency). 
  - **Part 2 Evolution**: Extracted these rules into a formal Strategy interface and concrete policies.
  - **Cross-Language Implementation**: Implements `IAvailabilityStrategy` and its variants (Standard, Shift, Emergency).
- **Adapter Pattern (Teleconsultation Video Provider Adapter)**:
  - **Original Application**: Tightly coupled to a hypothetical external video vendor API using raw HTTP calls or procedural mapping with mixed schemas (e.g. mapping internal timestamps to vendor epoch seconds).
  - **Part 2 Evolution**: Formalized behind an `IVideoConsultationService` interface, decoupling the core domain from the vendor.
  - **Cross-Language Implementation**: Maps domain inputs (ISO timestamps, durations) to the adaptee's requirements and normalizes vendor errors to `DomainValidationError`.
- **Observer Pattern (Domain Event Driven Automated Reminder System)**:
  - **Original Application**: Tightly coupled appointment mutations directly triggering procedural SMS notification side effects.
  - **Part 2 Evolution**: Decoupled via `DomainEventBus` and `IDomainEventSubscriber` to asynchronously process reminder scheduling.
  - **Cross-Language Implementation**: Implements a Pub-Sub event bus processing an `AppointmentScheduledEvent` and dispatching it to a `ReminderSchedulerObserver`.
- **Singleton Pattern (Appwrite Client Manager)**:
  - **Original Application**: Identified as a pattern-like singleton instantiated once at the module level via `appwrite.config.ts`.
  - **Part 2 Evolution**: Preserved unchanged in Part 2.
  - **Cross-Language Implementation**: Formalizes the module-scoped client into a canonical GoF Singleton class with thread-safety and controlled initialization.
- **Factory Method Pattern (Appointment Validation Factory)**:
  - **Original Application**: Identified as a parameterized factory (switch statement) mapping string types to schema structures in `validation.ts`.
  - **Part 2 Evolution**: Preserved and extended to support teleconsultation flags, remaining a simple factory-like function.
  - **Cross-Language Implementation**: Elevates the concept into a true GoF Factory Method. Defines an abstract `ValidatorFactory` declaring a polymorphic `createValidator()` method, which concrete creators (`StandardValidatorFactory` and `EmergencyValidatorFactory`) override to return specific validator products.
- **State Pattern (Appointment Lifecycle State)**:
  - **Original Application**: Identified as a refactoring opportunity. Appointment status (`pending`, `scheduled`, `cancelled`) was modeled as a raw typescript union literal string.
  - **Part 2 Evolution**: Preserved as strings in the database layer. No GoF State classes were implemented.
  - **Cross-Language Implementation**: Formally elevates the concept into a true GoF State pattern. Context strictly handles transitions and delegates behavioral bounds to `PendingState`, `ScheduledState`, and `CancelledState` which prevent invalid transition violations dynamically.
- **Command Pattern (Appointment Action Execution)**:
  - **Original Application**: Identified as a refactoring opportunity. Appointment creation, scheduling, and cancellation were handled via procedural conditional branches in UI handlers (`AppointmentForm.tsx`) and action functions (`appointment.actions.ts`).
  - **Part 2 Evolution**: Identified as a refactoring opportunity (P06 Action/Workflow Command Opportunity) without an existing formal GoF implementation in the original source code.
  - **Cross-Language Implementation**: Formalizes appointment actions into independent Command objects (`CreateAppointmentCommand`, `ScheduleAppointmentCommand`, `CancelAppointmentCommand`) implementing a unified `ICommand` interface, executed via a `CommandInvoker` against an in-memory `AppointmentService` receiver.

## Directory Structure
- `strategy/`: Implementations of the Strategy Pattern.
- `adapter/`: Implementations of the Adapter Pattern.
- `observer/`: Implementations of the Observer Pattern.
- `singleton/`: Implementations of the Singleton Pattern.
- `factory_method/`: Implementations of the Factory Method Pattern.
- `state/`: Implementations of the State Pattern.
- `command/`: Implementations of the Command Pattern.
- `llm/`: Contains the LLM history, `llm.csv`, and `pattern_crosslanguage.csv` metrics dataset.

## Metrics & Execution
- LOC excludes tests and blanks. Cyclomatic complexity records the maximum function CC, evaluated using `lizard`.
- Performance measurements are taken as the median of 5 process executions after 1 warm-up run.

