#include "../snippet/command.hpp"
#include <iostream>

int main() {
    int passed = 0;
    int total = 0;

    try {
        AppointmentService service;
        CommandInvoker invoker;

        // Test 1: Execute valid appointment command (Create)
        CreateAppointmentCommand cmd1(service, "app101", "Alice Smith", "Dr. Bob", "2026-10-15 09:00");
        invoker.executeCommand(cmd1);
        Appointment* app1 = service.getAppointment("app101");
        if (app1 != nullptr && app1->status == "CREATED") passed++;
        total++;

        // Test 2: Execute a second command of a different type (Schedule)
        ScheduleAppointmentCommand cmd2(service, "app101", "2026-10-16 10:00");
        invoker.executeCommand(cmd2);
        if (app1 != nullptr && app1->status == "SCHEDULED" && app1->date == "2026-10-16 10:00") passed++;
        total++;

        // Test 3: Verify state changes through repository/service (Cancel)
        CancelAppointmentCommand cmd3(service, "app101", "Patient requested cancellation");
        invoker.executeCommand(cmd3);
        Appointment* retrieved = service.getAppointment("app101");
        if (retrieved != nullptr && retrieved->status == "CANCELLED" && retrieved->cancellationReason == "Patient requested cancellation") passed++;
        total++;

        // Test 4: Reject invalid or missing appointment data
        try {
            CreateAppointmentCommand invalidCmd(service, "", "", "Dr. Bob", "2026-10-15");
            invoker.executeCommand(invalidCmd);
        } catch (const std::invalid_argument&) {
            passed++;
        }
        total++;

        // Test 5: Handle command targeting nonexistent appointment
        try {
            CancelAppointmentCommand nonExistentCmd(service, "nonexistent_999", "No appointment");
            invoker.executeCommand(nonExistentCmd);
        } catch (const std::invalid_argument&) {
            passed++;
        }
        total++;

        // Test 6: Verify invalid command execution does not accidentally change stored data
        size_t countBefore = service.getAppointmentCount();
        try {
            CreateAppointmentCommand invalidCmd2(service, "", "Invalid", "Dr. Bob", "2026-10-15");
            invoker.executeCommand(invalidCmd2);
        } catch (const std::invalid_argument&) {}
        try {
            ScheduleAppointmentCommand nonExistentCmd2(service, "nonexistent_888", "2026-12-01");
            invoker.executeCommand(nonExistentCmd2);
        } catch (const std::invalid_argument&) {}
        if (service.getAppointmentCount() == countBefore && service.getAppointment("app101")->status == "CANCELLED") passed++;
        total++;

        // Test 7: Confirm consistent results across tests
        if (passed == 6) passed++;
        total++;

        std::cout << passed << "/" << total << " passed" << std::endl;
        return (passed == total) ? 0 : 1;
    } catch (const std::exception& e) {
        std::cerr << "Unexpected error: " << e.what() << std::endl;
        return 1;
    }
}
