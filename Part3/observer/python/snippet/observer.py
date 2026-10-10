from datetime import timedelta

class ReminderSchedulerObserver:
    def __init__(self, store):
        self.store = store

    def on_event(self, event):
        if event.event_type == "APPOINTMENT_SCHEDULED":
            # Idempotency check
            if any(t['appointment_id'] == event.appointment_id for t in self.store.get_tasks()):
                return
                
            t24 = {
                "appointment_id": event.appointment_id,
                "reminder_id": f"{event.appointment_id}_24H",
                "trigger_at": event.schedule_date - timedelta(hours=24),
                "window_type": "24_HOURS_PRIOR"
            }
            self.store.add(t24)

            t2 = {
                "appointment_id": event.appointment_id,
                "reminder_id": f"{event.appointment_id}_2H",
                "trigger_at": event.schedule_date - timedelta(hours=2),
                "window_type": "2_HOURS_PRIOR"
            }
            self.store.add(t2)

class ReminderCancellationObserver:
    def __init__(self, store):
        self.store = store
        
    def on_event(self, event):
        if event.event_type == "APPOINTMENT_CANCELLED":
            self.store.cancel_for_appointment(event.appointment_id)

class AuditLogObserver:
    def __init__(self):
        self.logs_count = 0
        
    def on_event(self, event):
        self.logs_count += 1
