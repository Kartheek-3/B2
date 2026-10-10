#ifndef IAVAILABILITYSTRATEGY_HPP
#define IAVAILABILITYSTRATEGY_HPP

#include "Models.hpp"
#include <vector>

class IAvailabilityStrategy {
public:
    virtual ~IAvailabilityStrategy() = default;
    virtual ValidationResult validateAvailability(const SlotRequest& request, const std::vector<ExistingBooking>& existingBookings) = 0;
};

#endif
