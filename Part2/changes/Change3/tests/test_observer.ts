import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { DomainEventBus } from "../../../code/lib/events/DomainEventBus";
import { ReminderSchedulerObserver } from "../../../code/lib/events/subscribers/ReminderSchedulerObserver";
import { ReminderCancellationObserver } from "../../../code/lib/events/subscribers/ReminderCancellationObserver";
import { AuditLogObserver } from "../../../code/lib/events/subscribers/AuditLogObserver";
import { JsonFileReminderStore } from "../../../code/lib/reminders/JsonFileReminderStore";
import {
  ReminderProcessingEngine,
  INotificationChannel,
} from "../../../code/lib/reminders/ReminderProcessingEngine";
import {
  AppointmentScheduledPayload,
  AppointmentCancelledPayload,
  NotificationDeliveryResult,
} from "../../../code/lib/events/types";

class MockNotificationChannel implements INotificationChannel {
  public sentMessages: Array<{ phone: string; message: string }> = [];
  public failNext = false;

  public async sendSMS(
    recipientPhone: string,
    message: string
  ): Promise<NotificationDeliveryResult> {
    if (this.failNext) {
      this.failNext = false;
      return {
        success: false,
        error: "Simulated gateway carrier timeout",
        timestamp: new Date(),
      };
    }
    this.sentMessages.push({ phone: recipientPhone, message });
    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date(),
    };
  }
}

async function runObserverTests() {
  console.log("=== Running CH03 Automated Appointment Reminders & Observer Pattern Tests ===");

  const testStorePath = path.join(__dirname, "scratch_test_reminders.json");
  if (fs.existsSync(testStorePath)) {
    fs.unlinkSync(testStorePath);
  }

  const reminderStore = new JsonFileReminderStore(testStorePath);
  const eventBus = new DomainEventBus();
  const mockNotifier = new MockNotificationChannel();
  const engine = new ReminderProcessingEngine(reminderStore, mockNotifier);

  const schedulerObserver = new ReminderSchedulerObserver(reminderStore);
  const cancelObserver = new ReminderCancellationObserver(reminderStore);
  const auditObserver = new AuditLogObserver();

  eventBus.subscribe("APPOINTMENT_SCHEDULED", schedulerObserver);
  eventBus.subscribe("APPOINTMENT_RESCHEDULED", schedulerObserver);
  eventBus.subscribe("APPOINTMENT_CANCELLED", cancelObserver);
  eventBus.subscribe("APPOINTMENT_SCHEDULED", auditObserver);
  eventBus.subscribe("APPOINTMENT_CANCELLED", auditObserver);
  eventBus.subscribe("APPOINTMENT_RESCHEDULED", auditObserver);

  assert.strictEqual(eventBus.getSubscriberCount("APPOINTMENT_SCHEDULED"), 2);
  assert.strictEqual(eventBus.getSubscriberCount("APPOINTMENT_CANCELLED"), 2);
  console.log("✔ Test 1 Passed: DomainEventBus registered subscribers with correct bindings");

  // -------------------------------------------------------------
  // Test 2: Publish APPOINTMENT_SCHEDULED event
  // -------------------------------------------------------------
  const appointmentDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours in future
  const appointmentPayload: AppointmentScheduledPayload = {
    appointmentId: "apt_test_101",
    patientId: "patient_001",
    patientName: "Jane Doe",
    phone: "+1234567890",
    email: "jane@example.com",
    scheduleDate: appointmentDate,
    doctorName: "Dr. John Green",
    timeZone: "America/New_York",
    isTeleconsultation: true,
    videoJoinUrl: "https://teleconsult.carepulse.local/rooms/apt_test_101?auth=test",
  };

  await eventBus.publish({
    eventId: "evt_001",
    occurredAt: new Date(),
    eventType: "APPOINTMENT_SCHEDULED",
    payload: appointmentPayload,
  });

  const reminders = await reminderStore.getRemindersForAppointment("apt_test_101");
  assert.strictEqual(reminders.length, 2, "Must create 2 reminder windows (24h and 2h)");
  const r24 = reminders.find((r) => r.windowType === "24_HOURS_PRIOR");
  const r2h = reminders.find((r) => r.windowType === "2_HOURS_PRIOR");
  assert.ok(r24 !== undefined, "24h reminder must exist");
  assert.ok(r2h !== undefined, "2h reminder must exist");
  assert.strictEqual(r24?.status, "PENDING");
  assert.ok(r24?.isTeleconsultation, "Teleconsultation flag must be copied");
  assert.ok(r24?.videoJoinUrl?.includes("apt_test_101"), "Video link preserved");
  console.log("✔ Test 2 Passed: APPOINTMENT_SCHEDULED automatically enqueued 2 idempotent reminders");

  // -------------------------------------------------------------
  // Test 3: Audit log verification
  // -------------------------------------------------------------
  const auditLogs = auditObserver.getAuditTrail();
  assert.strictEqual(auditLogs.length, 1);
  assert.strictEqual(auditLogs[0].eventType, "APPOINTMENT_SCHEDULED");
  console.log("✔ Test 3 Passed: AuditLogObserver recorded event entry in audit trail");

  // -------------------------------------------------------------
  // Test 4: Persistent store reload from disk
  // -------------------------------------------------------------
  assert.ok(fs.existsSync(testStorePath), "Storage JSON file must exist on disk");
  const reloadedStore = new JsonFileReminderStore(testStorePath);
  const reloadedReminders = await reloadedStore.getRemindersForAppointment("apt_test_101");
  assert.strictEqual(reloadedReminders.length, 2, "Re-hydrated store must contain persisted reminders");
  console.log("✔ Test 4 Passed: JsonFileReminderStore re-hydrated correctly from persistent disk storage");

  // -------------------------------------------------------------
  // Test 5: Due-reminder processing & Duplicate Prevention
  // -------------------------------------------------------------
  // Advance reference time to 25 hours after appointment creation (T-23h from appointment)
  // At this point, the 24h prior reminder (triggering at T-24h) is DUE!
  const referenceTime = new Date(appointmentDate.getTime() - 23 * 60 * 60 * 1000);
  const report1 = await engine.processDueReminders(referenceTime);
  assert.strictEqual(report1.evaluatedCount, 1, "Only 24h reminder is due");
  assert.strictEqual(report1.sentCount, 1, "1 reminder sent");
  assert.strictEqual(mockNotifier.sentMessages.length, 1, "SMS sent to recipient");
  assert.ok(mockNotifier.sentMessages[0].message.includes("video consultation"), "Message includes video notice");

  // Re-run IMMEDIATELY at same reference time -> Must send 0 messages (duplicate prevention!)
  const report2 = await engine.processDueReminders(referenceTime);
  assert.strictEqual(report2.evaluatedCount, 0, "No reminders should be due on second pass");
  assert.strictEqual(report2.sentCount, 0, "Zero duplicates sent");
  assert.strictEqual(mockNotifier.sentMessages.length, 1, "Notification count remains 1");
  console.log("✔ Test 5 Passed: Idempotent reminder processing prevented duplicate notification delivery");

  // -------------------------------------------------------------
  // Test 6: Transient failure & Retry handling
  // -------------------------------------------------------------
  // Advance time so 2h reminder is due
  const referenceTime2h = new Date(appointmentDate.getTime() - 1 * 60 * 60 * 1000);
  mockNotifier.failNext = true; // Inject simulated gateway failure
  const failReport = await engine.processDueReminders(referenceTime2h);
  assert.strictEqual(failReport.failedCount, 1, "1 failure recorded");

  const r2hAfterFail = await reminderStore.getReminder(r2h!.reminderId);
  assert.strictEqual(r2hAfterFail?.retryCount, 1, "Retry count incremented to 1");
  assert.strictEqual(r2hAfterFail?.status, "PENDING", "Remains PENDING for next retry");

  // Now process again without failure -> succeeds
  const retryReport = await engine.processDueReminders(referenceTime2h);
  assert.strictEqual(retryReport.sentCount, 1, "Retry succeeded");
  const r2hSuccess = await reminderStore.getReminder(r2h!.reminderId);
  assert.strictEqual(r2hSuccess?.status, "SENT");
  console.log("✔ Test 6 Passed: Transient delivery failure retried and succeeded on subsequent pass");

  // -------------------------------------------------------------
  // Test 7: Cancellation invalidation
  // -------------------------------------------------------------
  // Create another appointment
  const cancelApptDate = new Date(Date.now() + 72 * 60 * 60 * 1000);
  await eventBus.publish({
    eventId: "evt_002",
    occurredAt: new Date(),
    eventType: "APPOINTMENT_SCHEDULED",
    payload: {
      ...appointmentPayload,
      appointmentId: "apt_test_cancel_999",
      scheduleDate: cancelApptDate,
    },
  });

  // Verify created
  const cancelApptReminders = await reminderStore.getRemindersForAppointment("apt_test_cancel_999");
  assert.strictEqual(cancelApptReminders.length, 2);

  // Now cancel appointment
  const cancelPayload: AppointmentCancelledPayload = {
    appointmentId: "apt_test_cancel_999",
    patientId: "patient_001",
    cancellationReason: "Patient travel conflict",
    cancelledAt: new Date(),
  };

  await eventBus.publish({
    eventId: "evt_003",
    occurredAt: new Date(),
    eventType: "APPOINTMENT_CANCELLED",
    payload: cancelPayload,
  });

  const afterCancel = await reminderStore.getRemindersForAppointment("apt_test_cancel_999");
  assert.strictEqual(afterCancel.every((r) => r.status === "CANCELLED"), true, "All reminders marked CANCELLED");
  console.log("✔ Test 7 Passed: APPOINTMENT_CANCELLED revoked all pending reminders automatically");

  // Clean up scratch file
  if (fs.existsSync(testStorePath)) {
    fs.unlinkSync(testStorePath);
  }

  console.log("All CH03 Observer & Automated Reminders tests passed successfully.\n");
}

runObserverTests().catch((err) => {
  console.error("Observer tests failed:", err);
  process.exit(1);
});
