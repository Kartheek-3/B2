package snippet;

public class AppointmentContext {
    private IAppointmentState currentState;
    private String appointmentId;
    private String cancellationReason;

    public AppointmentContext(String appointmentId) {
        this.appointmentId = appointmentId;
        this.currentState = new PendingState(); // Initial State
    }

    public void setState(IAppointmentState state) {
        this.currentState = state;
    }

    public void schedule() {
        this.currentState.schedule(this);
    }

    public void cancel(String reason) {
        this.currentState.cancel(this, reason);
    }

    public String getStatus() {
        return this.currentState.getStatus();
    }
    
    public void setCancellationReason(String reason) {
        this.cancellationReason = reason;
    }
    
    public String getCancellationReason() {
        return this.cancellationReason;
    }
}
