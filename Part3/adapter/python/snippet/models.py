from dataclasses import dataclass

@dataclass
class ConsultationSession:
    session_id: str
    join_url: str
    start_time_iso: str
    duration_minutes: int
    doctor_id: str
    patient_id: str

@dataclass
class ConsultationToken:
    token: str
    session_id: str
    user_id: str
    role: str
    expires_at_iso: str

class DomainValidationError(Exception):
    pass
