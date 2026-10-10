import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import sys
from snippet.command import (
    AppointmentService,
    CommandInvoker,
    CreateAppointmentCommand,
    ScheduleAppointmentCommand,
    CancelAppointmentCommand
)

def run_tests():
    passed = 0
    total = 0

    service = AppointmentService()
    invoker = CommandInvoker()

    # Test 1: Execute valid appointment command (Create)
    invoker.execute_command(CreateAppointmentCommand(service, "app101", "Alice Smith", "Dr. Bob", "2026-10-15 09:00"))
    app1 = service.get_appointment("app101")
    if app1 and app1.status == "CREATED":
        passed += 1
    total += 1

    # Test 2: Execute a second command of a different type (Schedule)
    invoker.execute_command(ScheduleAppointmentCommand(service, "app101", "2026-10-16 10:00"))
    if app1 and app1.status == "SCHEDULED" and app1.date == "2026-10-16 10:00":
        passed += 1
    total += 1

    # Test 3: Verify state changes through repository/service (Cancel)
    invoker.execute_command(CancelAppointmentCommand(service, "app101", "Patient requested cancellation"))
    retrieved = service.get_appointment("app101")
    if retrieved and retrieved.status == "CANCELLED" and retrieved.cancellation_reason == "Patient requested cancellation":
        passed += 1
    total += 1

    # Test 4: Reject invalid or missing appointment data
    try:
        invoker.execute_command(CreateAppointmentCommand(service, "", "", "Dr. Bob", "2026-10-15"))
    except ValueError:
        passed += 1
    total += 1

    # Test 5: Handle command targeting nonexistent appointment
    try:
        invoker.execute_command(CancelAppointmentCommand(service, "nonexistent_999", "No appointment"))
    except ValueError:
        passed += 1
    total += 1

    # Test 6: Verify invalid command execution does not accidentally change stored data
    count_before = service.get_appointment_count()
    try:
        invoker.execute_command(CreateAppointmentCommand(service, "", "Invalid", "Dr. Bob", "2026-10-15"))
    except ValueError:
        pass
    try:
        invoker.execute_command(ScheduleAppointmentCommand(service, "nonexistent_888", "2026-12-01"))
    except ValueError:
        pass
    if service.get_appointment_count() == count_before and service.get_appointment("app101").status == "CANCELLED":
        passed += 1
    total += 1

    # Test 7: Confirm consistent results across tests
    if passed == 6:
        passed += 1
    total += 1

    print(f"{passed}/{total} passed")
    sys.exit(0 if passed == total else 1)

if __name__ == '__main__':
    run_tests()
