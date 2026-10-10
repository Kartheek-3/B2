package adapter;
import adapter.models.*;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.time.Instant;
import java.time.ZoneOffset;
public class VideoConsultationAdapter implements IVideoConsultationService {
    private ProprietaryVideoProvider adaptee;
    public VideoConsultationAdapter(ProprietaryVideoProvider adaptee) {
        this.adaptee = adaptee;
    }
    @Override
    public ConsultationSession createSession(String patientId, String doctorId, String startTimeIso, int durationMinutes) throws DomainValidationError {
        try {
            OffsetDateTime startTime = OffsetDateTime.parse(startTimeIso, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            long unixTimestampSec = startTime.toEpochSecond();
            int durationSec = durationMinutes * 60;
            if (patientId == null || patientId.isEmpty() || doctorId == null || doctorId.isEmpty()) throw new DomainValidationError("VendorError: Invalid inputs");
            String roomName = "room_" + patientId + "_" + doctorId;
            Map<String, Object> response = adaptee.init_meeting(roomName, doctorId, unixTimestampSec, durationSec);
            String sessionId = (String) response.get("meeting_uuid");
            String joinUrl = (String) response.get("web_link");
            long startEpoch = (Long) response.get("start_epoch");
            int durationS = (Integer) response.get("duration_s");
            String hostId = (String) response.get("host_id");
            String parsedStartTimeIso = Instant.ofEpochSecond(startEpoch).atOffset(ZoneOffset.UTC).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            return new ConsultationSession(sessionId, joinUrl, parsedStartTimeIso, durationS / 60, hostId, patientId);
        } catch (Exception e) {
            throw new DomainValidationError("Failed to create session: " + e.getMessage());
        }
    }
    @Override
    public ConsultationToken generateParticipantToken(String sessionId, String participantId, String participantRole) throws DomainValidationError {
        try {
            String vendorAccessLevel;
            if ("doctor".equals(participantRole)) vendorAccessLevel = "LEVEL_HOST";
            else if ("patient".equals(participantRole)) vendorAccessLevel = "LEVEL_GUEST";
            else throw new DomainValidationError("Unsupported participant role");
            Map<String, Object> response = adaptee.mint_access_key(sessionId, participantId, vendorAccessLevel);
            String rawJwtToken = (String) response.get("raw_jwt_token");
            long expTimestamp = ((Number) response.get("exp_timestamp")).longValue();
            String expiresAtIso = Instant.ofEpochSecond(expTimestamp).atOffset(ZoneOffset.UTC).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            return new ConsultationToken(rawJwtToken, sessionId, participantId, participantRole, expiresAtIso);
        } catch (DomainValidationError e) {
            throw e;
        } catch (Exception e) {
            throw new DomainValidationError("Failed to generate token: " + e.getMessage());
        }
    }
}
