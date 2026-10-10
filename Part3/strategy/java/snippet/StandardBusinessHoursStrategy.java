package strategy;
import strategy.models.*;
import java.util.List;
import java.time.OffsetDateTime;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
public class StandardBusinessHoursStrategy implements IAvailabilityStrategy {
    @Override
    public ValidationResult validateAvailability(SlotRequest request, List<ExistingBooking> existingBookings) {
        OffsetDateTime startTime = OffsetDateTime.parse(request.startTimeIso, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        OffsetDateTime endTime = startTime.plusMinutes(request.durationMinutes);
        if (startTime.getDayOfWeek() == DayOfWeek.SATURDAY || startTime.getDayOfWeek() == DayOfWeek.SUNDAY) {
            return new ValidationResult(false, "Outside standard business hours", "StandardBusinessHoursStrategy");
        }
        LocalTime start = startTime.toLocalTime();
        LocalTime end = endTime.toLocalTime();
        LocalTime businessStart = LocalTime.of(9, 0);
        LocalTime businessEnd = LocalTime.of(17, 0);
        if (start.isBefore(businessStart) || end.isAfter(businessEnd)) {
            return new ValidationResult(false, "Outside standard business hours", "StandardBusinessHoursStrategy");
        }
        LocalTime lunchStart = LocalTime.of(12, 0);
        LocalTime lunchEnd = LocalTime.of(13, 0);
        if (start.isBefore(lunchEnd) && end.isAfter(lunchStart)) {
             return new ValidationResult(false, "Overlaps with lunch break", "StandardBusinessHoursStrategy");
        }
        for (ExistingBooking booking : existingBookings) {
            OffsetDateTime bStart = OffsetDateTime.parse(booking.startTimeIso, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            OffsetDateTime bEnd = OffsetDateTime.parse(booking.endTimeIso, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            if (startTime.isBefore(bEnd) && endTime.isAfter(bStart)) {
                return new ValidationResult(false, "Time slot conflict", "StandardBusinessHoursStrategy");
            }
        }
        return new ValidationResult(true, "Valid", "StandardBusinessHoursStrategy");
    }
}
