from abc import ABC, abstractmethod
from .models import ConsultationSession, ConsultationToken, DomainValidationError
from .proprietary_provider import ProprietaryVideoProvider
import datetime

class IVideoConsultationService(ABC):
    @abstractmethod
    def create_session(self, patient_id: str, doctor_id: str, start_time_iso: str, duration_minutes: int) -> ConsultationSession:
        pass
        
    @abstractmethod
    def generate_participant_token(self, session_id: str, participant_id: str, participant_role: str) -> ConsultationToken:
        pass

class VideoConsultationAdapter(IVideoConsultationService):
    def __init__(self, adaptee: ProprietaryVideoProvider):
        self.adaptee = adaptee
        
    def create_session(self, patient_id: str, doctor_id: str, start_time_iso: str, duration_minutes: int) -> ConsultationSession:
        try:
            start_time = datetime.datetime.fromisoformat(start_time_iso.replace('Z', '+00:00'))
            unix_timestamp_sec = int(start_time.timestamp())
            duration_sec = duration_minutes * 60
            if not patient_id or not doctor_id: raise DomainValidationError("VendorError: Invalid inputs")
            room_name = f"room_{patient_id}_{doctor_id}"
            
            res = self.adaptee.init_meeting(room_name, doctor_id, unix_timestamp_sec, duration_sec)
            
            parsed_start_time_iso = datetime.datetime.fromtimestamp(res['start_epoch'], tz=datetime.timezone.utc).isoformat().replace('+00:00', 'Z')
            return ConsultationSession(
                res['meeting_uuid'], res['web_link'], parsed_start_time_iso, res['duration_s'] // 60, res['host_id'], patient_id
            )
        except Exception as e:
            raise DomainValidationError(f"Failed to create session: {str(e)}")
            
    def generate_participant_token(self, session_id: str, participant_id: str, participant_role: str) -> ConsultationToken:
        try:
            if participant_role == "doctor": vendor_role = "LEVEL_HOST"
            elif participant_role == "patient": vendor_role = "LEVEL_GUEST"
            else: raise DomainValidationError("Unsupported participant role")
            
            res = self.adaptee.mint_access_key(session_id, participant_id, vendor_role)
            
            expires_at_iso = datetime.datetime.fromtimestamp(res['exp_timestamp'], tz=datetime.timezone.utc).isoformat().replace('+00:00', 'Z')
            return ConsultationToken(
                res['raw_jwt_token'], session_id, participant_id, participant_role, expires_at_iso
            )
        except DomainValidationError:
            raise
        except Exception as e:
            raise DomainValidationError(f"Failed to generate token: {str(e)}")
