from abc import ABC, abstractmethod

# Product Interface
class IAppointmentValidator(ABC):
    @abstractmethod
    def validate(self, patient_id: str, reason: str) -> bool:
        pass

# Concrete Products
class StandardAppointmentValidator(IAppointmentValidator):
    def validate(self, patient_id: str, reason: str) -> bool:
        if not patient_id or not patient_id.strip(): return False
        if not reason or len(reason.strip()) < 10: return False
        return True

class EmergencyAppointmentValidator(IAppointmentValidator):
    def validate(self, patient_id: str, reason: str) -> bool:
        if not patient_id or not patient_id.strip(): return False
        return True

# Creator
class ValidatorFactory(ABC):
    @abstractmethod
    def create_validator(self) -> IAppointmentValidator:
        pass
        
    def validate_appointment(self, patient_id: str, reason: str) -> bool:
        validator = self.create_validator()
        return validator.validate(patient_id, reason)

# Concrete Creators
class StandardValidatorFactory(ValidatorFactory):
    def create_validator(self) -> IAppointmentValidator:
        return StandardAppointmentValidator()

class EmergencyValidatorFactory(ValidatorFactory):
    def create_validator(self) -> IAppointmentValidator:
        return EmergencyAppointmentValidator()
