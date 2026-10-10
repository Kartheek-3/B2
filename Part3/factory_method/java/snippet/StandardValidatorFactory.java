package snippet;

public class StandardValidatorFactory extends ValidatorFactory {
    @Override
    public IAppointmentValidator createValidator() {
        return new StandardAppointmentValidator();
    }
}

class EmergencyValidatorFactory extends ValidatorFactory {
    @Override
    public IAppointmentValidator createValidator() {
        return new EmergencyAppointmentValidator();
    }
}
