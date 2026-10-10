#ifndef VIDEOCONSULTATIONADAPTER_HPP
#define VIDEOCONSULTATIONADAPTER_HPP

#include "IVideoConsultationService.hpp"
#include "ProprietaryVideoProvider.hpp"

inline long parseIsoToTime(const std::string& isoString) {
    struct tm tm = {0};
    int y, M, d, h, m, s;
    if (sscanf(isoString.c_str(), "%d-%d-%dT%d:%d:%dZ", &y, &M, &d, &h, &m, &s) == 6) {
        tm.tm_year = y - 1900;
        tm.tm_mon = M - 1;
        tm.tm_mday = d;
        tm.tm_hour = h;
        tm.tm_min = m;
        tm.tm_sec = s;
        tm.tm_isdst = -1;
#if defined(_WIN32)
        return _mkgmtime(&tm);
#else
        return timegm(&tm);
#endif
    }
    return 0;
}

inline std::string formatTimeToIso(long timeSecs) {
    time_t t = timeSecs;
    struct tm* tm = gmtime(&t);
    char buf[64];
    strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", tm);
    return std::string(buf);
}

class VideoConsultationAdapter : public IVideoConsultationService {
private:
    ProprietaryVideoProvider* adaptee;
public:
    VideoConsultationAdapter(ProprietaryVideoProvider* adaptee) : adaptee(adaptee) {}
    
    ConsultationSession createSession(const std::string& patientId, const std::string& doctorId, const std::string& startTimeIso, int durationMinutes) override {
        try {
            long unixTimestampSec = parseIsoToTime(startTimeIso);
            int durationSec = durationMinutes * 60;
            if (patientId.empty() || doctorId.empty()) throw DomainValidationError("VendorError: Invalid inputs");
            std::string roomName = "room_" + patientId + "_" + doctorId;
            
            InitMeetingResponse res = adaptee->init_meeting(roomName, doctorId, unixTimestampSec, durationSec);
            
            return {
                res.meeting_uuid,
                res.web_link,
                formatTimeToIso(res.start_epoch),
                res.duration_s / 60,
                res.host_id,
                patientId
            };
        } catch (const std::exception& e) {
            throw DomainValidationError(std::string("Failed to create session: ") + e.what());
        }
    }
    
    ConsultationToken generateParticipantToken(const std::string& sessionId, const std::string& participantId, const std::string& participantRole) override {
        try {
            std::string vendorRole;
            if (participantRole == "doctor") vendorRole = "LEVEL_HOST";
            else if (participantRole == "patient") vendorRole = "LEVEL_GUEST";
            else throw DomainValidationError("Unsupported participant role");
            
            MintAccessKeyResponse res = adaptee->mint_access_key(sessionId, participantId, vendorRole);
            
            return {
                res.raw_jwt_token,
                sessionId,
                participantId,
                participantRole,
                formatTimeToIso(res.exp_timestamp)
            };
        } catch (const DomainValidationError& e) {
            throw;
        } catch (const std::exception& e) {
            throw DomainValidationError(std::string("Failed to generate token: ") + e.what());
        }
    }
};

#endif
