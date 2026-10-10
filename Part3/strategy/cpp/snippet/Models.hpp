#ifndef MODELS_HPP
#define MODELS_HPP

#include <string>

struct SlotRequest {
    std::string doctorName;
    std::string startTimeIso;
    int durationMinutes;
    bool isEmergency;
};

struct ExistingBooking {
    std::string startTimeIso;
    std::string endTimeIso;
};

struct ValidationResult {
    bool isValid;
    std::string reason;
    std::string strategyName;
};

#endif
