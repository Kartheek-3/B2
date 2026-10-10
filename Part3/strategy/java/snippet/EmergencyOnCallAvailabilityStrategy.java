package strategy;
import strategy.models.*;
import java.util.List;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.Duration;
public class EmergencyOnCallAvailabilityStrategy implements IAvailabilityStrategy {
    @Override
    public ValidationResult validateAvailability(SlotRequest request, List<ExistingBooking> existingBookings) {
        OffsetDateTime startTime = OffsetDateTime.parse(request.startTimeIso, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        OffsetDateTime endTime = startTime.plusMinutes(request.durationMinutes);
        for (ExistingBooking booking : existingBookings) {
            OffsetDateTime bStart = OffsetDateTime.parse(booking.startTimeIso, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            OffsetDateTime bEnd = OffsetDateTime.parse(booking.endTimeIso, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            if (startTime.isBefore(bEnd) && endTime.isAfter(bStart)) {
                return new ValidationResult(false, "Time slot conflict", "EmergencyOnCallAvailabilityStrategy");
            }
            if (!startTime.isBefore(bEnd)) {
                long minutesBetween = Duration.between(bEnd, startTime).toMinutes();
                if (minutesBetween < 15) {
                    return new ValidationResult(false, "Requires at least 15 minutes recovery buffer", "EmergencyOnCallAvailabilityStrategy");
                }
            }
            if (!bStart.isBefore(endTime)) {
                long minutesBetween = Duration.between(endTime, bStart).toMinutes();
                if (minutesBetween < 15) {
                    return new ValidationResult(false, "Requires at least 15 minutes recovery buffer", "EmergencyOnCallAvailabilityStrategy");
                }
            }
        }
        return new ValidationResult(true, "Valid", "EmergencyOnCallAvailabilityStrategy");
    }
}
