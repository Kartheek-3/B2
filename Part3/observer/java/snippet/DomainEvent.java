package snippet;
import java.util.Date;

public abstract class DomainEvent {
    public final String eventType;
    public DomainEvent(String eventType) { this.eventType = eventType; }
}

class AppointmentScheduledEvent extends DomainEvent {
    public final String appointmentId;
    public final Date scheduleDate;
    public final String patientName;
    public AppointmentScheduledEvent(String appointmentId, Date scheduleDate, String patientName) {
        super("APPOINTMENT_SCHEDULED");
        this.appointmentId = appointmentId;
        this.scheduleDate = scheduleDate;
        this.patientName = patientName;
    }
}

class AppointmentCancelledEvent extends DomainEvent {
    public final String appointmentId;
    public final String cancellationReason;
    public AppointmentCancelledEvent(String appointmentId, String cancellationReason) {
        super("APPOINTMENT_CANCELLED");
        this.appointmentId = appointmentId;
        this.cancellationReason = cancellationReason;
    }
}
