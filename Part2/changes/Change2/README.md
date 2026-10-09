# Change 2: Flexible Doctor Availability Rules (Strategy Pattern)

## 1. Pattern Overview
- **Pattern Name**: Strategy Pattern (GoF Behavioral)
- **Problem**: In the baseline implementation, doctor availability was unconstrained. Any patient or admin could select any arbitrary date-time, leading to appointments being scheduled on weekends, during clinic lunch breaks, outside physician shift windows, or overlapping existing appointments. Hardcoding if-else branches for different doctor schedules creates brittle code violating the Open-Closed Principle.
- **Solution**: Encapsulate scheduling and availability algorithms behind an `IAvailabilityStrategy` interface, and provide interchangeable concrete strategies (`StandardBusinessHoursStrategy`, `ShiftBasedAvailabilityStrategy`, `EmergencyOnCallAvailabilityStrategy`) managed via a `DoctorAvailabilityContext`.

## 2. Participant Roles
| Role in GoF Pattern | Concrete Implementation | File Location | Responsibility |
| :--- | :--- | :--- | :--- |
| **Strategy Interface** | `IAvailabilityStrategy` | `strategy/IAvailabilityStrategy.ts` | Declares common contract for slot validation (`validateSlot`) and slot generation (`generateAvailableSlots`). |
| **Concrete Strategy 1** | `StandardBusinessHoursStrategy` | `strategy/StandardBusinessHoursStrategy.ts` | Implements outpatient Mon-Fri 09:00-17:00 rules with lunch break exclusion and booking conflict checks. |
| **Concrete Strategy 2** | `ShiftBasedAvailabilityStrategy` | `strategy/ShiftBasedAvailabilityStrategy.ts` | Implements roster shift windows (morning/evening/night) enforcing active shift boundaries per doctor. |
| **Concrete Strategy 3** | `EmergencyOnCallAvailabilityStrategy` | `strategy/EmergencyOnCallAvailabilityStrategy.ts` | Implements 24/7 emergency triage availability with mandatory minimum buffer spacing (15 mins) around bookings. |
| **Context** | `DoctorAvailabilityContext` | `strategy/DoctorAvailabilityContext.ts` | Holds reference to an `IAvailabilityStrategy`, delegates slot evaluations, and allows runtime strategy swapping. |

## 3. Concurrency Limitations and Architectural Guarantees
- **Time-of-Check to Time-of-Use (TOCTOU) Race Condition**: In environments where appointments are recorded in Appwrite or document databases without distributed two-phase commit transactions or database-level row locks, two concurrent booking requests for the exact same slot may both evaluate as valid in memory before the first record is committed.
- **Remediation**: In production systems, this application-level Strategy pattern validation must be paired with database unique constraints (e.g., compound index on `[doctorId, scheduleTimestamp]`) or optimistic concurrency control (`$updatedAt` version matching).
