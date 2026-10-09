import path from "node:path";
import { DomainEventBus } from "./index";
import { ReminderSchedulerObserver } from "./index";
import { ReminderCancellationObserver } from "./index";
import { AuditLogObserver } from "./index";
import {
  JsonFileReminderStore,
  ReminderProcessingEngine,
  INotificationChannel,
} from "../reminders";
import { sendSMSNotification } from "../actions/appointment.actions";

// Default reminder storage location in Part2/code/data/
const defaultStorePath = path.join(process.cwd(), "data", "reminders_store.json");

export const reminderStore = new JsonFileReminderStore(defaultStorePath);
export const domainEventBus = new DomainEventBus();
export const auditLogObserver = new AuditLogObserver();

const schedulerObserver = new ReminderSchedulerObserver(reminderStore);
const cancellationObserver = new ReminderCancellationObserver(reminderStore);

// Register observers with the Subject
domainEventBus.subscribe("APPOINTMENT_SCHEDULED", schedulerObserver);
domainEventBus.subscribe("APPOINTMENT_RESCHEDULED", schedulerObserver);
domainEventBus.subscribe("APPOINTMENT_CANCELLED", cancellationObserver);
domainEventBus.subscribe("APPOINTMENT_SCHEDULED", auditLogObserver);
domainEventBus.subscribe("APPOINTMENT_RESCHEDULED", auditLogObserver);
domainEventBus.subscribe("APPOINTMENT_CANCELLED", auditLogObserver);

// Appwrite-backed notification channel with fallback to mock/log
export class AppwriteNotificationChannel implements INotificationChannel {
  public async sendSMS(recipientPhone: string, message: string) {
    try {
      if (process.env.NEXT_PUBLIC_ENDPOINT && process.env.NEXT_PUBLIC_PROJECT_ID) {
        await sendSMSNotification(recipientPhone, message);
      } else {
        console.log(`[Notification Sink - Local Log] SMS to ${recipientPhone}: ${message}`);
      }
      return {
        success: true,
        messageId: `msg_${Date.now()}`,
        timestamp: new Date(),
      };
    } catch (err: unknown) {
      console.warn("Notification delivery warning:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date(),
      };
    }
  }
}

export const notificationChannel = new AppwriteNotificationChannel();
export const reminderEngine = new ReminderProcessingEngine(reminderStore, notificationChannel);
