#ifndef IVIDEOCONSULTATIONSERVICE_HPP
#define IVIDEOCONSULTATIONSERVICE_HPP

#include "Models.hpp"

class IVideoConsultationService {
public:
    virtual ~IVideoConsultationService() = default;
    virtual ConsultationSession createSession(const std::string& patientId, const std::string& doctorId, const std::string& startTimeIso, int durationMinutes) = 0;
    virtual ConsultationToken generateParticipantToken(const std::string& sessionId, const std::string& participantId, const std::string& participantRole) = 0;
};

#endif
