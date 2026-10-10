class PendingState {
    schedule(context) {
        context.setState(new ScheduledState());
    }
    cancel(context, reason) {
        context.cancellationReason = reason;
        context.setState(new CancelledState());
    }
    getStatus() { return "pending"; }
}

class ScheduledState {
    schedule(context) {
        throw new Error("Appointment is already scheduled.");
    }
    cancel(context, reason) {
        context.cancellationReason = reason;
        context.setState(new CancelledState());
    }
    getStatus() { return "scheduled"; }
}

class CancelledState {
    schedule(context) {
        throw new Error("Cannot schedule a cancelled appointment.");
    }
    cancel(context, reason) {
        throw new Error("Appointment is already cancelled.");
    }
    getStatus() { return "cancelled"; }
}

class AppointmentContext {
    constructor(appointmentId) {
        this.appointmentId = appointmentId;
        this.cancellationReason = null;
        this.state = new PendingState();
    }
    setState(state) { this.state = state; }
    schedule() { this.state.schedule(this); }
    cancel(reason) { this.state.cancel(this, reason); }
    getStatus() { return this.state.getStatus(); }
}

module.exports = { AppointmentContext };
