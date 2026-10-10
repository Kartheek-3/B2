class ReminderSchedulerObserver {
    constructor(store) { this.store = store; }
    async onEvent(event) {
        if (event.eventType === "APPOINTMENT_SCHEDULED") {
            if (this.store.getTasks().some(t => t.appointmentId === event.appointmentId)) return;
            const epoch = event.scheduleDate.getTime();
            this.store.add({
                appointmentId: event.appointmentId,
                reminderId: `${event.appointmentId}_24H`,
                triggerAt: new Date(epoch - 24 * 3600 * 1000),
                windowType: "24_HOURS_PRIOR"
            });
            this.store.add({
                appointmentId: event.appointmentId,
                reminderId: `${event.appointmentId}_2H`,
                triggerAt: new Date(epoch - 2 * 3600 * 1000),
                windowType: "2_HOURS_PRIOR"
            });
        }
    }
}

class ReminderCancellationObserver {
    constructor(store) { this.store = store; }
    async onEvent(event) {
        if (event.eventType === "APPOINTMENT_CANCELLED") {
            this.store.cancelForAppointment(event.appointmentId);
        }
    }
}

class AuditLogObserver {
    constructor() { this.logsCount = 0; }
    async onEvent(event) { this.logsCount++; }
}
module.exports = { ReminderSchedulerObserver, ReminderCancellationObserver, AuditLogObserver };
