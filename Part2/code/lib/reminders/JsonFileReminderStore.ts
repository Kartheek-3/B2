import fs from "node:fs";
import path from "node:path";

import { ReminderTask, ReminderStatus } from "../events/types";

import { IReminderStore } from "./IReminderStore";

/**
 * Persistent File-Based Reminder Store
 * Implements IReminderStore using synchronous/safe JSON file persistence.
 * Guarantees persistence across application restarts, fulfilling the requirement
 * for non-in-memory-only reminder storage.
 */
export class JsonFileReminderStore implements IReminderStore {
  private filePath: string;
  private cache: Map<string, ReminderTask> = new Map();

  constructor(storageFilePath?: string) {
    this.filePath =
      storageFilePath ||
      path.join(process.cwd(), "data", "reminders_store.json");
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        const list: ReminderTask[] = JSON.parse(raw);
        this.cache.clear();
        for (const item of list) {
          // Re-hydrate Date objects
          item.scheduledFor = new Date(item.scheduledFor);
          item.triggerAt = new Date(item.triggerAt);
          if (item.processedAt) item.processedAt = new Date(item.processedAt);
          this.cache.set(item.reminderId, item);
        }
      } else {
        // Ensure parent directory exists
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        this.flushToDisk();
      }
    } catch (err) {
      console.warn("JsonFileReminderStore: Warning loading storage file:", err);
    }
  }

  private flushToDisk(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = Array.from(this.cache.values());
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("JsonFileReminderStore: Failed to persist reminders to disk:", err);
    }
  }

  public async saveReminder(task: ReminderTask): Promise<void> {
    const existing = this.cache.get(task.reminderId);
    // Duplicate prevention: if reminder is already SENT, do not overwrite to PENDING
    if (existing && existing.status === "SENT" && task.status === "PENDING") {
      return;
    }

    this.cache.set(task.reminderId, { ...task });
    this.flushToDisk();
  }

  public async getReminder(reminderId: string): Promise<ReminderTask | null> {
    const r = this.cache.get(reminderId);
    return r ? { ...r } : null;
  }

  public async getDueReminders(referenceTime: Date): Promise<ReminderTask[]> {
    const refMs = referenceTime.getTime();
    const due: ReminderTask[] = [];

    for (const task of Array.from(this.cache.values())) {
      if (task.status === "PENDING" && task.triggerAt.getTime() <= refMs) {
        due.push({ ...task });
      }
    }

    return due;
  }

  public async updateReminderStatus(
    reminderId: string,
    status: ReminderStatus,
    patch?: Partial<ReminderTask>
  ): Promise<void> {
    const existing = this.cache.get(reminderId);
    if (!existing) return;

    existing.status = status;
    if (patch) {
      Object.assign(existing, patch);
    }

    this.cache.set(reminderId, existing);
    this.flushToDisk();
  }

  public async cancelRemindersForAppointment(
    appointmentId: string,
    reason: string
  ): Promise<number> {
    let cancelledCount = 0;
    for (const [id, task] of Array.from(this.cache.entries())) {
      if (task.appointmentId === appointmentId && task.status === "PENDING") {
        task.status = "CANCELLED";
        task.lastError = `Cancelled due to appointment lifecycle update: ${reason}`;
        this.cache.set(id, task);
        cancelledCount++;
      }
    }

    if (cancelledCount > 0) {
      this.flushToDisk();
    }
    return cancelledCount;
  }

  public async getRemindersForAppointment(appointmentId: string): Promise<ReminderTask[]> {
    const results: ReminderTask[] = [];
    for (const task of Array.from(this.cache.values())) {
      if (task.appointmentId === appointmentId) {
        results.push({ ...task });
      }
    }
    return results;
  }

  public async getAllReminders(): Promise<ReminderTask[]> {
    return Array.from(this.cache.values()).map((t) => ({ ...t }));
  }

  public clear(): void {
    this.cache.clear();
    this.flushToDisk();
  }
}
