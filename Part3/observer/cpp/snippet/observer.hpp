#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <set>
#include <memory>
#include <algorithm>

class DomainEvent {
public:
    std::string eventType;
    DomainEvent(std::string type) : eventType(type) {}
    virtual ~DomainEvent() = default;
};

class AppointmentScheduledEvent : public DomainEvent {
public:
    std::string appointmentId;
    long long scheduleEpoch;
    AppointmentScheduledEvent(std::string id, long long epoch) 
        : DomainEvent("APPOINTMENT_SCHEDULED"), appointmentId(id), scheduleEpoch(epoch) {}
};

class AppointmentCancelledEvent : public DomainEvent {
public:
    std::string appointmentId;
    AppointmentCancelledEvent(std::string id) 
        : DomainEvent("APPOINTMENT_CANCELLED"), appointmentId(id) {}
};

class IDomainEventSubscriber {
public:
    virtual void onEvent(const DomainEvent& event) = 0;
    virtual ~IDomainEventSubscriber() = default;
};

class DomainEventBus {
    std::map<std::string, std::set<IDomainEventSubscriber*>> subscribers;
public:
    void subscribe(std::string eventType, IDomainEventSubscriber* sub) {
        subscribers[eventType].insert(sub);
    }
    void unsubscribe(std::string eventType, IDomainEventSubscriber* sub) {
        subscribers[eventType].erase(sub);
    }
    void publish(const DomainEvent& event) {
        auto it = subscribers.find(event.eventType);
        if (it != subscribers.end()) {
            for (auto sub : it->second) {
                sub->onEvent(event);
            }
        }
    }
};

struct ReminderTask {
    std::string appointmentId;
    std::string reminderId;
    long long triggerEpoch;
};

class ReminderStore {
public:
    std::vector<ReminderTask> tasks;
    
    void add(ReminderTask t) { tasks.push_back(t); }
    void cancelForAppointment(const std::string& appId) {
        tasks.erase(std::remove_if(tasks.begin(), tasks.end(),
            [&](const ReminderTask& t) { return t.appointmentId == appId; }), tasks.end());
    }
    bool hasAppointment(const std::string& appId) {
        for (const auto& t : tasks) {
            if (t.appointmentId == appId) return true;
        }
        return false;
    }
};

class ReminderSchedulerObserver : public IDomainEventSubscriber {
    ReminderStore& store;
public:
    ReminderSchedulerObserver(ReminderStore& s) : store(s) {}
    void onEvent(const DomainEvent& event) override {
        if (event.eventType == "APPOINTMENT_SCHEDULED") {
            const auto& schedEvent = static_cast<const AppointmentScheduledEvent&>(event);
            if (store.hasAppointment(schedEvent.appointmentId)) return;
            
            ReminderTask t24;
            t24.appointmentId = schedEvent.appointmentId;
            t24.reminderId = schedEvent.appointmentId + "_24H";
            t24.triggerEpoch = schedEvent.scheduleEpoch - 24 * 3600;
            store.add(t24);
            
            ReminderTask t2;
            t2.appointmentId = schedEvent.appointmentId;
            t2.reminderId = schedEvent.appointmentId + "_2H";
            t2.triggerEpoch = schedEvent.scheduleEpoch - 2 * 3600;
            store.add(t2);
        }
    }
};

class ReminderCancellationObserver : public IDomainEventSubscriber {
    ReminderStore& store;
public:
    ReminderCancellationObserver(ReminderStore& s) : store(s) {}
    void onEvent(const DomainEvent& event) override {
        if (event.eventType == "APPOINTMENT_CANCELLED") {
            const auto& cancelEvent = static_cast<const AppointmentCancelledEvent&>(event);
            store.cancelForAppointment(cancelEvent.appointmentId);
        }
    }
};

class AuditLogObserver : public IDomainEventSubscriber {
public:
    int logsCount = 0;
    void onEvent(const DomainEvent& event) override {
        logsCount++;
    }
};
