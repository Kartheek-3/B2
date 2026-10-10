#include <iostream>
#include <string>
#include <stdexcept>
#include <memory>

class AppointmentContext;

class IAppointmentState {
public:
    virtual void schedule(AppointmentContext* context) = 0;
    virtual void cancel(AppointmentContext* context, const std::string& reason) = 0;
    virtual std::string getStatus() = 0;
    virtual ~IAppointmentState() = default;
};

class AppointmentContext {
private:
    std::unique_ptr<IAppointmentState> state;
public:
    std::string appointmentId;
    std::string cancellationReason;

    AppointmentContext(std::string id);

    void setState(std::unique_ptr<IAppointmentState> newState) {
        state = std::move(newState);
    }
    void schedule() {
        state->schedule(this);
    }
    void cancel(const std::string& reason) {
        state->cancel(this, reason);
    }
    std::string getStatus() {
        return state->getStatus();
    }
};

class ScheduledState;
class CancelledState;

class CancelledState : public IAppointmentState {
public:
    void schedule(AppointmentContext* context) override {
        throw std::runtime_error("Cannot schedule a cancelled appointment.");
    }
    void cancel(AppointmentContext* context, const std::string& reason) override {
        throw std::runtime_error("Appointment is already cancelled.");
    }
    std::string getStatus() override { return "cancelled"; }
};

class ScheduledState : public IAppointmentState {
public:
    void schedule(AppointmentContext* context) override {
        throw std::runtime_error("Appointment is already scheduled.");
    }
    void cancel(AppointmentContext* context, const std::string& reason) override {
        context->cancellationReason = reason;
        context->setState(std::make_unique<CancelledState>());
    }
    std::string getStatus() override { return "scheduled"; }
};

class PendingState : public IAppointmentState {
public:
    void schedule(AppointmentContext* context) override {
        context->setState(std::make_unique<ScheduledState>());
    }
    void cancel(AppointmentContext* context, const std::string& reason) override {
        context->cancellationReason = reason;
        context->setState(std::make_unique<CancelledState>());
    }
    std::string getStatus() override { return "pending"; }
};

inline AppointmentContext::AppointmentContext(std::string id) : appointmentId(id) {
    state = std::make_unique<PendingState>();
}
