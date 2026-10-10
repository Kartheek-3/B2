from abc import ABC, abstractmethod

class IAppointmentState(ABC):
    @abstractmethod
    def schedule(self, context) -> None:
        pass
        
    @abstractmethod
    def cancel(self, context, reason: str) -> None:
        pass
        
    @abstractmethod
    def get_status(self) -> str:
        pass

class PendingState(IAppointmentState):
    def schedule(self, context):
        context.set_state(ScheduledState())
        
    def cancel(self, context, reason: str):
        context.cancellation_reason = reason
        context.set_state(CancelledState())
        
    def get_status(self) -> str:
        return "pending"

class ScheduledState(IAppointmentState):
    def schedule(self, context):
        raise ValueError("Appointment is already scheduled.")
        
    def cancel(self, context, reason: str):
        context.cancellation_reason = reason
        context.set_state(CancelledState())
        
    def get_status(self) -> str:
        return "scheduled"

class CancelledState(IAppointmentState):
    def schedule(self, context):
        raise ValueError("Cannot schedule a cancelled appointment.")
        
    def cancel(self, context, reason: str):
        raise ValueError("Appointment is already cancelled.")
        
    def get_status(self) -> str:
        return "cancelled"

class AppointmentContext:
    def __init__(self, appointment_id: str):
        self.appointment_id = appointment_id
        self.cancellation_reason = None
        self._state = PendingState()
        
    def set_state(self, state: IAppointmentState):
        self._state = state
        
    def schedule(self):
        self._state.schedule(self)
        
    def cancel(self, reason: str):
        self._state.cancel(self, reason)
        
    def get_status(self) -> str:
        return self._state.get_status()
