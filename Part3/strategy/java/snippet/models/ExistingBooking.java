package strategy.models;
public class ExistingBooking {
    public String startTimeIso;
    public String endTimeIso;
    public ExistingBooking(String startTimeIso, String endTimeIso) {
        this.startTimeIso = startTimeIso;
        this.endTimeIso = endTimeIso;
    }
}
