const { DomainEventBus, ReminderStore } = require('../snippet/bus');
const { ReminderSchedulerObserver, ReminderCancellationObserver, AuditLogObserver } = require('../snippet/observer');

async function test() {
    let passed = 0;
    let total = 0;

    const bus = new DomainEventBus();
    const store = new ReminderStore();
    
    const scheduler = new ReminderSchedulerObserver(store);
    const canceller = new ReminderCancellationObserver(store);
    const auditor = new AuditLogObserver();

    bus.subscribe("APPOINTMENT_SCHEDULED", scheduler);
    bus.subscribe("APPOINTMENT_SCHEDULED", auditor);
    bus.subscribe("APPOINTMENT_CANCELLED", canceller);
    bus.subscribe("APPOINTMENT_CANCELLED", auditor);

    const scheduleDate = new Date(1700000000000);
    
    // Test 1
    await bus.publish({ eventType: "APPOINTMENT_SCHEDULED", appointmentId: "app1", scheduleDate });
    if (store.getTasks().length === 2) passed++;
    total++;
    if (auditor.logsCount === 1) passed++;
    total++;

    // Test 2
    await bus.publish({ eventType: "APPOINTMENT_SCHEDULED", appointmentId: "app1", scheduleDate });
    if (store.getTasks().length === 2) passed++;
    total++;
    if (auditor.logsCount === 2) passed++;
    total++;

    // Test 3
    await bus.publish({ eventType: "APPOINTMENT_CANCELLED", appointmentId: "app1" });
    if (store.getTasks().length === 0) passed++;
    total++;
    if (auditor.logsCount === 3) passed++;
    total++;

    console.log(`${passed}/${total} passed`);
    process.exit(passed === total ? 0 : 1);
}
test();
