import { IDomainEventSubscriber } from "../DomainEventBus";
import { IReminderStore } from "../../reminders/IReminderStore";
import {
  DomainEvent,
  AppointmentCancelledPayload,
} from "../../types/events.types";

export interface AppointmentCancelledDomainEvent extends DomainEvent {
  eventType: "APPOINTMENT_CANCELLED";
  payload: AppointmentCancelledPayload;
}

/**
 * Concrete Observer 2 (GoF Observer Pattern)
 * Listens for APPOINTMENT_CANCELLED events.
 * Automatically invalidates and revokes any pending reminder tasks
 * associated with the cancelled appointment.
 */
export class ReminderCancellationObserver implements IDomainEventSubscriber {
  private reminderStore: IReminderStore;

  constructor(reminderStore: IReminderStore) {
    this.reminderStore = reminderStore;
  }

  public async onEvent(event: DomainEvent): Promise<void> {
    if (event.eventType === "APPOINTMENT_CANCELLED") {
      const cancelEvent = event as AppointmentCancelledDomainEvent;
      await this.reminderStore.cancelRemindersForAppointment(
        cancelEvent.payload.appointmentId,
        cancelEvent.payload.cancellationReason
      );
    }
  }

  public getSubscriberName(): string {
    return "ReminderCancellationObserver";
  }
}
