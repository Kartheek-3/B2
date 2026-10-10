package snippet;

import java.util.HashMap;
import java.util.Map;

public class AppointmentService {
    private Map<String, Appointment> repository = new HashMap<>();

    public void createAppointment(String id, String patientName, String doctorName, String date) {
        if (id == null || id.trim().isEmpty() ||
            patientName == null || patientName.trim().isEmpty() ||
            doctorName == null || doctorName.trim().isEmpty() ||
            date == null || date.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid or missing appointment data");
        }
        if (repository.containsKey(id)) {
            throw new IllegalArgumentException("Appointment ID already exists: " + id);
        }
        Appointment app = new Appointment(id, patientName, doctorName, date);
        repository.put(id, app);
    }

    public void scheduleAppointment(String id, String newDate) {
        if (id == null || id.trim().isEmpty() || newDate == null || newDate.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid ID or new date");
        }
        Appointment app = repository.get(id);
        if (app == null) {
            throw new IllegalArgumentException("Appointment not found: " + id);
        }
        app.setDate(newDate);
        app.setStatus("SCHEDULED");
    }

    public void cancelAppointment(String id, String reason) {
        if (id == null || id.trim().isEmpty() || reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid ID or cancellation reason");
        }
        Appointment app = repository.get(id);
        if (app == null) {
            throw new IllegalArgumentException("Appointment not found: " + id);
        }
        app.setStatus("CANCELLED");
        app.setCancellationReason(reason);
    }

    public Appointment getAppointment(String id) {
        return repository.get(id);
    }

    public int getAppointmentCount() {
        return repository.size();
    }
}
