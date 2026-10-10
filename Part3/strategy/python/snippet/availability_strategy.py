from abc import ABC, abstractmethod
from typing import List
from datetime import datetime, timedelta, time
from .models import SlotRequest, ExistingBooking, ValidationResult

class IAvailabilityStrategy(ABC):
    @abstractmethod
    def validate_availability(self, request: SlotRequest, existing_bookings: List[ExistingBooking]) -> ValidationResult:
        pass

class StandardBusinessHoursStrategy(IAvailabilityStrategy):
    def validate_availability(self, request: SlotRequest, existing_bookings: List[ExistingBooking]) -> ValidationResult:
        start_time = datetime.fromisoformat(request.start_time_iso.replace('Z', '+00:00'))
        end_time = start_time + timedelta(minutes=request.duration_minutes)
        
        if start_time.weekday() >= 5:
            return ValidationResult(False, "Outside standard business hours", "StandardBusinessHoursStrategy")
            
        business_start = time(9, 0)
        business_end = time(17, 0)
        if start_time.time() < business_start or end_time.time() > business_end:
            return ValidationResult(False, "Outside standard business hours", "StandardBusinessHoursStrategy")
            
        lunch_start = time(12, 0)
        lunch_end = time(13, 0)
        if start_time.time() < lunch_end and end_time.time() > lunch_start:
            return ValidationResult(False, "Overlaps with lunch break", "StandardBusinessHoursStrategy")
            
        for booking in existing_bookings:
            b_start = datetime.fromisoformat(booking.start_time_iso.replace('Z', '+00:00'))
            b_end = datetime.fromisoformat(booking.end_time_iso.replace('Z', '+00:00'))
            if start_time < b_end and end_time > b_start:
                return ValidationResult(False, "Time slot conflict", "StandardBusinessHoursStrategy")
                
        return ValidationResult(True, "Valid", "StandardBusinessHoursStrategy")

class ShiftBasedAvailabilityStrategy(IAvailabilityStrategy):
    def validate_availability(self, request: SlotRequest, existing_bookings: List[ExistingBooking]) -> ValidationResult:
        start_time = datetime.fromisoformat(request.start_time_iso.replace('Z', '+00:00'))
        end_time = start_time + timedelta(minutes=request.duration_minutes)
        
        shift_start = time(7, 0)
        shift_end = time(15, 0)
        if start_time.time() < shift_start or end_time.time() > shift_end:
            return ValidationResult(False, "Outside scheduled shift", "ShiftBasedAvailabilityStrategy")
            
        for booking in existing_bookings:
            b_start = datetime.fromisoformat(booking.start_time_iso.replace('Z', '+00:00'))
            b_end = datetime.fromisoformat(booking.end_time_iso.replace('Z', '+00:00'))
            if start_time < b_end and end_time > b_start:
                return ValidationResult(False, "Time slot conflict", "ShiftBasedAvailabilityStrategy")
                
        return ValidationResult(True, "Valid", "ShiftBasedAvailabilityStrategy")

class EmergencyOnCallAvailabilityStrategy(IAvailabilityStrategy):
    def validate_availability(self, request: SlotRequest, existing_bookings: List[ExistingBooking]) -> ValidationResult:
        start_time = datetime.fromisoformat(request.start_time_iso.replace('Z', '+00:00'))
        end_time = start_time + timedelta(minutes=request.duration_minutes)
        
        for booking in existing_bookings:
            b_start = datetime.fromisoformat(booking.start_time_iso.replace('Z', '+00:00'))
            b_end = datetime.fromisoformat(booking.end_time_iso.replace('Z', '+00:00'))
            if start_time < b_end and end_time > b_start:
                return ValidationResult(False, "Time slot conflict", "EmergencyOnCallAvailabilityStrategy")
                
            if start_time >= b_end:
                if (start_time - b_end).total_seconds() / 60 < 15:
                    return ValidationResult(False, "Requires at least 15 minutes recovery buffer", "EmergencyOnCallAvailabilityStrategy")
            if b_start >= end_time:
                if (b_start - end_time).total_seconds() / 60 < 15:
                    return ValidationResult(False, "Requires at least 15 minutes recovery buffer", "EmergencyOnCallAvailabilityStrategy")
                    
        return ValidationResult(True, "Valid", "EmergencyOnCallAvailabilityStrategy")
