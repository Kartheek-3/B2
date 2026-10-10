package snippet;

public class Commands {

    public static class CreateAppointmentCommand implements ICommand {
        private AppointmentService service;
        private String id;
        private String patientName;
        private String doctorName;
        private String date;

        public CreateAppointmentCommand(AppointmentService service, String id, String patientName, String doctorName, String date) {
            this.service = service;
            this.id = id;
            this.patientName = patientName;
            this.doctorName = doctorName;
            this.date = date;
        }

        @Override
        public void execute() {
            service.createAppointment(id, patientName, doctorName, date);
        }
    }

    public static class ScheduleAppointmentCommand implements ICommand {
        private AppointmentService service;
        private String id;
        private String newDate;

        public ScheduleAppointmentCommand(AppointmentService service, String id, String newDate) {
            this.service = service;
            this.id = id;
            this.newDate = newDate;
        }

        @Override
        public void execute() {
            service.scheduleAppointment(id, newDate);
        }
    }

    public static class CancelAppointmentCommand implements ICommand {
        private AppointmentService service;
        private String id;
        private String reason;

        public CancelAppointmentCommand(AppointmentService service, String id, String reason) {
            this.service = service;
            this.id = id;
            this.reason = reason;
        }

        @Override
        public void execute() {
            service.cancelAppointment(id, reason);
        }
    }

    public static class CommandInvoker {
        public void executeCommand(ICommand command) {
            if (command != null) {
                command.execute();
            }
        }
    }
}
