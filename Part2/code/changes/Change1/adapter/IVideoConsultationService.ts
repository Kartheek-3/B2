import {
  VideoRoomRequest,
  VideoRoomDetails,
  VideoParticipant,
  VideoSessionAccess,
} from "../types/video.types";

/**
 * Target Interface (GoF Adapter Pattern)
 * Defines the domain-specific contract that the healthcare appointment
 * management system expects for video teleconsultations.
 */
export interface IVideoConsultationService {
  /**
   * Create a dedicated teleconsultation room for an appointment.
   */
  createRoom(request: VideoRoomRequest): Promise<VideoRoomDetails>;

  /**
   * Retrieve existing room details by room identifier.
   */
  getRoomDetails(roomId: string): Promise<VideoRoomDetails | null>;

  /**
   * Generate secure participant access credentials and join URL.
   */
  generateParticipantAccess(
    roomId: string,
    participant: VideoParticipant
  ): Promise<VideoSessionAccess>;

  /**
   * Returns the identifier of the active underlying provider adapter.
   */
  getProviderName(): string;
}
