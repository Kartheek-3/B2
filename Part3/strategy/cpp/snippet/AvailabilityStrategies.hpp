#ifndef AVAILABILITYSTRATEGIES_HPP
#define AVAILABILITYSTRATEGIES_HPP

#include "IAvailabilityStrategy.hpp"
#include <iostream>
#include <sstream>
#include <iomanip>
#include <ctime>

inline time_t parseIsoToTimeT(const std::string& isoString) {
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

class StandardBusinessHoursStrategy : public IAvailabilityStrategy {
public:
    ValidationResult validateAvailability(const SlotRequest& request, const std::vector<ExistingBooking>& existingBookings) override {
        time_t startT = parseIsoToTimeT(request.startTimeIso);
        time_t endT = startT + request.durationMinutes * 60;
        struct tm startTmVal = *gmtime(&startT); struct tm* startTm = &startTmVal;
        struct tm endTmVal = *gmtime(&endT); struct tm* endTm = &endTmVal;
        
        int wday = startTm->tm_wday;
        if (wday == 0 || wday == 6) {
            return {false, "Outside standard business hours", "StandardBusinessHoursStrategy"};
        }
        
        int startH = startTm->tm_hour;
        int endH = endTm->tm_hour;
        int endM = endTm->tm_min;
        
        if (startH < 9 || endH > 17 || (endH == 17 && endM > 0)) {
            return {false, "Outside standard business hours", "StandardBusinessHoursStrategy"};
        }
        
        int startMinsFromMid = startH * 60 + startTm->tm_min;
        int endMinsFromMid = endH * 60 + endM;
        if (startMinsFromMid < 13 * 60 && endMinsFromMid > 12 * 60) {
            return {false, "Overlaps with lunch break", "StandardBusinessHoursStrategy"};
        }
        
        for (const auto& booking : existingBookings) {
            time_t bStartT = parseIsoToTimeT(booking.startTimeIso);
            time_t bEndT = parseIsoToTimeT(booking.endTimeIso);
            if (startT < bEndT && endT > bStartT) {
                return {false, "Time slot conflict", "StandardBusinessHoursStrategy"};
            }
        }
        
        return {true, "Valid", "StandardBusinessHoursStrategy"};
    }
};

class ShiftBasedAvailabilityStrategy : public IAvailabilityStrategy {
public:
    ValidationResult validateAvailability(const SlotRequest& request, const std::vector<ExistingBooking>& existingBookings) override {
        time_t startT = parseIsoToTimeT(request.startTimeIso);
        time_t endT = startT + request.durationMinutes * 60;
        struct tm startTmVal = *gmtime(&startT); struct tm* startTm = &startTmVal;
        struct tm endTmVal = *gmtime(&endT); struct tm* endTm = &endTmVal;
        
        int startH = startTm->tm_hour;
        int endH = endTm->tm_hour;
        int endM = endTm->tm_min;
        
        if (startH < 7 || endH > 15 || (endH == 15 && endM > 0)) {
            return {false, "Outside scheduled shift", "ShiftBasedAvailabilityStrategy"};
        }
        
        for (const auto& booking : existingBookings) {
            time_t bStartT = parseIsoToTimeT(booking.startTimeIso);
            time_t bEndT = parseIsoToTimeT(booking.endTimeIso);
            if (startT < bEndT && endT > bStartT) {
                return {false, "Time slot conflict", "ShiftBasedAvailabilityStrategy"};
            }
        }
        
        return {true, "Valid", "ShiftBasedAvailabilityStrategy"};
    }
};

class EmergencyOnCallAvailabilityStrategy : public IAvailabilityStrategy {
public:
    ValidationResult validateAvailability(const SlotRequest& request, const std::vector<ExistingBooking>& existingBookings) override {
        time_t startT = parseIsoToTimeT(request.startTimeIso);
        time_t endT = startT + request.durationMinutes * 60;
        
        for (const auto& booking : existingBookings) {
            time_t bStartT = parseIsoToTimeT(booking.startTimeIso);
            time_t bEndT = parseIsoToTimeT(booking.endTimeIso);
            
            if (startT < bEndT && endT > bStartT) {
                return {false, "Time slot conflict", "EmergencyOnCallAvailabilityStrategy"};
            }
            if (startT >= bEndT) {
                if ((startT - bEndT) / 60 < 15) {
                    return {false, "Requires at least 15 minutes recovery buffer", "EmergencyOnCallAvailabilityStrategy"};
                }
            }
            if (bStartT >= endT) {
                if ((bStartT - endT) / 60 < 15) {
                    return {false, "Requires at least 15 minutes recovery buffer", "EmergencyOnCallAvailabilityStrategy"};
                }
            }
        }
        
        return {true, "Valid", "EmergencyOnCallAvailabilityStrategy"};
    }
};

#endif
