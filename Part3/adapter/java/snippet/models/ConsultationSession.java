package adapter.models;
public class ConsultationSession {
    public String sessionId;
    public String joinUrl;
    public String startTimeIso;
    public int durationMinutes;
    public String doctorId;
    public String patientId;
    public ConsultationSession(String sessionId, String joinUrl, String startTimeIso, int durationMinutes, String doctorId, String patientId) {
        this.sessionId = sessionId;
        this.joinUrl = joinUrl;
        this.startTimeIso = startTimeIso;
        this.durationMinutes = durationMinutes;
        this.doctorId = doctorId;
        this.patientId = patientId;
    }
}
