package snippet;

public abstract class ValidatorFactory {
    public abstract IAppointmentValidator createValidator();
    
    public boolean validateAppointment(String patientId, String reason) {
        IAppointmentValidator validator = createValidator();
        return validator.validate(patientId, reason);
    }
}
