# Change 3: Automated Appointment Reminders (Observer Pattern & Scheduled Engine)

## 1. Pattern Overview
- **Pattern Name**: Observer Pattern (GoF Behavioral) + Domain Events & Scheduled Processing Engine
- **Problem**: In the baseline implementation, appointment notifications were handled via a tightly coupled, synchronous procedural call (`sendSMSNotification`) directly invoked inside the `updateAppointment` server action. It lacked decoupled subscribers, automated time-based reminder calculation (e.g. 24h/2h prior to the appointment), cancellation revocation, rescheduling adaptation, persistent task queuing, retry policies, and duplicate-delivery prevention.
- **Solution**: Decouple appointment lifecycle state mutations from notification workflows using an Observer-style Domain Event Bus (`DomainEventBus`). Multiple specialized subscribers (`ReminderSchedulerObserver`, `ReminderCancellationObserver`, `AuditLogObserver`) react to domain events (`APPOINTMENT_SCHEDULED`, `APPOINTMENT_RESCHEDULED`, `APPOINTMENT_CANCELLED`). Due reminders are managed via a persistent store (`JsonFileReminderStore`) and processed idempotently by a dedicated `ReminderProcessingEngine`.
- **Implementation Status**: `implemented` (Authoritative source in `Part2/code/lib/events/` and `Part2/code/lib/reminders/`).

## 2. Participant Roles and Exact Source Locations
| Role in GoF Pattern | Concrete Implementation | Authoritative File Location | Responsibility & Method Calls |
| :--- | :--- | :--- | :--- |
| **Subject / Event Bus** | `DomainEventBus` | `Part2/code/lib/events/DomainEventBus.ts:16-65` | Maintains subscriber registry (`subscribers: Map<string, Set<IDomainEventSubscriber>>`), handles `subscribe(eventType, subscriber)`, `unsubscribe(...)`, and broadcasts events asynchronously via `publish(event)`. |
| **Observer Interface** | `IDomainEventSubscriber` | `Part2/code/lib/events/types.ts:13-17` | Declares the subscriber contract: `onEvent(event: DomainEvent): Promise<void>`. |
| **Concrete Observer 1** | `ReminderSchedulerObserver` | `Part2/code/lib/events/subscribers/ReminderSchedulerObserver.ts:28-98` | Listens to `APPOINTMENT_SCHEDULED` and `APPOINTMENT_RESCHEDULED`. Computes 24h and 2h reminder windows, generates deterministic idempotency keys, and persists tasks to the store. |
| **Concrete Observer 2** | `ReminderCancellationObserver` | `Part2/code/lib/events/subscribers/ReminderCancellationObserver.ts:23-43` | Listens to `APPOINTMENT_CANCELLED`. Calls `reminderStore.cancelByAppointmentId(appointmentId)` to revoke pending reminder tasks. |
| **Concrete Observer 3** | `AuditLogObserver` | `Part2/code/lib/events/subscribers/AuditLogObserver.ts:20-41` | Subscribes to all domain events (`*`) and writes chronological diagnostic audit logs. |
| **Persistent Store** | `JsonFileReminderStore` | `Part2/code/lib/reminders/JsonFileReminderStore.ts:14-142` | Implements `IReminderStore`. Persists reminder tasks to disk (`reminders_store.json`), supporting atomic read/write, duplicate prevention via idempotency keys, status queries, and cancellation. |
| **Processing Engine** | `ReminderProcessingEngine` | `Part2/code/lib/reminders/ReminderProcessingEngine.ts:35-127` | Evaluates due reminders, transitions state (`PENDING` $\to$ `PROCESSING` $\to$ `SENT` or `FAILED`), enforces idempotency, and retries failures up to `maxRetries` (default 3). |
| **Client / Publisher** | Appointment Actions | `Part2/code/lib/actions/appointment.actions.ts:79-100`<br>`Part2/code/lib/actions/appointment.actions.ts:250-275` | Publishes domain events to `DomainEventBus.getInstance().publish(...)` upon appointment creation, status update, or cancellation. |

## 3. Scheduled Processing Endpoint Invocation & Architecture
> **CRITICAL OPERATIONAL DISCLOSURE**:  
> In serverless and modern web architectures like Next.js, application processes do not host perpetual, unmanaged background daemon threads.  
> Accordingly, scheduled reminder processing is exposed via a secure HTTP endpoint:  
> **`POST /api/reminders/process`** (implemented at `Part2/code/app/api/reminders/process/route.ts`).  
> 
> **How It Is Invoked**:  
> - In development and testing: Invoked via automated test scripts or curl/HTTP requests.  
> - In production environments: Invoked on a recurring schedule (e.g. every 5 or 15 minutes) by an **external scheduler** (such as Vercel Cron Jobs, AWS EventBridge, Kubernetes CronJob, or Linux systemd timer) passing a bearer authentication token (`CRON_SECRET`).  
> - **No False Claims**: We do **NOT** claim an automatic background thread is executing invisibly in process memory without an external invocation trigger.

## 4. Delivery Guarantees, Duplicate Prevention, and Concurrency Limitations
1. **External Delivery Guarantees (At-Least-Once)**:  
   Because external telephony SMS gateways (Twilio) and email providers (SendGrid) do not participate in distributed two-phase commit transactions with the application database, reminders guarantee **At-Least-Once** delivery.
2. **Duplicate Prevention via Idempotency Keys**:  
   Every reminder task is assigned a deterministic idempotency key formatted as:  
   `${appointmentId}_${windowType}_${scheduleEpoch}` (e.g., `apt_123_24h_1700000000000`).  
   The `JsonFileReminderStore` checks this key before saving; duplicate events for the same appointment and window will update or be ignored rather than creating duplicate notifications.
3. **Cancellation Handling**:  
   When an appointment is cancelled, `ReminderCancellationObserver` immediately updates any `PENDING` reminders for that appointment ID to `CANCELLED`, preventing subsequent delivery.
4. **Retry Handling**:  
   If delivery fails, the reminder is marked `FAILED` and its `retryCount` is incremented. If `retryCount < maxRetries` (3), it remains eligible for subsequent sweep attempts.
5. **Concurrency Limitations**:  
   The provided `JsonFileReminderStore` uses single-file read/write serialization suitable for local demonstrations, development, and unit testing. In high-concurrency multi-instance production environments, this file store has file-locking contention limitations and should be replaced with an enterprise queue store such as Redis BullMQ, RabbitMQ, or a transactional database table using row-level locking (`SELECT ... FOR UPDATE SKIP LOCKED`).

## 5. Verification and Test Evidence
- **Automated Test File**: `Part2/changes/Change3/tests/test_observer.ts`
- **Execution Log**: `Part2/changes/Change3/tests/test_output.log`
- **Test Scenarios Verified**:
  1. DomainEventBus subscription and notification dispatch to registered observers.
  2. ReminderSchedulerObserver generating 24h and 2h reminder records with unique idempotency keys.
  3. JsonFileReminderStore persistence and duplicate prevention.
  4. ReminderCancellationObserver cancelling pending reminders upon appointment cancellation.
  5. ReminderProcessingEngine dry-run and live processing sweep with state transitions (`PENDING` $\to$ `SENT`).
  6. Retry handling on simulated delivery failures up to `maxRetries`.
