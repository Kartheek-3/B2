package snippet;

public class StandardAppointmentValidator implements IAppointmentValidator {
    @Override
    public boolean validate(String patientId, String reason) {
        if (patientId == null || patientId.trim().isEmpty()) return false;
        if (reason == null || reason.trim().length() < 10) return false;
        return true;
    }
}

class EmergencyAppointmentValidator implements IAppointmentValidator {
    @Override
    public boolean validate(String patientId, String reason) {
        // Emergency appointments require a patientId but reason can be brief or empty
        if (patientId == null || patientId.trim().isEmpty()) return false;
        return true;
    }
}
