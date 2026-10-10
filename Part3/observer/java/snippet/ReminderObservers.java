package snippet;
import java.util.Date;

class ReminderSchedulerObserver implements IDomainEventSubscriber {
    private final ReminderStore store;
    public ReminderSchedulerObserver(ReminderStore store) { this.store = store; }

    @Override
    public void onEvent(DomainEvent event) {
        if (event instanceof AppointmentScheduledEvent) {
            AppointmentScheduledEvent scheduledEvent = (AppointmentScheduledEvent) event;
            long epoch = scheduledEvent.scheduleDate.getTime();
            
            // Duplicate idempotency check (simplistic for example)
            if (store.getTasks().stream().anyMatch(t -> t.appointmentId.equals(scheduledEvent.appointmentId))) {
                return;
            }

            ReminderStore.ReminderTask t24 = new ReminderStore.ReminderTask();
            t24.appointmentId = scheduledEvent.appointmentId;
            t24.reminderId = scheduledEvent.appointmentId + "_24H";
            t24.triggerAt = new Date(epoch - 24 * 60 * 60 * 1000L);
            t24.windowType = "24_HOURS_PRIOR";
            store.add(t24);

            ReminderStore.ReminderTask t2 = new ReminderStore.ReminderTask();
            t2.appointmentId = scheduledEvent.appointmentId;
            t2.reminderId = scheduledEvent.appointmentId + "_2H";
            t2.triggerAt = new Date(epoch - 2 * 60 * 60 * 1000L);
            t2.windowType = "2_HOURS_PRIOR";
            store.add(t2);
        }
    }
    @Override public String getSubscriberName() { return "ReminderSchedulerObserver"; }
}

class ReminderCancellationObserver implements IDomainEventSubscriber {
    private final ReminderStore store;
    public ReminderCancellationObserver(ReminderStore store) { this.store = store; }

    @Override
    public void onEvent(DomainEvent event) {
        if (event instanceof AppointmentCancelledEvent) {
            AppointmentCancelledEvent cancelEvent = (AppointmentCancelledEvent) event;
            store.cancelForAppointment(cancelEvent.appointmentId);
        }
    }
    @Override public String getSubscriberName() { return "ReminderCancellationObserver"; }
}

class AuditLogObserver implements IDomainEventSubscriber {
    public int logsCount = 0;
    @Override
    public void onEvent(DomainEvent event) {
        logsCount++; // Audit all events
    }
    @Override public String getSubscriberName() { return "AuditLogObserver"; }
}
