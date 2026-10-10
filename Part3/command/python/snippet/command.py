from abc import ABC, abstractmethod
from typing import Dict, Optional

class Appointment:
    def __init__(self, appointment_id: str, patient_name: str, doctor_name: str, date: str):
        self.id = appointment_id
        self.patient_name = patient_name
        self.doctor_name = doctor_name
        self.date = date
        self.status = "CREATED"
        self.cancellation_reason = ""

class AppointmentService:
    def __init__(self):
        self._repository: Dict[str, Appointment] = {}

    def create_appointment(self, appointment_id: str, patient_name: str, doctor_name: str, date: str) -> None:
        if not appointment_id or not patient_name or not doctor_name or not date:
            raise ValueError("Invalid or missing appointment data")
        if appointment_id in self._repository:
            raise ValueError(f"Appointment ID already exists: {appointment_id}")
        appointment = Appointment(appointment_id, patient_name, doctor_name, date)
        self._repository[appointment_id] = appointment

    def schedule_appointment(self, appointment_id: str, new_date: str) -> None:
        if not appointment_id or not new_date:
            raise ValueError("Invalid ID or new date")
        if appointment_id not in self._repository:
            raise ValueError(f"Appointment not found: {appointment_id}")
        app = self._repository[appointment_id]
        app.date = new_date
        app.status = "SCHEDULED"

    def cancel_appointment(self, appointment_id: str, reason: str) -> None:
        if not appointment_id or not reason:
            raise ValueError("Invalid ID or cancellation reason")
        if appointment_id not in self._repository:
            raise ValueError(f"Appointment not found: {appointment_id}")
        app = self._repository[appointment_id]
        app.status = "CANCELLED"
        app.cancellation_reason = reason

    def get_appointment(self, appointment_id: str) -> Optional[Appointment]:
        return self._repository.get(appointment_id)

    def get_appointment_count(self) -> int:
        return len(self._repository)

class ICommand(ABC):
    @abstractmethod
    def execute(self) -> None:
        pass

class CreateAppointmentCommand(ICommand):
    def __init__(self, service: AppointmentService, appointment_id: str, patient_name: str, doctor_name: str, date: str):
        self.service = service
        self.id = appointment_id
        self.patient_name = patient_name
        self.doctor_name = doctor_name
        self.date = date

    def execute(self) -> None:
        self.service.create_appointment(self.id, self.patient_name, self.doctor_name, self.date)

class ScheduleAppointmentCommand(ICommand):
    def __init__(self, service: AppointmentService, appointment_id: str, new_date: str):
        self.service = service
        self.id = appointment_id
        self.new_date = new_date

    def execute(self) -> None:
        self.service.schedule_appointment(self.id, self.new_date)

class CancelAppointmentCommand(ICommand):
    def __init__(self, service: AppointmentService, appointment_id: str, reason: str):
        self.service = service
        self.id = appointment_id
        self.reason = reason

    def execute(self) -> None:
        self.service.cancel_appointment(self.id, self.reason)

class CommandInvoker:
    def execute_command(self, command: ICommand) -> None:
        if command:
            command.execute()
