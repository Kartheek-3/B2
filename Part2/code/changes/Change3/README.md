# Change 3: Automated Appointment Reminders (Observer Pattern & Scheduled Engine)

## 1. Pattern Overview
- **Pattern Name**: Observer Pattern (GoF Behavioral) + Domain Events & Scheduled Processing Engine
- **Problem**: In the baseline implementation, appointment notifications were handled via a tightly coupled, synchronous procedural call (`sendSMSNotification`) directly invoked inside the `updateAppointment` server action. It lacked decoupled subscribers, automated time-based reminder calculation (e.g. 24h/2h prior to the appointment), cancellation revocation, rescheduling adaptation, persistent task queuing, retry policies, and duplicate-delivery prevention.
- **Solution**: Decouple appointment lifecycle state mutations from notification workflows using an Observer-style Domain Event Bus (`DomainEventBus`). Multiple specialized subscribers (`ReminderSchedulerObserver`, `ReminderCancellationObserver`, `AuditLogObserver`) react to domain events (`APPOINTMENT_SCHEDULED`, `APPOINTMENT_RESCHEDULED`, `APPOINTMENT_CANCELLED`). Due reminders are managed via a persistent store (`JsonFileReminderStore`) and processed idempotently by a dedicated `ReminderProcessingEngine`.

## 2. Participant Roles
| Role in GoF Pattern | Concrete Implementation | File Location | Responsibility |
| :--- | :--- | :--- | :--- |
| **Subject / Event Bus** | `DomainEventBus` | `observer/DomainEventBus.ts` | Maintains subscriber registry and broadcasts domain events to registered observers. |
| **Observer Interface** | `IDomainEventSubscriber` | `observer/DomainEventBus.ts` | Declares the update interface contract (`onEvent(event)`). |
| **Concrete Observer 1** | `ReminderSchedulerObserver` | `observer/subscribers/ReminderSchedulerObserver.ts` | Reacts to scheduled/rescheduled events; calculates 24h and 2h reminder windows; enqueues tasks with unique idempotency keys. |
| **Concrete Observer 2** | `ReminderCancellationObserver` | `observer/subscribers/ReminderCancellationObserver.ts` | Reacts to cancelled events; invalidates and revokes pending reminder records. |
| **Concrete Observer 3** | `AuditLogObserver` | `observer/subscribers/AuditLogObserver.ts` | Appends chronological audit logs for all domain events. |
| **Persistent Store** | `JsonFileReminderStore` | `reminders/JsonFileReminderStore.ts` | Persists reminder tasks to disk (`reminders_store.json`), supporting atomic lookup and status updates. |
| **Processing Engine** | `ReminderProcessingEngine` | `reminders/ReminderProcessingEngine.ts` | Evaluates due reminders, transitions state (`PENDING` $\to$ `PROCESSING` $\to$ `SENT`), enforces idempotency, and retries failures. |

## 3. External Delivery Guarantees & Duplicate Prevention
- **At-Least-Once Delivery**: Because third-party communication channels (telephony SMS gateways, SMTP servers) do not participate in distributed two-phase commit transactions with the application's database, external notifications guarantee **At-Least-Once** delivery rather than strictly exactly-once delivery.
- **Idempotency Keys**: Every reminder record carries a deterministic idempotency key format:  
  `${appointmentId}_${windowType}_${scheduleEpoch}`.
- **Duplicate Prevention**: The engine transitions reminders to `PROCESSING` immediately upon evaluation and `SENT` upon receipt, ensuring subsequent sweeps never deliver duplicate messages.
