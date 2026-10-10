
class DomainValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DomainValidationError';
    }
}

class VideoConsultationAdapter {
    constructor(adaptee) {
        this.adaptee = adaptee;
    }
    createSession(patientId, doctorId, startTimeIso, durationMinutes) {
        try {
            const unixTimestampSec = Math.floor(new Date(startTimeIso).getTime() / 1000);
            const durationSec = durationMinutes * 60;
            if (!patientId || !doctorId) throw new DomainValidationError("VendorError: Invalid inputs");
            const roomName = `room_${patientId}_${doctorId}`;
            
            const res = this.adaptee.init_meeting(roomName, doctorId, unixTimestampSec, durationSec);
            const parsedStartTimeIso = new Date(res.start_epoch * 1000).toISOString();
            
            return {
                sessionId: res.meeting_uuid,
                joinUrl: res.web_link,
                startTimeIso: parsedStartTimeIso,
                durationMinutes: Math.floor(res.duration_s / 60),
                doctorId: res.host_id,
                patientId: patientId
            };
        } catch (e) {
            throw new DomainValidationError(`Failed to create session: ${e.message}`);
        }
    }
    
    generateParticipantToken(sessionId, participantId, participantRole) {
        try {
            let vendorRole;
            if (participantRole === 'doctor') vendorRole = 'LEVEL_HOST';
            else if (participantRole === 'patient') vendorRole = 'LEVEL_GUEST';
            else throw new DomainValidationError('Unsupported participant role');
            
            const res = this.adaptee.mint_access_key(sessionId, participantId, vendorRole);
            const expiresAtIso = new Date(res.exp_timestamp * 1000).toISOString();
            
            return {
                token: res.raw_jwt_token,
                sessionId: sessionId,
                userId: participantId,
                role: participantRole,
                expiresAtIso: expiresAtIso
            };
        } catch (e) {
            if (e instanceof DomainValidationError) throw e;
            throw new DomainValidationError(`Failed to generate token: ${e.message}`);
        }
    }
}
module.exports = { VideoConsultationAdapter, DomainValidationError };
