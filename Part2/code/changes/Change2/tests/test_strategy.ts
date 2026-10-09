import assert from "node:assert";
import { StandardBusinessHoursStrategy } from "../strategy/StandardBusinessHoursStrategy";
import { ShiftBasedAvailabilityStrategy } from "../strategy/ShiftBasedAvailabilityStrategy";
import { EmergencyOnCallAvailabilityStrategy } from "../strategy/EmergencyOnCallAvailabilityStrategy";
import { DoctorAvailabilityContext } from "../strategy/DoctorAvailabilityContext";
import {
  DoctorAvailabilityConfig,
  ExistingBooking,
  SlotValidationRequest,
} from "../types/availability.types";

function runStrategyTests() {
  console.log("=== Running CH02 Doctor Availability Strategy Pattern Tests ===");

  const existingBookings: ExistingBooking[] = [
    {
      appointmentId: "apt_existing_1",
      doctorName: "Dr. John Green",
      schedule: new Date("2026-10-14T10:00:00.000Z"), // A Wednesday
      durationMinutes: 30,
      status: "scheduled",
    },
  ];

  // -------------------------------------------------------------
  // Test Suite 1: StandardBusinessHoursStrategy
  // -------------------------------------------------------------
  const standardConfig: DoctorAvailabilityConfig = {
    doctorName: "Dr. John Green",
    strategyType: "STANDARD_BUSINESS_HOURS",
    slotDurationMinutes: 30,
  };
  const standardStrategy = new StandardBusinessHoursStrategy();

  // 1.1: Valid weekday morning slot (Wednesday 09:30 UTC / local hour)
  const wednesday930 = new Date("2026-10-14T09:30:00");
  const res1 = standardStrategy.validateSlot(
    { doctorName: "Dr. John Green", requestedTime: wednesday930, durationMinutes: 30 },
    standardConfig,
    []
  );
  assert.strictEqual(res1.isValid, true, "Standard hours weekday 09:30 should be valid");
  console.log("✔ Test 1.1 Passed: StandardBusinessHours accepts valid weekday outpatient slot");

  // 1.2: Weekend rejection (Saturday 2026-10-17)
  const saturday = new Date("2026-10-17T10:00:00");
  const resWeekend = standardStrategy.validateSlot(
    { doctorName: "Dr. John Green", requestedTime: saturday, durationMinutes: 30 },
    standardConfig,
    []
  );
  assert.strictEqual(resWeekend.isValid, false, "Weekend should be rejected");
  assert.ok(resWeekend.reason?.includes("Monday to Friday"), "Reason should specify weekday restriction");
  console.log("✔ Test 1.2 Passed: StandardBusinessHours rejects weekend slot");

  // 1.3: Lunch break rejection (12:30)
  const lunchSlot = new Date("2026-10-14T12:30:00");
  const resLunch = standardStrategy.validateSlot(
    { doctorName: "Dr. John Green", requestedTime: lunchSlot, durationMinutes: 30 },
    standardConfig,
    []
  );
  assert.strictEqual(resLunch.isValid, false, "Lunch break should be rejected");
  assert.ok(resLunch.reason?.includes("scheduled break"), "Reason should cite break window");
  console.log("✔ Test 1.3 Passed: StandardBusinessHours rejects scheduled lunch break");

  // 1.4: Existing booking collision
  const collisionSlot = new Date("2026-10-14T10:00:00.000Z");
  const resCollision = standardStrategy.validateSlot(
    { doctorName: "Dr. John Green", requestedTime: collisionSlot, durationMinutes: 30 },
    standardConfig,
    existingBookings
  );
  assert.strictEqual(resCollision.isValid, false, "Overlapping booking must be rejected");
  console.log("✔ Test 1.4 Passed: StandardBusinessHours rejects overlapping booking");

  // -------------------------------------------------------------
  // Test Suite 2: ShiftBasedAvailabilityStrategy
  // -------------------------------------------------------------
  const shiftConfig: DoctorAvailabilityConfig = {
    doctorName: "Dr. Leila Cameron",
    strategyType: "SHIFT_BASED",
    assignedShifts: [
      { dayOfWeek: 3, shiftStartHour: 7, shiftEndHour: 15 }, // Wednesday morning shift: 07:00 - 15:00
      { dayOfWeek: 5, shiftStartHour: 15, shiftEndHour: 23 }, // Friday evening shift: 15:00 - 23:00
    ],
    slotDurationMinutes: 45,
  };
  const shiftStrategy = new ShiftBasedAvailabilityStrategy();

  // 2.1: Valid slot within Wednesday morning shift (08:00)
  const wedMorningSlot = new Date("2026-10-14T08:00:00");
  const resShiftValid = shiftStrategy.validateSlot(
    { doctorName: "Dr. Leila Cameron", requestedTime: wedMorningSlot, durationMinutes: 45 },
    shiftConfig,
    []
  );
  assert.strictEqual(resShiftValid.isValid, true, "Slot within morning shift must be valid");
  console.log("✔ Test 2.1 Passed: ShiftBasedStrategy accepts slot inside active roster shift");

  // 2.2: Slot outside shift hours (Wednesday 16:00 when shift ended at 15:00)
  const wedAfterShiftSlot = new Date("2026-10-14T16:00:00");
  const resShiftLate = shiftStrategy.validateSlot(
    { doctorName: "Dr. Leila Cameron", requestedTime: wedAfterShiftSlot, durationMinutes: 45 },
    shiftConfig,
    []
  );
  assert.strictEqual(resShiftLate.isValid, false, "Slot outside shift window must be rejected");
  console.log("✔ Test 2.2 Passed: ShiftBasedStrategy rejects slot outside assigned shift hours");

  // 2.3: Day with no assigned shift (Thursday 2026-10-15 = day 4)
  const thursdaySlot = new Date("2026-10-15T09:00:00");
  const resNoShift = shiftStrategy.validateSlot(
    { doctorName: "Dr. Leila Cameron", requestedTime: thursdaySlot, durationMinutes: 45 },
    shiftConfig,
    []
  );
  assert.strictEqual(resNoShift.isValid, false, "Day with no assigned shift must be rejected");
  console.log("✔ Test 2.3 Passed: ShiftBasedStrategy rejects days without assigned roster");

  // -------------------------------------------------------------
  // Test Suite 3: EmergencyOnCallAvailabilityStrategy
  // -------------------------------------------------------------
  const emergencyConfig: DoctorAvailabilityConfig = {
    doctorName: "Dr. Evan Peter",
    strategyType: "EMERGENCY_ON_CALL",
    emergencyBufferMinutes: 15,
    slotDurationMinutes: 20,
  };
  const emergencyStrategy = new EmergencyOnCallAvailabilityStrategy();

  const emergencyBookings: ExistingBooking[] = [
    {
      appointmentId: "apt_em_1",
      doctorName: "Dr. Evan Peter",
      schedule: new Date("2026-10-18T02:00:00"), // Sunday 02:00 AM
      durationMinutes: 20,
      status: "scheduled",
    },
  ];

  // 3.1: 24/7 weekend late-night emergency slot outside buffer (Sunday 04:00 AM)
  const lateNightSlot = new Date("2026-10-18T04:00:00");
  const res24_7 = emergencyStrategy.validateSlot(
    { doctorName: "Dr. Evan Peter", requestedTime: lateNightSlot, durationMinutes: 20 },
    emergencyConfig,
    emergencyBookings
  );
  assert.strictEqual(res24_7.isValid, true, "Emergency on-call should be valid 24/7 outside buffer");
  console.log("✔ Test 3.1 Passed: EmergencyOnCallStrategy permits 24/7 weekend/late-night emergency slots");

  // 3.2: Buffer violation (02:25 AM when previous ended at 02:20 AM and 15 min buffer ends at 02:35 AM)
  const bufferViolatingSlot = new Date("2026-10-18T02:25:00");
  const resBuffer = emergencyStrategy.validateSlot(
    { doctorName: "Dr. Evan Peter", requestedTime: bufferViolatingSlot, durationMinutes: 20 },
    emergencyConfig,
    emergencyBookings
  );
  assert.strictEqual(resBuffer.isValid, false, "Slot inside 15-min recovery buffer must be rejected");
  assert.ok(resBuffer.reason?.includes("buffer"), "Reason must mention emergency buffer");
  console.log("✔ Test 3.2 Passed: EmergencyOnCallStrategy rejects slot encroaching on 15-min recovery buffer");

  // -------------------------------------------------------------
  // Test Suite 4: Context Runtime Interchangeability
  // -------------------------------------------------------------
  const testSlot = new Date("2026-10-18T04:00:00"); // Sunday 04:00 AM
  const context = new DoctorAvailabilityContext(new StandardBusinessHoursStrategy());

  // Under StandardBusinessHours: Sunday is rejected
  const standardEval = context.validateSlot(
    { doctorName: "Dr. David Livingston", requestedTime: testSlot, durationMinutes: 30 },
    { doctorName: "Dr. David Livingston", strategyType: "STANDARD_BUSINESS_HOURS" },
    []
  );
  assert.strictEqual(standardEval.isValid, false, "Must fail under Standard Business Hours");

  // Swap to EmergencyOnCall at runtime: Sunday 04:00 AM is ACCEPTED
  context.setStrategy(new EmergencyOnCallAvailabilityStrategy());
  const emergencyEval = context.validateSlot(
    { doctorName: "Dr. David Livingston", requestedTime: testSlot, durationMinutes: 30 },
    { doctorName: "Dr. David Livingston", strategyType: "EMERGENCY_ON_CALL", emergencyBufferMinutes: 15 },
    []
  );
  assert.strictEqual(emergencyEval.isValid, true, "Must pass after dynamically swapping to Emergency strategy");
  console.log("✔ Test 4 Passed: DoctorAvailabilityContext dynamically swaps strategies at runtime with polymorphic behavior");

  console.log("All CH02 Strategy pattern tests passed successfully.\n");
}

runStrategyTests();
