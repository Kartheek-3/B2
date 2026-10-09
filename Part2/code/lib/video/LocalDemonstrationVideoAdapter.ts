import { IVideoConsultationService } from "./IVideoConsultationService";
import {
  LocalDemonstrationVideoProvider,
  ProprietarySessionPayload,
} from "./LocalDemonstrationVideoProvider";
import {
  VideoRoomRequest,
  VideoRoomDetails,
  VideoParticipant,
  VideoSessionAccess,
} from "./types";

/**
 * Concrete Adapter (GoF Adapter Pattern)
 * Adapts the proprietary LocalDemonstrationVideoProvider into the
 * standardized IVideoConsultationService interface expected by CarePulse.
 */
export class LocalDemonstrationVideoAdapter implements IVideoConsultationService {
  private adaptee: LocalDemonstrationVideoProvider;

  constructor(adaptee?: LocalDemonstrationVideoProvider) {
    this.adaptee = adaptee || new LocalDemonstrationVideoProvider();
  }

  public async createRoom(request: VideoRoomRequest): Promise<VideoRoomDetails> {
    // Translate domain request into proprietary payload
    const proprietaryPayload: ProprietarySessionPayload = {
      sessionTag: request.appointmentId,
      startTimestampEpoch: request.scheduledTime.getTime(),
      hostIdentifier: request.doctorName,
      guestIdentifier: request.patientName,
      metadataPayload: {
        topic: request.topic || "General Teleconsultation",
      },
    };

    // Invoke adaptee proprietary API
    const response = await this.adaptee.initiateMeetingSession(proprietaryPayload);

    // Map proprietary response to domain VideoRoomDetails
    return {
      roomId: response.data.sessionId,
      roomUrl: response.data.rawEndpointUrl,
      provider: "LOCAL_DEMO",
      createdAt: new Date(response.data.initializedAt),
      scheduledTime: request.scheduledTime,
      doctorName: response.data.hostName,
      patientName: response.data.guestName,
      status: "CREATED",
    };
  }

  public async getRoomDetails(roomId: string): Promise<VideoRoomDetails | null> {
    const rawData = await this.adaptee.querySession(roomId);
    if (!rawData) return null;

    return {
      roomId: rawData.sessionId,
      roomUrl: rawData.rawEndpointUrl,
      provider: "LOCAL_DEMO",
      createdAt: new Date(rawData.initializedAt),
      scheduledTime: new Date(rawData.initializedAt),
      doctorName: rawData.hostName,
      patientName: rawData.guestName,
      status: rawData.state === "INITIALIZED" ? "CREATED" : "ACTIVE",
    };
  }

  public async generateParticipantAccess(
    roomId: string,
    participant: VideoParticipant
  ): Promise<VideoSessionAccess> {
    // Map domain roles to proprietary provider roles
    const proprietaryRole = participant.role === "doctor" ? "clinician" : "client";

    const tokenResponse = await this.adaptee.mintJoinToken(
      roomId,
      proprietaryRole,
      participant.name
    );

    return {
      roomId,
      joinUrl: tokenResponse.tokenData.accessLink,
      accessToken: tokenResponse.tokenData.jwtStub,
      expiresAt: new Date(tokenResponse.tokenData.validUntilEpoch),
      participant,
    };
  }

  public getProviderName(): string {
    return "LocalDemonstrationVideoAdapter (Mock/Local Demonstration Engine)";
  }
}
