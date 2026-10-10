package adapter;
import adapter.models.*;
public interface IVideoConsultationService {
    ConsultationSession createSession(String patientId, String doctorId, String startTimeIso, int durationMinutes) throws DomainValidationError;
    ConsultationToken generateParticipantToken(String sessionId, String participantId, String participantRole) throws DomainValidationError;
}
