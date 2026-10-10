#ifndef DOCTORAVAILABILITYCONTEXT_HPP
#define DOCTORAVAILABILITYCONTEXT_HPP

#include "IAvailabilityStrategy.hpp"
#include <memory>

class DoctorAvailabilityContext {
private:
    std::unique_ptr<IAvailabilityStrategy> strategy;
public:
    DoctorAvailabilityContext(std::unique_ptr<IAvailabilityStrategy> initStrategy) : strategy(std::move(initStrategy)) {}
    
    void setStrategy(std::unique_ptr<IAvailabilityStrategy> newStrategy) {
        strategy = std::move(newStrategy);
    }
    
    ValidationResult checkAvailability(const SlotRequest& request, const std::vector<ExistingBooking>& existingBookings) {
        return strategy->validateAvailability(request, existingBookings);
    }
};

#endif
