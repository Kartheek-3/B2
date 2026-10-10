#ifndef ADAPTER_MODELS_HPP
#define ADAPTER_MODELS_HPP

#include <string>
#include <stdexcept>

struct ConsultationSession {
    std::string sessionId;
    std::string joinUrl;
    std::string startTimeIso;
    int durationMinutes;
    std::string doctorId;
    std::string patientId;
};

struct ConsultationToken {
    std::string token;
    std::string sessionId;
    std::string userId;
    std::string role;
    std::string expiresAtIso;
};

class DomainValidationError : public std::runtime_error {
public:
    explicit DomainValidationError(const std::string& msg) : std::runtime_error(msg) {}
};

#endif
