import { IDomainEventSubscriber } from "../DomainEventBus";
import { IReminderStore } from "../../reminders/IReminderStore";
import {
  DomainEvent,
  AppointmentScheduledPayload,
  AppointmentRescheduledPayload,
  ReminderTask,
} from "../types";

export interface AppointmentScheduledDomainEvent extends DomainEvent {
  eventType: "APPOINTMENT_SCHEDULED";
  payload: AppointmentScheduledPayload;
}

export interface AppointmentRescheduledDomainEvent extends DomainEvent {
  eventType: "APPOINTMENT_RESCHEDULED";
  payload: AppointmentRescheduledPayload;
}

/**
 * Concrete Observer 1 (GoF Observer Pattern)
 * Listens for APPOINTMENT_SCHEDULED and APPOINTMENT_RESCHEDULED events.
 * Automatically computes target notification offsets (e.g. 24h and 2h prior)
 * and enqueues idempotent reminder tasks into the persistent store.
 */
export class ReminderSchedulerObserver implements IDomainEventSubscriber {
  private reminderStore: IReminderStore;

  constructor(reminderStore: IReminderStore) {
    this.reminderStore = reminderStore;
  }

  public async onEvent(event: DomainEvent): Promise<void> {
    if (event.eventType === "APPOINTMENT_SCHEDULED") {
      const scheduledEvent = event as AppointmentScheduledDomainEvent;
      await this.scheduleRemindersForAppointment(scheduledEvent.payload);
    } else if (event.eventType === "APPOINTMENT_RESCHEDULED") {
      const rescheduledEvent = event as AppointmentRescheduledDomainEvent;
      // First cancel existing pending reminders for previous time
      await this.reminderStore.cancelRemindersForAppointment(
        rescheduledEvent.payload.appointmentId,
        "Rescheduled to new time slot"
      );
      // Re-schedule for new target time
      await this.scheduleRemindersForAppointment({
        appointmentId: rescheduledEvent.payload.appointmentId,
        patientId: rescheduledEvent.payload.patientId,
        patientName: rescheduledEvent.payload.patientName,
        phone: rescheduledEvent.payload.phone,
        email: rescheduledEvent.payload.email,
        scheduleDate: rescheduledEvent.payload.newSchedule,
        doctorName: rescheduledEvent.payload.doctorName,
        timeZone: rescheduledEvent.payload.timeZone,
      });
    }
  }

  private async scheduleRemindersForAppointment(
    payload: AppointmentScheduledPayload
  ): Promise<void> {
    const scheduleDate = new Date(payload.scheduleDate);
    const scheduleEpoch = scheduleDate.getTime();

    // 1. T-24 Hours Window
    const trigger24h = new Date(scheduleEpoch - 24 * 60 * 60 * 1000);
    const reminder24h: ReminderTask = {
      reminderId: `${payload.appointmentId}_24_HOURS_PRIOR_${scheduleEpoch}`,
      appointmentId: payload.appointmentId,
      patientId: payload.patientId,
      patientName: payload.patientName,
      patientPhone: payload.phone,
      patientEmail: payload.email,
      doctorName: payload.doctorName,
      scheduledFor: scheduleDate,
      triggerAt: trigger24h,
      windowType: "24_HOURS_PRIOR",
      status: "PENDING",
      retryCount: 0,
      maxRetries: 3,
      isTeleconsultation: payload.isTeleconsultation,
      videoJoinUrl: payload.videoJoinUrl,
    };
    await this.reminderStore.saveReminder(reminder24h);

    // 2. T-2 Hours Window
    const trigger2h = new Date(scheduleEpoch - 2 * 60 * 60 * 1000);
    const reminder2h: ReminderTask = {
      reminderId: `${payload.appointmentId}_2_HOURS_PRIOR_${scheduleEpoch}`,
      appointmentId: payload.appointmentId,
      patientId: payload.patientId,
      patientName: payload.patientName,
      patientPhone: payload.phone,
      patientEmail: payload.email,
      doctorName: payload.doctorName,
      scheduledFor: scheduleDate,
      triggerAt: trigger2h,
      windowType: "2_HOURS_PRIOR",
      status: "PENDING",
      retryCount: 0,
      maxRetries: 3,
      isTeleconsultation: payload.isTeleconsultation,
      videoJoinUrl: payload.videoJoinUrl,
    };
    await this.reminderStore.saveReminder(reminder2h);
  }

  public getSubscriberName(): string {
    return "ReminderSchedulerObserver";
  }
}
