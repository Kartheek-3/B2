package snippet;
import java.util.List;
import java.util.ArrayList;
import java.util.Date;

public class ReminderStore {
    public static class ReminderTask {
        public String appointmentId;
        public String reminderId;
        public Date triggerAt;
        public String windowType;
    }
    private final List<ReminderTask> tasks = new ArrayList<>();

    public void add(ReminderTask task) { tasks.add(task); }
    public List<ReminderTask> getTasks() { return tasks; }
    
    public void cancelForAppointment(String appointmentId) {
        tasks.removeIf(t -> t.appointmentId.equals(appointmentId));
    }
}
