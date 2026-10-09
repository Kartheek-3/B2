import { ReminderTask, ReminderStatus } from "../types/events.types";

/**
 * Repository interface for persistent reminder tasks.
 */
export interface IReminderStore {
  saveReminder(task: ReminderTask): Promise<void>;
  getReminder(reminderId: string): Promise<ReminderTask | null>;
  getDueReminders(referenceTime: Date): Promise<ReminderTask[]>;
  updateReminderStatus(
    reminderId: string,
    status: ReminderStatus,
    patch?: Partial<ReminderTask>
  ): Promise<void>;
  cancelRemindersForAppointment(
    appointmentId: string,
    reason: string
  ): Promise<number>;
  getRemindersForAppointment(appointmentId: string): Promise<ReminderTask[]>;
  getAllReminders(): Promise<ReminderTask[]>;
}
