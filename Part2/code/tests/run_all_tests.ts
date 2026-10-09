import assert from "node:assert";
import path from "node:path";
import fs from "node:fs";

// 1. CH01 Adapter Imports
import { LocalDemonstrationVideoProvider } from "../changes/Change1/adaptee/LocalDemonstrationVideoProvider";
import { LocalDemonstrationVideoAdapter } from "../changes/Change1/adapter/LocalDemonstrationVideoAdapter";
import { VideoServiceFactory } from "../changes/Change1/adapter/VideoServiceFactory";

// 2. CH02 Strategy Imports
import { StandardBusinessHoursStrategy } from "../changes/Change2/strategy/StandardBusinessHoursStrategy";
import { ShiftBasedAvailabilityStrategy } from "../changes/Change2/strategy/ShiftBasedAvailabilityStrategy";
import { EmergencyOnCallAvailabilityStrategy } from "../changes/Change2/strategy/EmergencyOnCallAvailabilityStrategy";
import { DoctorAvailabilityContext } from "../changes/Change2/strategy/DoctorAvailabilityContext";
import { DoctorAvailabilityConfigs } from "../constants/index";

// 3. CH03 Observer & Reminders Imports
import { DomainEventBus } from "../changes/Change3/observer/DomainEventBus";
import { ReminderSchedulerObserver } from "../changes/Change3/observer/subscribers/ReminderSchedulerObserver";
import { ReminderCancellationObserver } from "../changes/Change3/observer/subscribers/ReminderCancellationObserver";
import { AuditLogObserver } from "../changes/Change3/observer/subscribers/AuditLogObserver";
import { JsonFileReminderStore } from "../changes/Change3/reminders/JsonFileReminderStore";
import {
  ReminderProcessingEngine,
  INotificationChannel,
} from "../changes/Change3/reminders/ReminderProcessingEngine";

class TestMockChannel implements INotificationChannel {
  public messages: Array<{ to: string; text: string }> = [];
  public failOnce = false;

  public async sendSMS(phone: string, text: string) {
    if (this.failOnce) {
      this.failOnce = false;
      return { success: false, error: "Network gateway failure", timestamp: new Date() };
    }
    this.messages.push({ to: phone, text });
    return { success: true, messageId: `msg_${Date.now()}`, timestamp: new Date() };
  }
}

async function runMasterTestSuite() {
  console.log("================================================================================");
  console.log("        CAREPULSE PART 2 MASTER INTEGRATION & PATTERN TEST SUITE                ");
  console.log("================================================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  function recordPass(testName: string) {
    totalTests++;
    passedTests++;
    console.log(`[PASS] ${testName}`);
  }

  // --------------------------------------------------------------------------
  // SECTION 1: CH01 VIDEO CONSULTATION ADAPTER PATTERN
  // --------------------------------------------------------------------------
  console.log("--- 1. Testing CH01 Adapter Pattern Collaboration ---");
  const adaptee = new LocalDemonstrationVideoProvider();
  const adapter = new LocalDemonstrationVideoAdapter(adaptee);

  const roomReq = {
    appointmentId: "apt_integ_001",
    doctorName: "Dr. Alex Ramirez",
    patientName: "Sarah Connor",
    scheduledTime: new Date("2026-10-20T14:00:00Z"),
  };
  const room = await adapter.createRoom(roomReq);
  assert.ok(room.roomId.startsWith("ldv_room_apt_integ_001"));
  assert.strictEqual(room.provider, "LOCAL_DEMO");
  recordPass("CH01.1: Adapter translates domain createRoom request to proprietary provider");

  const doctorAccess = await adapter.generateParticipantAccess(room.roomId, {
    userId: "doc_1",
    name: "Dr. Alex Ramirez",
    role: "doctor",
  });
  assert.ok(doctorAccess.accessToken.startsWith("ldv.tok."));
  assert.ok(doctorAccess.joinUrl.includes("role=clinician"));
  recordPass("CH01.2: Adapter translates domain doctor role to clinician token claims");

  const patientAccess = await adapter.generateParticipantAccess(room.roomId, {
    userId: "pat_1",
    name: "Sarah Connor",
    role: "patient",
  });
  assert.ok(patientAccess.joinUrl.includes("role=client"));
  recordPass("CH01.3: Adapter translates domain patient role to client token claims");

  VideoServiceFactory.reset();
  const defaultService = VideoServiceFactory.getVideoService();
  assert.ok(defaultService instanceof LocalDemonstrationVideoAdapter);
  recordPass("CH01.4: VideoServiceFactory reliably supplies active adapter");

  // --------------------------------------------------------------------------
  // SECTION 2: CH02 FLEXIBLE DOCTOR AVAILABILITY STRATEGY PATTERN
  // --------------------------------------------------------------------------
  console.log("\n--- 2. Testing CH02 Strategy Pattern Collaboration ---");
  const context = new DoctorAvailabilityContext();

  // Test Standard Business Hours (John Green)
  const drGreenConfig = DoctorAvailabilityConfigs["John Green"];
  context.setStrategy(DoctorAvailabilityContext.resolveStrategy(drGreenConfig));

  const wednesdayWorkingHours = new Date("2026-10-21T10:00:00");
  const validStandard = context.validateSlot(
    { doctorName: "John Green", requestedTime: wednesdayWorkingHours, durationMinutes: 30 },
    drGreenConfig,
    []
  );
  assert.strictEqual(validStandard.isValid, true);
  recordPass("CH02.1: StandardBusinessHoursStrategy accepts valid weekday outpatient slot");

  const sundayDate = new Date("2026-10-18T10:00:00");
  const weekendStandard = context.validateSlot(
    { doctorName: "John Green", requestedTime: sundayDate, durationMinutes: 30 },
    drGreenConfig,
    []
  );
  assert.strictEqual(weekendStandard.isValid, false);
  recordPass("CH02.2: StandardBusinessHoursStrategy rejects weekend outpatient request");

  // Test Shift-Based Availability (Leila Cameron)
  const drCameronConfig = DoctorAvailabilityConfigs["Leila Cameron"];
  context.setStrategy(DoctorAvailabilityContext.resolveStrategy(drCameronConfig));

  const wedShiftTime = new Date("2026-10-21T08:30:00"); // Inside Wednesday 07:00-15:00 shift
  const validShift = context.validateSlot(
    { doctorName: "Leila Cameron", requestedTime: wedShiftTime, durationMinutes: 45 },
    drCameronConfig,
    []
  );
  assert.strictEqual(validShift.isValid, true);
  recordPass("CH02.3: ShiftBasedAvailabilityStrategy accepts slot strictly within assigned roster shift");

  const wedOffShiftTime = new Date("2026-10-21T18:00:00"); // Outside Wednesday shift
  const invalidShift = context.validateSlot(
    { doctorName: "Leila Cameron", requestedTime: wedOffShiftTime, durationMinutes: 45 },
    drCameronConfig,
    []
  );
  assert.strictEqual(invalidShift.isValid, false);
  recordPass("CH02.4: ShiftBasedAvailabilityStrategy rejects slot outside active shift hours");

  // Test Emergency On-Call Strategy (Evan Peter)
  const drPeterConfig = DoctorAvailabilityConfigs["Evan Peter"];
  context.setStrategy(DoctorAvailabilityContext.resolveStrategy(drPeterConfig));

  const sunday2am = new Date("2026-10-18T02:00:00");
  const emergencyValid = context.validateSlot(
    { doctorName: "Evan Peter", requestedTime: sunday2am, durationMinutes: 20 },
    drPeterConfig,
    []
  );
  assert.strictEqual(emergencyValid.isValid, true);
  recordPass("CH02.5: EmergencyOnCallAvailabilityStrategy permits 24/7 emergency triage");

  // Emergency buffer collision
  const emergencyCollision = context.validateSlot(
    { doctorName: "Evan Peter", requestedTime: new Date("2026-10-18T02:10:00"), durationMinutes: 20 },
    drPeterConfig,
    [
      {
        appointmentId: "apt_exist_em",
        doctorName: "Evan Peter",
        schedule: sunday2am,
        durationMinutes: 20,
        status: "scheduled",
      },
    ]
  );
  assert.strictEqual(emergencyCollision.isValid, false);
  assert.ok(emergencyCollision.reason?.includes("buffer"));
  recordPass("CH02.6: EmergencyOnCallAvailabilityStrategy rejects slot encroaching on 15-min recovery buffer");

  // --------------------------------------------------------------------------
  // SECTION 3: CH03 OBSERVER PATTERN & AUTOMATED REMINDERS
  // --------------------------------------------------------------------------
  console.log("\n--- 3. Testing CH03 Observer Pattern & Scheduled Processing ---");
  const tempStoreFile = path.join(__dirname, "temp_integ_reminders.json");
  if (fs.existsSync(tempStoreFile)) fs.unlinkSync(tempStoreFile);

  const reminderStore = new JsonFileReminderStore(tempStoreFile);
  const bus = new DomainEventBus();
  const mockChannel = new TestMockChannel();
  const engine = new ReminderProcessingEngine(reminderStore, mockChannel);

  const schedObserver = new ReminderSchedulerObserver(reminderStore);
  const cancelObserver = new ReminderCancellationObserver(reminderStore);
  const auditObserver = new AuditLogObserver();

  bus.subscribe("APPOINTMENT_SCHEDULED", schedObserver);
  bus.subscribe("APPOINTMENT_CANCELLED", cancelObserver);
  bus.subscribe("APPOINTMENT_SCHEDULED", auditObserver);
  bus.subscribe("APPOINTMENT_CANCELLED", auditObserver);

  // Trigger APPOINTMENT_SCHEDULED event with teleconsultation link
  const targetApptDate = new Date(Date.now() + 30 * 60 * 60 * 1000); // 30 hours in future
  await bus.publish({
    eventId: "evt_integ_1",
    occurredAt: new Date(),
    eventType: "APPOINTMENT_SCHEDULED",
    payload: {
      appointmentId: "apt_integ_888",
      patientId: "patient_888",
      patientName: "Alice Walker",
      phone: "+1555000111",
      scheduleDate: targetApptDate,
      doctorName: "John Green",
      timeZone: "UTC",
      isTeleconsultation: true,
      videoJoinUrl: "https://teleconsult.carepulse.local/rooms/apt_integ_888?auth=token",
    },
  });

  const reminders = await reminderStore.getRemindersForAppointment("apt_integ_888");
  assert.strictEqual(reminders.length, 2);
  recordPass("CH03.1: DomainEventBus published APPOINTMENT_SCHEDULED; observer enqueued 24h and 2h reminders");

  // Check audit trail
  const audits = auditObserver.getAuditTrail();
  assert.strictEqual(audits.length, 1);
  recordPass("CH03.2: AuditLogObserver recorded event in chronological audit trail");

  // Simulate due-reminder sweep at T-20h (the 24h reminder is due!)
  const referenceTimeT20 = new Date(targetApptDate.getTime() - 20 * 60 * 60 * 1000);
  const sweep1 = await engine.processDueReminders(referenceTimeT20);
  assert.strictEqual(sweep1.sentCount, 1);
  assert.strictEqual(mockChannel.messages.length, 1);
  assert.ok(mockChannel.messages[0].text.includes("video consultation"));
  recordPass("CH03.3: ReminderProcessingEngine dispatched due teleconsultation reminder");

  // Immediate second sweep -> Duplicate Prevention test
  const sweep2 = await engine.processDueReminders(referenceTimeT20);
  assert.strictEqual(sweep2.sentCount, 0);
  assert.strictEqual(mockChannel.messages.length, 1, "No duplicate message sent");
  recordPass("CH03.4: Idempotency keys prevented duplicate delivery on re-execution");

  // Transient Failure & Retry Test
  const referenceTimeT1 = new Date(targetApptDate.getTime() - 1 * 60 * 60 * 1000);
  mockChannel.failOnce = true; // inject temporary failure
  const sweepFail = await engine.processDueReminders(referenceTimeT1);
  assert.strictEqual(sweepFail.failedCount, 1);
  recordPass("CH03.5: Transient dispatch failure captured and scheduled for retry");

  const sweepRetry = await engine.processDueReminders(referenceTimeT1);
  assert.strictEqual(sweepRetry.sentCount, 1);
  recordPass("CH03.6: Subsequent retry successfully delivered notification");

  // Cancellation invalidation test
  await bus.publish({
    eventId: "evt_integ_cancel",
    occurredAt: new Date(),
    eventType: "APPOINTMENT_CANCELLED",
    payload: {
      appointmentId: "apt_integ_888",
      patientId: "patient_888",
      cancellationReason: "Schedule conflict",
      cancelledAt: new Date(),
    },
  });
  const remindersAfterCancel = await reminderStore.getRemindersForAppointment("apt_integ_888");
  assert.ok(remindersAfterCancel.every((r) => r.status === "SENT" || r.status === "CANCELLED"));
  recordPass("CH03.7: APPOINTMENT_CANCELLED revoked remaining pending reminders");

  // Cleanup test file
  if (fs.existsSync(tempStoreFile)) fs.unlinkSync(tempStoreFile);

  console.log("\n================================================================================");
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: 0`);
  console.log("ALL INTEGRATION TESTS VERIFIED SUCCESSFULLY!");
  console.log("================================================================================\n");
}

runMasterTestSuite().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
