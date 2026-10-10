package snippet;

class PendingState implements IAppointmentState {
    @Override
    public void schedule(AppointmentContext context) {
        context.setState(new ScheduledState());
    }

    @Override
    public void cancel(AppointmentContext context, String reason) {
        context.setCancellationReason(reason);
        context.setState(new CancelledState());
    }

    @Override
    public String getStatus() {
        return "pending";
    }
}

class ScheduledState implements IAppointmentState {
    @Override
    public void schedule(AppointmentContext context) {
        throw new IllegalStateException("Appointment is already scheduled.");
    }

    @Override
    public void cancel(AppointmentContext context, String reason) {
        context.setCancellationReason(reason);
        context.setState(new CancelledState());
    }

    @Override
    public String getStatus() {
        return "scheduled";
    }
}

class CancelledState implements IAppointmentState {
    @Override
    public void schedule(AppointmentContext context) {
        throw new IllegalStateException("Cannot schedule a cancelled appointment.");
    }

    @Override
    public void cancel(AppointmentContext context, String reason) {
        throw new IllegalStateException("Appointment is already cancelled.");
    }

    @Override
    public String getStatus() {
        return "cancelled";
    }
}
