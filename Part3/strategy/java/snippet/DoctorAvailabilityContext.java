package strategy;
import strategy.models.*;
import java.util.List;
public class DoctorAvailabilityContext {
    private IAvailabilityStrategy strategy;
    public DoctorAvailabilityContext(IAvailabilityStrategy strategy) {
        this.strategy = strategy;
    }
    public void setStrategy(IAvailabilityStrategy strategy) {
        this.strategy = strategy;
    }
    public ValidationResult checkAvailability(SlotRequest request, List<ExistingBooking> existingBookings) {
        return strategy.validateAvailability(request, existingBookings);
    }
}
