class IAppointmentValidator {
    validate(patientId, reason) {
        throw new Error("Method 'validate()' must be implemented.");
    }
}

class StandardAppointmentValidator extends IAppointmentValidator {
    validate(patientId, reason) {
        if (!patientId || patientId.trim().length === 0) return false;
        if (!reason || reason.trim().length < 10) return false;
        return true;
    }
}

class EmergencyAppointmentValidator extends IAppointmentValidator {
    validate(patientId, reason) {
        if (!patientId || patientId.trim().length === 0) return false;
        return true;
    }
}

class ValidatorFactory {
    createValidator() {
        throw new Error("Method 'createValidator()' must be implemented.");
    }
    
    validateAppointment(patientId, reason) {
        const validator = this.createValidator();
        return validator.validate(patientId, reason);
    }
}

class StandardValidatorFactory extends ValidatorFactory {
    createValidator() {
        return new StandardAppointmentValidator();
    }
}

class EmergencyValidatorFactory extends ValidatorFactory {
    createValidator() {
        return new EmergencyAppointmentValidator();
    }
}

module.exports = {
    StandardValidatorFactory,
    EmergencyValidatorFactory
};
