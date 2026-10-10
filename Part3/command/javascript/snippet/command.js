class Appointment {
    constructor(id, patientName, doctorName, date) {
        this.id = id;
        this.patientName = patientName;
        this.doctorName = doctorName;
        this.date = date;
        this.status = 'CREATED';
        this.cancellationReason = '';
    }
}

class AppointmentService {
    constructor() {
        this.repository = new Map();
    }

    createAppointment(id, patientName, doctorName, date) {
        if (!id || !id.trim() || !patientName || !patientName.trim() || !doctorName || !doctorName.trim() || !date || !date.trim()) {
            throw new Error('Invalid or missing appointment data');
        }
        if (this.repository.has(id)) {
            throw new Error(`Appointment ID already exists: ${id}`);
        }
        const app = new Appointment(id, patientName, doctorName, date);
        this.repository.set(id, app);
    }

    scheduleAppointment(id, newDate) {
        if (!id || !id.trim() || !newDate || !newDate.trim()) {
            throw new Error('Invalid ID or new date');
        }
        const app = this.repository.get(id);
        if (!app) {
            throw new Error(`Appointment not found: ${id}`);
        }
        app.date = newDate;
        app.status = 'SCHEDULED';
    }

    cancelAppointment(id, reason) {
        if (!id || !id.trim() || !reason || !reason.trim()) {
            throw new Error('Invalid ID or cancellation reason');
        }
        const app = this.repository.get(id);
        if (!app) {
            throw new Error(`Appointment not found: ${id}`);
        }
        app.status = 'CANCELLED';
        app.cancellationReason = reason;
    }

    getAppointment(id) {
        return this.repository.get(id);
    }

    getAppointmentCount() {
        return this.repository.size;
    }
}

class ICommand {
    execute() {
        throw new Error('execute() must be implemented');
    }
}

class CreateAppointmentCommand extends ICommand {
    constructor(service, id, patientName, doctorName, date) {
        super();
        this.service = service;
        this.id = id;
        this.patientName = patientName;
        this.doctorName = doctorName;
        this.date = date;
    }

    execute() {
        this.service.createAppointment(this.id, this.patientName, this.doctorName, this.date);
    }
}

class ScheduleAppointmentCommand extends ICommand {
    constructor(service, id, newDate) {
        super();
        this.service = service;
        this.id = id;
        this.newDate = newDate;
    }

    execute() {
        this.service.scheduleAppointment(this.id, this.newDate);
    }
}

class CancelAppointmentCommand extends ICommand {
    constructor(service, id, reason) {
        super();
        this.service = service;
        this.id = id;
        this.reason = reason;
    }

    execute() {
        this.service.cancelAppointment(this.id, this.reason);
    }
}

class CommandInvoker {
    executeCommand(command) {
        if (command) {
            command.execute();
        }
    }
}

module.exports = {
    Appointment,
    AppointmentService,
    ICommand,
    CreateAppointmentCommand,
    ScheduleAppointmentCommand,
    CancelAppointmentCommand,
    CommandInvoker
};
