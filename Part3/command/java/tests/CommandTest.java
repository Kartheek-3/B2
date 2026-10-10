package snippet;

import snippet.Commands.CreateAppointmentCommand;
import snippet.Commands.ScheduleAppointmentCommand;
import snippet.Commands.CancelAppointmentCommand;
import snippet.Commands.CommandInvoker;

public class CommandTest {
    public static void main(String[] args) {
        int passed = 0;
        int total = 0;

        try {
            AppointmentService service = new AppointmentService();
            CommandInvoker invoker = new CommandInvoker();

            // Test 1: Execute valid appointment command (Create)
            invoker.executeCommand(new CreateAppointmentCommand(service, "app101", "Alice Smith", "Dr. Bob", "2026-10-15 09:00"));
            Appointment app1 = service.getAppointment("app101");
            if (app1 != null && "CREATED".equals(app1.getStatus())) passed++;
            total++;

            // Test 2: Execute a second command of a different type (Schedule)
            invoker.executeCommand(new ScheduleAppointmentCommand(service, "app101", "2026-10-16 10:00"));
            if (app1 != null && "SCHEDULED".equals(app1.getStatus()) && "2026-10-16 10:00".equals(app1.getDate())) passed++;
            total++;

            // Test 3: Verify state changes through repository/service (Cancel)
            invoker.executeCommand(new CancelAppointmentCommand(service, "app101", "Patient requested cancellation"));
            Appointment retrieved = service.getAppointment("app101");
            if (retrieved != null && "CANCELLED".equals(retrieved.getStatus()) && "Patient requested cancellation".equals(retrieved.getCancellationReason())) passed++;
            total++;

            // Test 4: Reject invalid or missing appointment data
            try {
                invoker.executeCommand(new CreateAppointmentCommand(service, "", "", "Dr. Bob", "2026-10-15"));
            } catch (IllegalArgumentException e) {
                passed++;
            }
            total++;

            // Test 5: Handle command targeting nonexistent appointment
            try {
                invoker.executeCommand(new CancelAppointmentCommand(service, "nonexistent_999", "No appointment"));
            } catch (IllegalArgumentException e) {
                passed++;
            }
            total++;

            // Test 6: Verify invalid command execution does not accidentally change stored data
            int countBefore = service.getAppointmentCount();
            try {
                invoker.executeCommand(new CreateAppointmentCommand(service, null, "Invalid", "Dr. Bob", "2026-10-15"));
            } catch (IllegalArgumentException e) {
                // Expected
            }
            try {
                invoker.executeCommand(new ScheduleAppointmentCommand(service, "nonexistent_888", "2026-12-01"));
            } catch (IllegalArgumentException e) {
                // Expected
            }
            if (service.getAppointmentCount() == countBefore && "CANCELLED".equals(service.getAppointment("app101").getStatus())) passed++;
            total++;

            // Test 7: Confirm consistent results across tests
            if (passed == 6) passed++;
            total++;

            System.out.println(passed + "/" + total + " passed");
            System.exit(passed == total ? 0 : 1);
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
    }
}
