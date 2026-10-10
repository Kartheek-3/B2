import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from snippet.events import AppointmentScheduledEvent, AppointmentCancelledEvent
from snippet.bus import DomainEventBus
from snippet.store import ReminderStore
from snippet.observer import ReminderSchedulerObserver, ReminderCancellationObserver, AuditLogObserver
from datetime import datetime
import sys

def run_tests():
    passed = 0
    total = 0
    
    bus = DomainEventBus()
    store = ReminderStore()
    
    scheduler = ReminderSchedulerObserver(store)
    canceller = ReminderCancellationObserver(store)
    auditor = AuditLogObserver()
    
    bus.subscribe("APPOINTMENT_SCHEDULED", scheduler)
    bus.subscribe("APPOINTMENT_SCHEDULED", auditor)
    bus.subscribe("APPOINTMENT_CANCELLED", canceller)
    bus.subscribe("APPOINTMENT_CANCELLED", auditor)
    
    dt = datetime(2025, 1, 1, 12, 0, 0)
    
    # Test 1
    bus.publish(AppointmentScheduledEvent("app1", dt, "John"))
    if len(store.get_tasks()) == 2: passed += 1
    total += 1
    if auditor.logs_count == 1: passed += 1
    total += 1
    
    # Test 2
    bus.publish(AppointmentScheduledEvent("app1", dt, "John"))
    if len(store.get_tasks()) == 2: passed += 1
    total += 1
    if auditor.logs_count == 2: passed += 1
    total += 1
    
    # Test 3
    bus.publish(AppointmentCancelledEvent("app1", "Patient requested"))
    if len(store.get_tasks()) == 0: passed += 1
    total += 1
    if auditor.logs_count == 3: passed += 1
    total += 1
    
    print(f"{passed}/{total} passed")
    sys.exit(0 if passed == total else 1)

if __name__ == '__main__':
    run_tests()
