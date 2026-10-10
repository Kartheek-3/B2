package snippet;

public interface IAppointmentState {
    void schedule(AppointmentContext context) throws IllegalStateException;
    void cancel(AppointmentContext context, String reason) throws IllegalStateException;
    String getStatus();
}
