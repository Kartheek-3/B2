const {
    AppointmentService,
    CommandInvoker,
    CreateAppointmentCommand,
    ScheduleAppointmentCommand,
    CancelAppointmentCommand
} = require('../snippet/command');

function runTests() {
    let passed = 0;
    let total = 0;

    const service = new AppointmentService();
    const invoker = new CommandInvoker();

    // Test 1: Execute valid appointment command (Create)
    invoker.executeCommand(new CreateAppointmentCommand(service, 'app101', 'Alice Smith', 'Dr. Bob', '2026-10-15 09:00'));
    const app1 = service.getAppointment('app101');
    if (app1 && app1.status === 'CREATED') passed++;
    total++;

    // Test 2: Execute a second command of a different type (Schedule)
    invoker.executeCommand(new ScheduleAppointmentCommand(service, 'app101', '2026-10-16 10:00'));
    if (app1 && app1.status === 'SCHEDULED' && app1.date === '2026-10-16 10:00') passed++;
    total++;

    // Test 3: Verify state changes through repository/service (Cancel)
    invoker.executeCommand(new CancelAppointmentCommand(service, 'app101', 'Patient requested cancellation'));
    const retrieved = service.getAppointment('app101');
    if (retrieved && retrieved.status === 'CANCELLED' && retrieved.cancellationReason === 'Patient requested cancellation') passed++;
    total++;

    // Test 4: Reject invalid or missing appointment data
    try {
        invoker.executeCommand(new CreateAppointmentCommand(service, '', '', 'Dr. Bob', '2026-10-15'));
    } catch (e) {
        passed++;
    }
    total++;

    // Test 5: Handle command targeting nonexistent appointment
    try {
        invoker.executeCommand(new CancelAppointmentCommand(service, 'nonexistent_999', 'No appointment'));
    } catch (e) {
        passed++;
    }
    total++;

    // Test 6: Verify invalid command execution does not accidentally change stored data
    const countBefore = service.getAppointmentCount();
    try {
        invoker.executeCommand(new CreateAppointmentCommand(service, '', 'Invalid', 'Dr. Bob', '2026-10-15'));
    } catch (e) {}
    try {
        invoker.executeCommand(new ScheduleAppointmentCommand(service, 'nonexistent_888', '2026-12-01'));
    } catch (e) {}
    if (service.getAppointmentCount() === countBefore && service.getAppointment('app101').status === 'CANCELLED') passed++;
    total++;

    // Test 7: Confirm consistent results across tests
    if (passed === 6) passed++;
    total++;

    console.log(`${passed}/${total} passed`);
    process.exit(passed === total ? 0 : 1);
}

runTests();
