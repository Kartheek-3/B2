
class DoctorAvailabilityContext {
    constructor(strategy) {
        this.strategy = strategy;
    }
    setStrategy(strategy) {
        this.strategy = strategy;
    }
    checkAvailability(request, existingBookings) {
        return this.strategy.validateAvailability(request, existingBookings);
    }
}
module.exports = DoctorAvailabilityContext;
