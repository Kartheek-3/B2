# Change 2: Flexible Doctor Availability Rules (Strategy Pattern)

## 1. Pattern Overview
- **Pattern Name**: Strategy Pattern (GoF Behavioral)
- **Problem**: In the baseline implementation, doctor availability was unconstrained. Any patient or admin could select any arbitrary date-time, leading to appointments being scheduled on weekends, during clinic lunch breaks, outside physician shift windows, or overlapping existing appointments. Hardcoding if-else branches for different doctor schedules creates brittle code violating the Open-Closed Principle.
- **Solution**: Encapsulate scheduling and availability algorithms behind an `IAvailabilityStrategy` interface, and provide interchangeable concrete strategies (`StandardBusinessHoursStrategy`, `ShiftBasedAvailabilityStrategy`, `EmergencyOnCallAvailabilityStrategy`) managed via a `DoctorAvailabilityContext`.
- **Implementation Status**: `implemented` (Authoritative source in `Part2/code/lib/availability/`).

## 2. Participant Roles and Exact Source Locations
| Role in GoF Pattern | Concrete Implementation | Authoritative File Location | Responsibility & Method Calls |
| :--- | :--- | :--- | :--- |
| **Strategy Interface** | `IAvailabilityStrategy` | `Part2/code/lib/availability/IAvailabilityStrategy.ts:15-33` | Declares common contract: `validateSlot(slot, doctorId, existingBookings, timezone)`, `generateAvailableSlots(date, doctorId, existingBookings)`. |
| **Concrete Strategy 1** | `StandardBusinessHoursStrategy` | `Part2/code/lib/availability/StandardBusinessHoursStrategy.ts:18-112` | Validates outpatient Mon-Fri 09:00-17:00 rules, excludes lunch break (12:00-13:00), verifies slot alignment (30-min intervals), and detects double-booking overlaps. |
| **Concrete Strategy 2** | `ShiftBasedAvailabilityStrategy` | `Part2/code/lib/availability/ShiftBasedAvailabilityStrategy.ts:16-105` | Validates against doctor shift rosters (`Morning` 07:00-15:00, `Evening` 15:00-23:00, `Night` 23:00-07:00), rejecting slots outside the doctor's assigned shift. |
| **Concrete Strategy 3** | `EmergencyOnCallAvailabilityStrategy` | `Part2/code/lib/availability/EmergencyOnCallAvailabilityStrategy.ts:18-107` | Validates 24/7 emergency triage appointments while strictly enforcing a mandatory minimum buffer spacing (15 minutes) before and after adjacent bookings. |
| **Context** | `DoctorAvailabilityContext` | `Part2/code/lib/availability/DoctorAvailabilityContext.ts:25-78` | Holds a reference to `IAvailabilityStrategy`, enables runtime strategy swapping via `setStrategy(strategy)`, and delegates calls: `validateSlot(...)`, `generateAvailableSlots(...)`. |
| **Client** | Appointment Booking Action | `Part2/code/lib/actions/appointment.actions.ts:21-48` | Queries existing doctor appointments from database, evaluates slot validity via `DoctorAvailabilityContext.validateSlot(...)`, and rejects invalid slots with clinical explanations before persisting. |

## 3. Concurrency Limitations and Architectural Guarantees
- **Time-of-Check to Time-of-Use (TOCTOU) Race Condition**: In high-concurrency environments where appointments are recorded in document databases or Appwrite without distributed two-phase commit transactions or database-level row locks, two simultaneous booking requests for the exact same slot may both evaluate as valid in memory before the first record is committed.
- **Architectural Remediation**: While the Strategy pattern cleanly encapsulates the business rules at the application layer, production deployment requires pairing this with database unique constraints (e.g., compound index on `[doctorId, scheduleTimestamp]`) or optimistic concurrency control (`$updatedAt` version matching) to prevent database-level double booking.

## 4. Verification and Test Evidence
- **Automated Test File**: `Part2/changes/Change2/tests/test_strategy.ts`
- **Execution Log**: `Part2/changes/Change2/tests/test_output.log`
- **Test Scenarios Verified**:
  1. Standard business hours acceptance (Tuesday 10:00).
  2. Standard business hours rejection (Weekend Sunday, Lunch hour 12:30, Outside hours 19:00, Overlapping conflict).
  3. Shift-based availability validation (Morning shift 10:00 accepted, Evening slot 16:00 rejected for morning doctor).
  4. Emergency on-call 24/7 validation with 15-minute buffer enforcement (within buffer rejected, outside buffer accepted).
  5. Runtime strategy interchangeability via context (`setStrategy`).
