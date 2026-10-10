from dataclasses import dataclass
from typing import Optional

@dataclass
class SlotRequest:
    doctor_name: str
    start_time_iso: str
    duration_minutes: int
    is_emergency: bool

@dataclass
class ExistingBooking:
    start_time_iso: str
    end_time_iso: str

@dataclass
class ValidationResult:
    is_valid: bool
    reason: str
    strategy_name: str
