from dataclasses import dataclass
from datetime import datetime

@dataclass
class DomainEvent:
    event_type: str

class AppointmentScheduledEvent(DomainEvent):
    def __init__(self, appointment_id: str, schedule_date: datetime, patient_name: str):
        super().__init__("APPOINTMENT_SCHEDULED")
        self.appointment_id = appointment_id
        self.schedule_date = schedule_date
        self.patient_name = patient_name

class AppointmentCancelledEvent(DomainEvent):
    def __init__(self, appointment_id: str, reason: str):
        super().__init__("APPOINTMENT_CANCELLED")
        self.appointment_id = appointment_id
        self.cancellation_reason = reason
