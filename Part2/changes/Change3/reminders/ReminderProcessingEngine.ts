import { IReminderStore } from "./IReminderStore";
import { ReminderTask, NotificationDeliveryResult } from "../types/events.types";

export interface INotificationChannel {
  sendSMS(recipientPhone: string, message: string): Promise<NotificationDeliveryResult>;
  sendEmail?(recipientEmail: string, subject: string, message: string): Promise<NotificationDeliveryResult>;
}

export interface ProcessingReport {
  evaluatedCount: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  details: Array<{
    reminderId: string;
    status: string;
    channel: string;
    recipient: string;
  }>;
}

/**
 * Scheduled Reminder Processing Engine
 *
 * Evaluates due reminders against the reference timestamp, performs
 * status state transitions, dispatches communications, and enforces
 * strict idempotency to prevent duplicate deliveries.
 *
 * ARCHITECTURAL DELIVERY GUARANTEE NOTICE:
 * Because external telecommunication protocols (SMS via Twilio/Appwrite, SMTP email)
 * do not participate in distributed two-phase commit transactions with the application
 * database, external messaging operates under AT-LEAST-ONCE delivery with
 * application-layer idempotency. Exactly-once external delivery cannot be claimed
 * without distributed transactional guarantees across external carriers.
 */
export class ReminderProcessingEngine {
  private reminderStore: IReminderStore;
  private notificationChannel: INotificationChannel;

  constructor(
    reminderStore: IReminderStore,
    notificationChannel: INotificationChannel
  ) {
    this.reminderStore = reminderStore;
    this.notificationChannel = notificationChannel;
  }

  public async processDueReminders(referenceTime: Date): Promise<ProcessingReport> {
    const dueTasks = await this.reminderStore.getDueReminders(referenceTime);

    const report: ProcessingReport = {
      evaluatedCount: dueTasks.length,
      sentCount: 0,
      failedCount: 0,
      skippedCount: 0,
      details: [],
    };

    for (const task of dueTasks) {
      // 1. Guard check: Idempotency check
      if (task.status !== "PENDING") {
        report.skippedCount++;
        continue;
      }

      // 2. Transition state to PROCESSING to guard against re-entrant processing
      await this.reminderStore.updateReminderStatus(task.reminderId, "PROCESSING");

      // 3. Compose message content
      const appointmentTimeFormatted = new Date(task.scheduledFor).toLocaleString();
      let message = `Reminder from CarePulse: You have an appointment with Dr. ${task.doctorName} on ${appointmentTimeFormatted}.`;

      if (task.isTeleconsultation && task.videoJoinUrl) {
        message += ` This is a video consultation. Join link: ${task.videoJoinUrl}`;
      }

      try {
        // 4. Dispatch notification via channel
        const result = await this.notificationChannel.sendSMS(
          task.patientPhone,
          message
        );

        if (result.success) {
          // 5. Successfully delivered -> mark SENT
          await this.reminderStore.updateReminderStatus(task.reminderId, "SENT", {
            processedAt: new Date(),
          });
          report.sentCount++;
          report.details.push({
            reminderId: task.reminderId,
            status: "SENT",
            channel: "SMS",
            recipient: task.patientPhone,
          });
        } else {
          // Transient failure -> retry evaluation
          await this.handleFailure(task, result.error || "Unknown delivery failure");
          report.failedCount++;
          report.details.push({
            reminderId: task.reminderId,
            status: "RETRY_SCHEDULED",
            channel: "SMS",
            recipient: task.patientPhone,
          });
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        await this.handleFailure(task, errorMsg);
        report.failedCount++;
        report.details.push({
          reminderId: task.reminderId,
          status: "FAILED",
          channel: "SMS",
          recipient: task.patientPhone,
        });
      }
    }

    return report;
  }

  private async handleFailure(task: ReminderTask, errorMessage: string): Promise<void> {
    const updatedRetry = task.retryCount + 1;
    if (updatedRetry >= task.maxRetries) {
      await this.reminderStore.updateReminderStatus(task.reminderId, "FAILED", {
        retryCount: updatedRetry,
        lastError: errorMessage,
        processedAt: new Date(),
      });
    } else {
      // Re-queue with incremented retry count
      await this.reminderStore.updateReminderStatus(task.reminderId, "PENDING", {
        retryCount: updatedRetry,
        lastError: errorMessage,
      });
    }
  }
}
