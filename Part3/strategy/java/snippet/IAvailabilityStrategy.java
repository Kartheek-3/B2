package strategy;
import strategy.models.*;
import java.util.List;
public interface IAvailabilityStrategy {
    ValidationResult validateAvailability(SlotRequest request, List<ExistingBooking> existingBookings);
}
