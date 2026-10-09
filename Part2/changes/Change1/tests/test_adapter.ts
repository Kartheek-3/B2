import assert from "node:assert";
import { LocalDemonstrationVideoProvider } from "../../../code/lib/video/LocalDemonstrationVideoProvider";
import { LocalDemonstrationVideoAdapter } from "../../../code/lib/video/LocalDemonstrationVideoAdapter";
import { VideoServiceFactory } from "../../../code/lib/video/VideoServiceFactory";
import { VideoRoomRequest, VideoParticipant } from "../../../code/lib/video/types";

async function runAdapterTests() {
  console.log("=== Running CH01 Video Consultation Adapter Pattern Tests ===");

  const adaptee = new LocalDemonstrationVideoProvider();
  const adapter = new LocalDemonstrationVideoAdapter(adaptee);

  // Test 1: Adapter correctly adapts createRoom request to proprietary provider
  const request: VideoRoomRequest = {
    appointmentId: "apt_12345",
    doctorName: "Dr. Alex Ramirez",
    patientName: "John Doe",
    scheduledTime: new Date("2026-10-15T10:00:00Z"),
    topic: "Follow-up consultation",
  };

  const roomDetails = await adapter.createRoom(request);
  assert.ok(roomDetails.roomId.startsWith("ldv_room_apt_12345_"), "Room ID should match pattern");
  assert.strictEqual(roomDetails.provider, "LOCAL_DEMO");
  assert.strictEqual(roomDetails.doctorName, "Dr. Alex Ramirez");
  assert.strictEqual(roomDetails.patientName, "John Doe");
  assert.strictEqual(roomDetails.status, "CREATED");
  console.log("✔ Test 1 Passed: createRoom correctly adapted and populated domain model");

  // Test 2: Adaptee session state verification through adapter query
  const queriedRoom = await adapter.getRoomDetails(roomDetails.roomId);
  assert.ok(queriedRoom !== null, "Queried room must exist");
  assert.strictEqual(queriedRoom?.roomId, roomDetails.roomId);
  assert.strictEqual(queriedRoom?.doctorName, "Dr. Alex Ramirez");
  console.log("✔ Test 2 Passed: getRoomDetails retrieves adapted session data");

  // Test 3: Generate participant token with role translation
  const doctorParticipant: VideoParticipant = {
    userId: "doc_999",
    name: "Dr. Alex Ramirez",
    role: "doctor",
  };

  const patientParticipant: VideoParticipant = {
    userId: "pat_888",
    name: "John Doe",
    role: "patient",
  };

  const doctorAccess = await adapter.generateParticipantAccess(roomDetails.roomId, doctorParticipant);
  assert.ok(doctorAccess.accessToken.startsWith("ldv.tok."), "Token should start with ldv.tok.");
  assert.ok(doctorAccess.joinUrl.includes("role=clinician"), "Doctor role must be mapped to clinician");

  const patientAccess = await adapter.generateParticipantAccess(roomDetails.roomId, patientParticipant);
  assert.ok(patientAccess.joinUrl.includes("role=client"), "Patient role must be mapped to client");
  console.log("✔ Test 3 Passed: Role translation and token generation verified");

  // Test 4: Factory returns singleton adapter
  VideoServiceFactory.reset();
  const defaultService = VideoServiceFactory.getVideoService();
  assert.ok(defaultService instanceof LocalDemonstrationVideoAdapter, "Factory defaults to LocalDemonstrationVideoAdapter");
  console.log("✔ Test 4 Passed: VideoServiceFactory returns configured adapter instance");

  // Test 5: Error handling for non-existent session
  await assert.rejects(
    async () => {
      await adapter.generateParticipantAccess("non_existent_room_id", doctorParticipant);
    },
    /Session not found/,
    "Should reject when session ID is missing"
  );
  console.log("✔ Test 5 Passed: Non-existent session throws descriptive error");

  console.log("All 5 CH01 Adapter pattern tests passed successfully.\n");
}

runAdapterTests().catch((err) => {
  console.error("Adapter tests failed:", err);
  process.exit(1);
});
