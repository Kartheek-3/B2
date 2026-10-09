export type VideoProviderType = "LOCAL_DEMO" | "EXTERNAL_STUB";

export interface VideoParticipant {
  userId: string;
  name: string;
  role: "doctor" | "patient";
}

export interface VideoRoomRequest {
  appointmentId: string;
  doctorName: string;
  patientName: string;
  scheduledTime: Date;
  topic?: string;
}

export interface VideoRoomDetails {
  roomId: string;
  roomUrl: string;
  provider: VideoProviderType;
  createdAt: Date;
  scheduledTime: Date;
  doctorName: string;
  patientName: string;
  status: "CREATED" | "ACTIVE" | "COMPLETED";
}

export interface VideoSessionAccess {
  roomId: string;
  joinUrl: string;
  accessToken: string;
  expiresAt: Date;
  participant: VideoParticipant;
}
