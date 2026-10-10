from .availability_strategy import IAvailabilityStrategy
from .models import SlotRequest, ExistingBooking, ValidationResult
from typing import List

class DoctorAvailabilityContext:
    def __init__(self, strategy: IAvailabilityStrategy):
        self.strategy = strategy
        
    def set_strategy(self, strategy: IAvailabilityStrategy):
        self.strategy = strategy
        
    def check_availability(self, request: SlotRequest, existing_bookings: List[ExistingBooking]) -> ValidationResult:
        return self.strategy.validate_availability(request, existing_bookings)
