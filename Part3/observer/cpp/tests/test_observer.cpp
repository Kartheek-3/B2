#include "../snippet/observer.hpp"

int main() {
    int passed = 0, total = 0;
    
    DomainEventBus bus;
    ReminderStore store;
    
    ReminderSchedulerObserver scheduler(store);
    ReminderCancellationObserver canceller(store);
    AuditLogObserver auditor;
    
    bus.subscribe("APPOINTMENT_SCHEDULED", &scheduler);
    bus.subscribe("APPOINTMENT_SCHEDULED", &auditor);
    bus.subscribe("APPOINTMENT_CANCELLED", &canceller);
    bus.subscribe("APPOINTMENT_CANCELLED", &auditor);
    
    AppointmentScheduledEvent evt("app1", 1700000000);
    bus.publish(evt);
    if (store.tasks.size() == 2) passed++; total++;
    if (auditor.logsCount == 1) passed++; total++;
    
    bus.publish(evt);
    if (store.tasks.size() == 2) passed++; total++;
    if (auditor.logsCount == 2) passed++; total++;
    
    AppointmentCancelledEvent evt2("app1");
    bus.publish(evt2);
    if (store.tasks.size() == 0) passed++; total++;
    if (auditor.logsCount == 3) passed++; total++;
    
    std::cout << passed << "/" << total << " passed\n";
    return passed == total ? 0 : 1;
}
