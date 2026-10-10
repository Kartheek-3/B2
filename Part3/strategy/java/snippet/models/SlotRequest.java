package strategy.models;
public class SlotRequest {
    public String doctorName;
    public String startTimeIso;
    public int durationMinutes;
    public boolean isEmergency;
    public SlotRequest(String doctorName, String startTimeIso, int durationMinutes, boolean isEmergency) {
        this.doctorName = doctorName;
        this.startTimeIso = startTimeIso;
        this.durationMinutes = durationMinutes;
        this.isEmergency = isEmergency;
    }
}
