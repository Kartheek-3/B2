#include <iostream>
#include <string>
#include <memory>

class IAppointmentValidator {
public:
    virtual bool validate(const std::string& patientId, const std::string& reason) = 0;
    virtual ~IAppointmentValidator() = default;
};

class StandardAppointmentValidator : public IAppointmentValidator {
public:
    bool validate(const std::string& patientId, const std::string& reason) override {
        if (patientId.empty()) return false;
        if (reason.length() < 10) return false;
        return true;
    }
};

class EmergencyAppointmentValidator : public IAppointmentValidator {
public:
    bool validate(const std::string& patientId, const std::string& reason) override {
        if (patientId.empty()) return false;
        return true;
    }
};

class ValidatorFactory {
public:
    virtual std::unique_ptr<IAppointmentValidator> createValidator() = 0;
    
    bool validateAppointment(const std::string& patientId, const std::string& reason) {
        auto validator = createValidator();
        return validator->validate(patientId, reason);
    }
    
    virtual ~ValidatorFactory() = default;
};

class StandardValidatorFactory : public ValidatorFactory {
public:
    std::unique_ptr<IAppointmentValidator> createValidator() override {
        return std::make_unique<StandardAppointmentValidator>();
    }
};

class EmergencyValidatorFactory : public ValidatorFactory {
public:
    std::unique_ptr<IAppointmentValidator> createValidator() override {
        return std::make_unique<EmergencyAppointmentValidator>();
    }
};
