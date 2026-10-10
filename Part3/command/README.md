# Command Pattern: Doctor Appointment Action Execution

## Overview
The **Command Pattern** decouples appointment action requests (creating, scheduling, cancelling) from the receiver service implementing the underlying business rules and persistence logic.

## Supported Operations
1. `CreateAppointmentCommand`: Encapsulates appointment registration.
2. `ScheduleAppointmentCommand`: Encapsulates appointment rescheduling.
3. `CancelAppointmentCommand`: Encapsulates appointment cancellation with reason recording.

## Invoker and Receiver
- **Receiver**: `AppointmentService` managing an in-memory appointment repository.
- **Invoker**: `CommandInvoker` executing `ICommand` implementations.
