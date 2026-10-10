#ifndef COMMAND_HPP
#define COMMAND_HPP

#include <string>
#include <unordered_map>
#include <memory>
#include <stdexcept>
#include <iostream>

struct Appointment {
    std::string id;
    std::string patientName;
    std::string doctorName;
    std::string date;
    std::string status;
    std::string cancellationReason;

    Appointment() = default;
    Appointment(std::string id, std::string patientName, std::string doctorName, std::string date)
        : id(std::move(id)), patientName(std::move(patientName)),
          doctorName(std::move(doctorName)), date(std::move(date)),
          status("CREATED"), cancellationReason("") {}
};

class AppointmentService {
private:
    std::unordered_map<std::string, Appointment> repository;

public:
    void createAppointment(const std::string& id, const std::string& patientName, const std::string& doctorName, const std::string& date) {
        if (id.empty() || patientName.empty() || doctorName.empty() || date.empty()) {
            throw std::invalid_argument("Invalid or missing appointment data");
        }
        if (repository.find(id) != repository.end()) {
            throw std::invalid_argument("Appointment ID already exists: " + id);
        }
        repository[id] = Appointment(id, patientName, doctorName, date);
    }

    void scheduleAppointment(const std::string& id, const std::string& newDate) {
        if (id.empty() || newDate.empty()) {
            throw std::invalid_argument("Invalid ID or new date");
        }
        auto it = repository.find(id);
        if (it == repository.end()) {
            throw std::invalid_argument("Appointment not found: " + id);
        }
        it->second.date = newDate;
        it->second.status = "SCHEDULED";
    }

    void cancelAppointment(const std::string& id, const std::string& reason) {
        if (id.empty() || reason.empty()) {
            throw std::invalid_argument("Invalid ID or cancellation reason");
        }
        auto it = repository.find(id);
        if (it == repository.end()) {
            throw std::invalid_argument("Appointment not found: " + id);
        }
        it->second.status = "CANCELLED";
        it->second.cancellationReason = reason;
    }

    Appointment* getAppointment(const std::string& id) {
        auto it = repository.find(id);
        if (it == repository.end()) {
            return nullptr;
        }
        return &(it->second);
    }

    size_t getAppointmentCount() const {
        return repository.size();
    }
};

class ICommand {
public:
    virtual ~ICommand() = default;
    virtual void execute() = 0;
};

class CreateAppointmentCommand : public ICommand {
private:
    AppointmentService& service;
    std::string id;
    std::string patientName;
    std::string doctorName;
    std::string date;

public:
    CreateAppointmentCommand(AppointmentService& service, std::string id, std::string patientName, std::string doctorName, std::string date)
        : service(service), id(std::move(id)), patientName(std::move(patientName)),
          doctorName(std::move(doctorName)), date(std::move(date)) {}

    void execute() override {
        service.createAppointment(id, patientName, doctorName, date);
    }
};

class ScheduleAppointmentCommand : public ICommand {
private:
    AppointmentService& service;
    std::string id;
    std::string newDate;

public:
    ScheduleAppointmentCommand(AppointmentService& service, std::string id, std::string newDate)
        : service(service), id(std::move(id)), newDate(std::move(newDate)) {}

    void execute() override {
        service.scheduleAppointment(id, newDate);
    }
};

class CancelAppointmentCommand : public ICommand {
private:
    AppointmentService& service;
    std::string id;
    std::string reason;

public:
    CancelAppointmentCommand(AppointmentService& service, std::string id, std::string reason)
        : service(service), id(std::move(id)), reason(std::move(reason)) {}

    void execute() override {
        service.cancelAppointment(id, reason);
    }
};

class CommandInvoker {
public:
    void executeCommand(ICommand& command) {
        command.execute();
    }
};

#endif
