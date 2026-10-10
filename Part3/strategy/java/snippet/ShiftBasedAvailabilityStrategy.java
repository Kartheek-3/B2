package strategy;
import strategy.models.*;
import java.util.List;
import java.time.OffsetDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
public class ShiftBasedAvailabilityStrategy implements IAvailabilityStrategy {
    @Override
    public ValidationResult validateAvailability(SlotRequest request, List<ExistingBooking> existingBookings) {
        OffsetDateTime startTime = OffsetDateTime.parse(request.startTimeIso, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        OffsetDateTime endTime = startTime.plusMinutes(request.durationMinutes);
        LocalTime start = startTime.toLocalTime();
        LocalTime end = endTime.toLocalTime();
        LocalTime shiftStart = LocalTime.of(7, 0);
        LocalTime shiftEnd = LocalTime.of(15, 0);
        if (start.isBefore(shiftStart) || end.isAfter(shiftEnd)) {
            return new ValidationResult(false, "Outside scheduled shift", "ShiftBasedAvailabilityStrategy");
        }
        for (ExistingBooking booking : existingBookings) {
            OffsetDateTime bStart = OffsetDateTime.parse(booking.startTimeIso, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            OffsetDateTime bEnd = OffsetDateTime.parse(booking.endTimeIso, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            if (startTime.isBefore(bEnd) && endTime.isAfter(bStart)) {
                return new ValidationResult(false, "Time slot conflict", "ShiftBasedAvailabilityStrategy");
            }
        }
        return new ValidationResult(true, "Valid", "ShiftBasedAvailabilityStrategy");
    }
}
