package snippet;
import java.util.Date;

public class ObserverTest {
    public static void main(String[] args) {
        int passed = 0;
        int total = 0;
        
        try {
            DomainEventBus bus = new DomainEventBus();
            ReminderStore store = new ReminderStore();
            
            ReminderSchedulerObserver scheduler = new ReminderSchedulerObserver(store);
            ReminderCancellationObserver canceller = new ReminderCancellationObserver(store);
            AuditLogObserver auditor = new AuditLogObserver();
            
            bus.subscribe("APPOINTMENT_SCHEDULED", scheduler);
            bus.subscribe("APPOINTMENT_SCHEDULED", auditor);
            bus.subscribe("APPOINTMENT_CANCELLED", canceller);
            bus.subscribe("APPOINTMENT_CANCELLED", auditor);
            
            // Test 1: Scheduling
            long scheduleTime = 1700000000000L;
            bus.publish(new AppointmentScheduledEvent("app1", new Date(scheduleTime), "John Doe"));
            if (store.getTasks().size() == 2) passed++;
            total++;
            if (auditor.logsCount == 1) passed++;
            total++;
            
            // Test 2: Idempotency (publishing again shouldn't add duplicates)
            bus.publish(new AppointmentScheduledEvent("app1", new Date(scheduleTime), "John Doe"));
            if (store.getTasks().size() == 2) passed++;
            total++;
            if (auditor.logsCount == 2) passed++;
            total++;
            
            // Test 3: Cancellation
            bus.publish(new AppointmentCancelledEvent("app1", "Patient requested"));
            if (store.getTasks().size() == 0) passed++;
            total++;
            if (auditor.logsCount == 3) passed++;
            total++;
            
            System.out.println(passed + "/" + total + " passed");
            System.exit(passed == total ? 0 : 1);
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
    }
}
