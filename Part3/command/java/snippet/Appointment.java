package snippet;

public class Appointment {
    private String id;
    private String patientName;
    private String doctorName;
    private String date;
    private String status;
    private String cancellationReason;

    public Appointment(String id, String patientName, String doctorName, String date) {
        this.id = id;
        this.patientName = patientName;
        this.doctorName = doctorName;
        this.date = date;
        this.status = "CREATED";
        this.cancellationReason = "";
    }

    public String getId() { return id; }
    public String getPatientName() { return patientName; }
    public String getDoctorName() { return doctorName; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String reason) { this.cancellationReason = reason; }
}
